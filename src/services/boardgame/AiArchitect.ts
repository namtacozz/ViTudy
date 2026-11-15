import {
  FieldValue,
  GamePackageV2,
  Rule,
  runBatchSimulation,
  validateGamePackage,
} from '@/engine/boardgame';

export const AI_MATERIAL_CATALOG = {
  zoneLayouts: ['grid', 'hex', 'graph', 'stack', 'list', 'free'],
  visibilities: ['public', 'owner', 'hidden'],
  triggers: [
    'game_start', 'turn_start', 'turn_end', 'phase_enter',
    'piece_enter', 'piece_leave', 'dice_rolled', 'card_played',
    'counter_changed', 'button_pressed', 'zone_empty', 'rule_fired',
  ],
  actions: [
    'move_piece', 'draw', 'discard', 'shuffle', 'deal',
    'transfer', 'set_counter', 'set_field', 'set_owner', 'spawn',
    'destroy', 'flip', 'rotate', 'roll', 'skip_turn',
    'extra_turn', 'reverse_order', 'set_phase', 'next_turn',
    'prompt_choice', 'prompt_pick', 'show_panel', 'end_game', 'run_rule', 'log',
  ],
} as const;

export interface DeepValidationReport {
  valid: boolean;
  issues: string[];
}

/**
 * Validates schema + orphan refs + unreachable rules + dead counters (Cluster I).
 */
export function validateAiPackageDeep(pkg: GamePackageV2): DeepValidationReport {
  const schemaCheck = validateGamePackage(pkg);
  const issues: string[] = schemaCheck.errors.map((e) => `${e.path}: ${e.message}`);

  const buttonIds = new Set(pkg.ui?.buttons?.map((b) => b.id) || []);
  const touchedCounters = new Set<string>();

  for (const rule of pkg.rules || []) {
    if (
      rule.trigger === 'button_pressed' &&
      rule.scope?.entityId &&
      !buttonIds.has(rule.scope.entityId)
    ) {
      issues.push(
        `Unreachable rule "${rule.id}": button "${rule.scope.entityId}" is missing from ui.buttons`
      );
    }
    for (const act of rule.actions || []) {
      if ((act.type === 'transfer' || act.type === 'set_counter') && act.params?.counterId) {
        touchedCounters.add(String(act.params.counterId));
      }
    }
  }

  for (const counter of pkg.counters || []) {
    if ((counter.min !== undefined || counter.max !== undefined) && !touchedCounters.has(counter.id)) {
      issues.push(`Counter "${counter.id}" has no rule that increases or decreases it`);
    }
  }

  return { valid: issues.length === 0, issues };
}

export interface AiArchitectDeps {
  callAiJson: (systemPrompt: string, userPrompt: string) => Promise<unknown>;
  debitViToken: (requestId: string, cost: number) => Promise<{ ok: boolean; error?: string }>;
}

export interface AiArchitectResult {
  ok: boolean;
  pkg?: GamePackageV2;
  attempts: number;
  issues: string[];
  chargedViToken: number;
}

/**
 * AI Architect pipeline (Cluster I):
 * 1. Send material catalog & v2 schema.
 * 2. Deep validate + run headless bot simulation.
 * 3. Retry up to 2 repair rounds with diagnostic report.
 * 4. Debit ViToken idempotently ONLY after passing verification.
 */
export async function architectGameWithAi(params: {
  prompt: string;
  requestId: string;
  viTokenCost: number;
  deps: AiArchitectDeps;
  simMatches?: number;
}): Promise<AiArchitectResult> {
  const maxAttempts = 3; // initial + up to 2 repair rounds
  const simMatches = params.simMatches ?? 40;
  let lastIssues: string[] = [];
  let candidate: GamePackageV2 | null = null;

  const systemPrompt = `You are ViTudy BoardGame Architect. Output ONLY valid GamePackageV2 JSON using catalog: ${JSON.stringify(AI_MATERIAL_CATALOG)}.`;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const userPrompt =
      attempt === 1
        ? `Design a complete GamePackageV2 for: ${params.prompt}`
        : `Fix these issues in the previous GamePackageV2 JSON:\n${lastIssues.join('\n')}\nPrevious JSON:\n${JSON.stringify(candidate)}`;

    const raw = await params.deps.callAiJson(systemPrompt, userPrompt);
    candidate = raw as GamePackageV2;

    const deep = validateAiPackageDeep(candidate);
    if (!deep.valid) {
      lastIssues = deep.issues;
      continue;
    }

    const sim = runBatchSimulation(candidate, simMatches, 1, 150);
    if (sim.stuckCount > 0 || sim.violationCount > 0) {
      lastIssues = [
        ...(sim.stuckCount > 0 ? [`Bot simulation stuck in ${sim.stuckCount}/${sim.total} matches`] : []),
        ...sim.violations,
      ];
      continue;
    }

    const debit = await params.deps.debitViToken(params.requestId, params.viTokenCost);
    if (!debit.ok) {
      return {
        ok: false,
        attempts: attempt,
        issues: [debit.error || 'ViToken debit failed'],
        chargedViToken: 0,
      };
    }

    return {
      ok: true,
      pkg: candidate,
      attempts: attempt,
      issues: [],
      chargedViToken: params.viTokenCost,
    };
  }

  return {
    ok: false,
    attempts: maxAttempts,
    issues: lastIssues,
    chargedViToken: 0,
  };
}

export interface EditorEntityDiff {
  kind: 'add_rule' | 'set_field';
  rule?: Rule;
  entityId?: string;
  fieldKey?: string;
  fieldValue?: FieldValue;
}

/**
 * Editor AI Assistant mode: produces a single previewable Rule or Field diff for a selected entity.
 */
export async function generateSingleEntityDiffWithAi(params: {
  entityId: string;
  instruction: string;
  pkg: GamePackageV2;
  callAiJson: (systemPrompt: string, userPrompt: string) => Promise<unknown>;
}): Promise<EditorEntityDiff> {
  const systemPrompt = `Produce a single EditorEntityDiff JSON ({ kind: "add_rule", rule } or { kind: "set_field", entityId, fieldKey, fieldValue }) using catalog actions: ${AI_MATERIAL_CATALOG.actions.join(', ')}.`;
  const userPrompt = `Target entity: ${params.entityId}. Instruction: ${params.instruction}. Existing rules count: ${params.pkg.rules.length}.`;
  const diff = (await params.callAiJson(systemPrompt, userPrompt)) as EditorEntityDiff;
  return diff;
}

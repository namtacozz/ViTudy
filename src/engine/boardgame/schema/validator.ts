import {
  ActionType,
  GamePackageV2,
  TriggerType,
  isRef,
} from './types';

export interface ValidationError {
  path: string;
  message: string;
}

const VALID_LAYOUTS = new Set(['grid', 'hex', 'graph', 'stack', 'list', 'free']);
const VALID_VISIBILITIES = new Set(['public', 'owner', 'hidden']);
const VALID_TRIGGERS = new Set<TriggerType>([
  'game_start',
  'turn_start',
  'turn_end',
  'phase_enter',
  'piece_enter',
  'piece_leave',
  'dice_rolled',
  'card_played',
  'counter_changed',
  'button_pressed',
  'zone_empty',
  'rule_fired',
]);
const VALID_ACTIONS = new Set<ActionType>([
  'move_piece',
  'draw',
  'discard',
  'shuffle',
  'deal',
  'transfer',
  'set_counter',
  'set_field',
  'set_owner',
  'spawn',
  'destroy',
  'flip',
  'rotate',
  'roll',
  'skip_turn',
  'extra_turn',
  'reverse_order',
  'set_phase',
  'next_turn',
  'prompt_choice',
  'prompt_pick',
  'show_panel',
  'end_game',
  'run_rule',
  'log',
]);

export function validateGamePackage(input: unknown): {
  valid: boolean;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: [{ path: '', message: 'Package must be an object' }] };
  }

  const pkg = input as Partial<GamePackageV2>;
  if (pkg.schemaVersion !== 2) {
    errors.push({ path: 'schemaVersion', message: 'schemaVersion must be 2' });
  }
  if (!pkg.id || typeof pkg.id !== 'string') {
    errors.push({ path: 'id', message: 'id is required and must be a string' });
  }
  if (!pkg.title || typeof pkg.title !== 'string') {
    errors.push({ path: 'title', message: 'title is required' });
  }

  const allEntityIds = new Set<string>();
  const zoneIds = new Set<string>();
  const playerIds = new Set<string>();
  const counterIds = new Set<string>();
  const ruleIds = new Set<string>();

  const registerId = (id: unknown, path: string, bucket?: Set<string>) => {
    if (!id || typeof id !== 'string') {
      errors.push({ path, message: 'id must be a non-empty string' });
      return;
    }
    if (allEntityIds.has(id)) {
      errors.push({ path, message: `Duplicate entity id "${id}"` });
    }
    allEntityIds.add(id);
    bucket?.add(id);
  };

  if (!Array.isArray(pkg.zones)) {
    errors.push({ path: 'zones', message: 'zones must be an array' });
  } else {
    pkg.zones.forEach((z, i) => {
      registerId(z?.id, `zones[${i}].id`, zoneIds);
      if (!VALID_LAYOUTS.has(z?.layout)) {
        errors.push({ path: `zones[${i}].layout`, message: `Invalid layout "${z?.layout}"` });
      }
      if (!VALID_VISIBILITIES.has(z?.visibility)) {
        errors.push({
          path: `zones[${i}].visibility`,
          message: `Invalid visibility "${z?.visibility}"`,
        });
      }
    });
  }

  if (!Array.isArray(pkg.players)) {
    errors.push({ path: 'players', message: 'players must be an array' });
  } else {
    pkg.players.forEach((p, i) => {
      registerId(p?.id, `players[${i}].id`, playerIds);
    });
  }

  if (!Array.isArray(pkg.counters)) {
    errors.push({ path: 'counters', message: 'counters must be an array' });
  } else {
    pkg.counters.forEach((c, i) => {
      registerId(c?.id, `counters[${i}].id`, counterIds);
      if (c?.min !== undefined && c?.max !== undefined && c.min > c.max) {
        errors.push({ path: `counters[${i}]`, message: 'min cannot exceed max' });
      }
      if (c?.kind === 'denominated' && (!Array.isArray(c.denominations) || c.denominations.length === 0)) {
        errors.push({
          path: `counters[${i}].denominations`,
          message: 'denominated counter requires non-empty denominations',
        });
      }
    });
  }

  if (!Array.isArray(pkg.pieces)) {
    errors.push({ path: 'pieces', message: 'pieces must be an array' });
  } else {
    pkg.pieces.forEach((piece, i) => {
      registerId(piece?.id, `pieces[${i}].id`);
      if (!Array.isArray(piece?.faces) || piece.faces.length === 0) {
        errors.push({ path: `pieces[${i}].faces`, message: 'piece must have at least 1 face' });
      }
    });
  }

  if (!Array.isArray(pkg.randomizers)) {
    errors.push({ path: 'randomizers', message: 'randomizers must be an array' });
  } else {
    pkg.randomizers.forEach((r, i) => {
      registerId(r?.id, `randomizers[${i}].id`);
    });
  }

  // Reference integrity checks after collecting IDs
  pkg.zones?.forEach((z, i) => {
    if (z.ownerId && !playerIds.has(z.ownerId)) {
      errors.push({ path: `zones[${i}].ownerId`, message: `Unknown player "${z.ownerId}"` });
    }
    z.neighbors?.forEach((nid, ni) => {
      if (!zoneIds.has(nid)) {
        errors.push({
          path: `zones[${i}].neighbors[${ni}]`,
          message: `Unknown neighbor zone "${nid}"`,
        });
      }
    });
    Object.entries(z.fields || {}).forEach(([k, v]) => {
      if (isRef(v) && !allEntityIds.has(v.$ref)) {
        errors.push({
          path: `zones[${i}].fields.${k}`,
          message: `Orphan $ref "${v.$ref}"`,
        });
      }
    });
  });

  pkg.players?.forEach((p, i) => {
    if (p.handZoneId && !zoneIds.has(p.handZoneId)) {
      errors.push({
        path: `players[${i}].handZoneId`,
        message: `Unknown handZoneId "${p.handZoneId}"`,
      });
    }
  });

  pkg.pieces?.forEach((piece, i) => {
    if (piece.zoneId && !zoneIds.has(piece.zoneId)) {
      errors.push({
        path: `pieces[${i}].zoneId`,
        message: `Unknown zoneId "${piece.zoneId}"`,
      });
    }
    if (piece.ownerId && !playerIds.has(piece.ownerId)) {
      errors.push({
        path: `pieces[${i}].ownerId`,
        message: `Unknown ownerId "${piece.ownerId}"`,
      });
    }
    Object.entries(piece.fields || {}).forEach(([k, v]) => {
      if (isRef(v) && !allEntityIds.has(v.$ref)) {
        errors.push({
          path: `pieces[${i}].fields.${k}`,
          message: `Orphan $ref "${v.$ref}"`,
        });
      }
    });
  });

  if (!pkg.turnConfig || !Array.isArray(pkg.turnConfig.phases) || pkg.turnConfig.phases.length === 0) {
    errors.push({ path: 'turnConfig.phases', message: 'turnConfig must have at least 1 phase' });
  } else {
    const phaseIds = new Set(pkg.turnConfig.phases.map((p) => p.id));
    for (const p of pkg.turnConfig.phases) {
      if (p?.id) allEntityIds.add(p.id);
    }
    if (!phaseIds.has(pkg.turnConfig.initialPhase)) {
      errors.push({
        path: 'turnConfig.initialPhase',
        message: `initialPhase "${pkg.turnConfig.initialPhase}" not found in phases`,
      });
    }
  }

  pkg.ui?.buttons?.forEach((b) => {
    if (b?.id) allEntityIds.add(b.id);
  });
  pkg.ui?.panels?.forEach((p) => {
    if (p?.id) allEntityIds.add(p.id);
  });

  if (!Array.isArray(pkg.rules)) {
    errors.push({ path: 'rules', message: 'rules must be an array' });
  } else {
    pkg.rules.forEach((r) => {
      if (r?.id) allEntityIds.add(r.id);
    });
    pkg.rules.forEach((r, i) => {
      if (!r?.id) {
        errors.push({ path: `rules[${i}].id`, message: 'rule id is required' });
      } else if (ruleIds.has(r.id)) {
        errors.push({ path: `rules[${i}].id`, message: `Duplicate rule id "${r.id}"` });
      } else {
        ruleIds.add(r.id);
      }
      if (!VALID_TRIGGERS.has(r?.trigger)) {
        errors.push({ path: `rules[${i}].trigger`, message: `Invalid trigger "${r?.trigger}"` });
      }
      if (!Array.isArray(r?.actions)) {
        errors.push({ path: `rules[${i}].actions`, message: 'actions must be an array' });
      } else {
        r.actions.forEach((a, ai) => {
          if (!VALID_ACTIONS.has(a?.type)) {
            errors.push({
              path: `rules[${i}].actions[${ai}].type`,
              message: `Invalid action type "${a?.type}"`,
            });
          }
        });
      }
      if (r?.scope?.entityId && !allEntityIds.has(r.scope.entityId)) {
        errors.push({
          path: `rules[${i}].scope.entityId`,
          message: `Unknown scope entity "${r.scope.entityId}"`,
        });
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

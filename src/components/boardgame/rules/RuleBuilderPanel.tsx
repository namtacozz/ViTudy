'use client';

import React, { useState } from 'react';
import {
  ActionType,
  EngineState,
  GamePackageV2,
  Rule,
  TriggerType,
  reduce,
} from '@/engine/boardgame';
import { describeRuleInVietnamese } from './ruleTranslator';
import { Play, ChevronDown, ChevronRight, Plus } from 'lucide-react';

interface RuleBuilderPanelProps {
  pkg: GamePackageV2;
  state: EngineState;
  onChangeRules: (rules: Rule[]) => void;
}

const ALL_TRIGGERS: TriggerType[] = [
  'game_start', 'turn_start', 'turn_end', 'phase_enter',
  'piece_enter', 'piece_leave', 'dice_rolled', 'card_played',
  'counter_changed', 'button_pressed', 'zone_empty', 'rule_fired',
];

const ALL_ACTIONS: ActionType[] = [
  'move_piece', 'draw', 'discard', 'shuffle', 'deal',
  'transfer', 'set_counter', 'set_field', 'set_owner', 'spawn',
  'destroy', 'flip', 'rotate', 'roll', 'skip_turn',
  'extra_turn', 'reverse_order', 'set_phase', 'next_turn',
  'prompt_choice', 'prompt_pick', 'show_panel', 'end_game', 'run_rule', 'log',
];

/**
 * Two-tier Rule Editor (Cluster H):
 * Tier 1 (default): Human-readable Vietnamese rules + 1-click dry-run test.
 * Tier 2 (collapsed): Block builder for Trigger -> Scope -> Action.
 */
export function RuleBuilderPanel({ pkg, state, onChangeRules }: RuleBuilderPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  const [newTrigger, setNewTrigger] = useState<TriggerType>('piece_enter');
  const [newScopeTag, setNewScopeTag] = useState('');
  const [newAction, setNewAction] = useState<ActionType>('log');
  const [newParamsJson, setNewParamsJson] = useState('{"message": "Luật đã chạy"}');

  const handleToggleRule = (id: string) => {
    onChangeRules(
      pkg.rules.map((r) => (r.id === id ? { ...r, enabled: r.enabled === false } : r))
    );
  };

  const handleTestRule = (ruleId: string) => {
    const res = reduce(
      state,
      { type: 'exec', spec: { type: 'run_rule', params: { ruleId } } },
      pkg
    );
    if (res.error) {
      setTestFeedback(`Lỗi khi chạy thử "${ruleId}": ${res.error}`);
    } else {
      setTestFeedback(
        `Đã chạy thử "${ruleId}": phát sinh ${res.events.length} sự kiện (tick ${res.state.tick}).`
      );
    }
  };

  const handleAddBlockRule = () => {
    let params: Record<string, unknown> = {};
    try {
      params = JSON.parse(newParamsJson || '{}');
    } catch {
      setTestFeedback('JSON tham số không hợp lệ.');
      return;
    }

    const rule: Rule = {
      id: `rule-custom-${pkg.rules.length + 1}`,
      trigger: newTrigger,
      ...(newScopeTag.trim() ? { scope: { tag: newScopeTag.trim() } } : {}),
      priority: 10,
      actions: [{ type: newAction, params }],
    };
    onChangeRules([...pkg.rules, rule]);
    setTestFeedback(`Đã thêm luật ${rule.id}.`);
  };

  return (
    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-black text-slate-900">Danh sách luật ({pkg.rules.length})</span>
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E0562D] cursor-pointer"
        >
          {showAdvanced ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          Trình soạn khối nâng cao
        </button>
      </div>

      {testFeedback && (
        <div className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-semibold">
          {testFeedback}
        </div>
      )}

      {/* Tier 1: Readable Vietnamese rules */}
      <div className="space-y-1.5 max-h-60 overflow-y-auto">
        {pkg.rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-2 rounded-xl border flex items-start justify-between gap-2 ${
              rule.enabled === false ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200'
            }`}
          >
            <div className="space-y-0.5 min-w-0">
              <div className="font-bold text-slate-800 truncate">{rule.name || rule.id}</div>
              <div className="text-[11px] text-slate-600">{describeRuleInVietnamese(rule)}</div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                title="Chạy thử luật này trên state hiện tại"
                onClick={() => handleTestRule(rule.id)}
                className="p-1.5 rounded-lg bg-[#FFF7ED] text-[#E0562D] hover:bg-orange-100 cursor-pointer"
              >
                <Play className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleToggleRule(rule.id)}
                className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 cursor-pointer"
              >
                {rule.enabled === false ? 'Bật' : 'Tắt'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tier 2: Advanced Block Builder */}
      {showAdvanced && (
        <div className="pt-2.5 border-t border-slate-200 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Trigger</label>
              <select
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value as TriggerType)}
                className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white font-semibold"
              >
                {ALL_TRIGGERS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Scope Tag (tùy chọn)</label>
              <input
                type="text"
                value={newScopeTag}
                onChange={(e) => setNewScopeTag(e.target.value)}
                placeholder="VD: trap, property"
                className="w-full px-2 py-1 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Action</label>
            <select
              value={newAction}
              onChange={(e) => setNewAction(e.target.value as ActionType)}
              className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white font-semibold"
            >
              {ALL_ACTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Params (JSON)</label>
            <textarea
              rows={2}
              value={newParamsJson}
              onChange={(e) => setNewParamsJson(e.target.value)}
              className="w-full px-2 py-1 rounded-lg border border-slate-200 font-mono text-[11px]"
            />
          </div>

          <button
            type="button"
            onClick={handleAddBlockRule}
            className="w-full py-1.5 rounded-xl bg-slate-900 text-white font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm khối luật
          </button>
        </div>
      )}
    </div>
  );
}

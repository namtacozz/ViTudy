'use client';

import React, { useState } from 'react';
import {
  ActionType,
  EntityId,
  GamePackageV2,
  Rule,
  TriggerType,
} from '@/engine/boardgame';
import { Link2 } from 'lucide-react';

interface QuickRuleLinkerProps {
  pkg: GamePackageV2;
  onAddRule: (rule: Rule) => void;
}

const SUGGESTED_LINKS: {
  id: string;
  label: string;
  trigger: TriggerType;
  action: ActionType;
}[] = [
  { id: 'teleport', label: 'Bước vào ô nguồn → Dịch chuyển tới ô đích', trigger: 'piece_enter', action: 'move_piece' },
  { id: 'draw', label: 'Bước vào ô nguồn → Rút thẻ từ bộ bài đích', trigger: 'piece_enter', action: 'draw' },
  { id: 'panel', label: 'Bước vào ô nguồn → Hiện bảng thông tin', trigger: 'piece_enter', action: 'show_panel' },
  { id: 'skip', label: 'Bước vào ô nguồn → Mất 1 lượt', trigger: 'piece_enter', action: 'skip_turn' },
];

/**
 * Visual quick-link tool: pick source & target entities to generate a Rule (Cluster G).
 */
export function QuickRuleLinker({ pkg, onAddRule }: QuickRuleLinkerProps) {
  const [sourceId, setSourceId] = useState<EntityId>(pkg.zones[0]?.id || '');
  const [targetId, setTargetId] = useState<EntityId>(pkg.zones[1]?.id || pkg.zones[0]?.id || '');
  const [presetId, setPresetId] = useState<string>(SUGGESTED_LINKS[0].id);

  const handleCreate = () => {
    if (!sourceId) return;
    const preset = SUGGESTED_LINKS.find((p) => p.id === presetId) || SUGGESTED_LINKS[0];
    const ruleId = `rule-link-${sourceId}-${targetId}-${pkg.rules.length + 1}`;

    let actionParams: Record<string, unknown> = {};
    if (preset.action === 'move_piece') {
      actionParams = { pieceId: { ref: '$piece' }, toZoneId: targetId };
    } else if (preset.action === 'draw') {
      actionParams = {
        fromZoneId: targetId,
        toZoneId: { fn: 'field', args: [{ ref: '$player' }, 'handZoneId'] },
        count: 1,
      };
    } else if (preset.action === 'show_panel') {
      const targetName = pkg.zones.find((z) => z.id === targetId)?.name || targetId;
      actionParams = { id: `panel-${targetId}`, title: targetName, body: `Thông tin liên kết từ ${sourceId}` };
    } else if (preset.action === 'skip_turn') {
      actionParams = { playerId: { ref: '$player' }, count: 1 };
    }

    onAddRule({
      id: ruleId,
      name: preset.label,
      trigger: preset.trigger,
      scope: { entityId: sourceId },
      priority: 10,
      actions: [{ type: preset.action, params: actionParams }],
    });
  };

  return (
    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5 text-xs">
      <div className="font-black text-slate-900 flex items-center gap-1.5">
        <Link2 className="w-4 h-4 text-[#E0562D]" /> Nối dây tạo luật nhanh
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Thực thể nguồn</label>
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold"
          >
            {pkg.zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name} ({z.id})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Thực thể đích</label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold"
          >
            {pkg.zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name} ({z.id})</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Hành vi gợi ý</label>
        <select
          value={presetId}
          onChange={(e) => setPresetId(e.target.value)}
          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold"
        >
          {SUGGESTED_LINKS.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleCreate}
        className="w-full py-2 rounded-xl bg-[#E0562D] hover:bg-[#c9451e] text-white font-bold cursor-pointer"
      >
        Tạo luật kết nối
      </button>
    </div>
  );
}

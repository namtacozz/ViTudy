'use client';

import React from 'react';
import {
  GamePackageV2,
  createCaroPackageV2,
  createMonopolyPackageV2,
  createUnoPackageV2,
} from '@/engine/boardgame';

/**
 * Merges an incoming GamePackageV2 into a base package with automatic ID conflict resolution (Cluster G).
 */
export function mergePackages(base: GamePackageV2, incoming: GamePackageV2): GamePackageV2 {
  const existingIds = new Set<string>([
    ...base.zones.map((z) => z.id),
    ...base.pieces.map((p) => p.id),
    ...base.counters.map((c) => c.id),
    ...base.randomizers.map((r) => r.id),
    ...base.players.map((pl) => pl.id),
  ]);
  const existingRuleIds = new Set(base.rules.map((r) => r.id));

  const prefix = `m_${incoming.id}_`;
  const remap = (id: string) => (existingIds.has(id) ? `${prefix}${id}` : id);

  const zones = incoming.zones.map((z) => ({
    ...z,
    id: remap(z.id),
    neighbors: z.neighbors?.map(remap),
  }));
  const pieces = incoming.pieces.map((p) => ({
    ...p,
    id: remap(p.id),
    zoneId: p.zoneId ? remap(p.zoneId) : null,
  }));
  const counters = incoming.counters.filter((c) => !existingIds.has(c.id));
  const randomizers = incoming.randomizers.filter((r) => !existingIds.has(r.id));
  const rules = incoming.rules.map((r) => ({
    ...r,
    id: existingRuleIds.has(r.id) ? `${prefix}${r.id}` : r.id,
  }));

  return {
    ...base,
    zones: [...base.zones, ...zones],
    pieces: [...base.pieces, ...pieces],
    counters: [...base.counters, ...counters],
    randomizers: [...base.randomizers, ...randomizers],
    rules: [...base.rules, ...rules],
  };
}

interface TemplateLibraryModalProps {
  currentPkg: GamePackageV2;
  onSelectTemplate: (pkg: GamePackageV2) => void;
  onMergeTemplate: (merged: GamePackageV2) => void;
}

export function TemplateLibraryPanel({
  currentPkg,
  onSelectTemplate,
  onMergeTemplate,
}: TemplateLibraryModalProps) {
  const templates: { id: string; label: string; build: () => GamePackageV2 }[] = [
    { id: 'monopoly', label: 'Cờ Tỷ Phú', build: () => createMonopolyPackageV2() },
    { id: 'caro', label: 'Cờ Caro 5×5', build: () => createCaroPackageV2(5, 5) },
    { id: 'uno', label: 'UNO Rút Gọn', build: () => createUnoPackageV2() },
  ];

  return (
    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5 text-xs">
      <div className="font-black text-slate-900">Thư viện mẫu dữ liệu (Templates)</div>
      <div className="space-y-1.5">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="flex items-center justify-between gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50"
          >
            <span className="font-bold text-slate-800">{tpl.label}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onSelectTemplate(tpl.build())}
                className="px-2.5 py-1 rounded-lg bg-[#E0562D] text-white font-bold cursor-pointer"
              >
                Mở mới
              </button>
              <button
                type="button"
                onClick={() => onMergeTemplate(mergePackages(currentPkg, tpl.build()))}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold cursor-pointer"
              >
                Trộn vào bàn
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  EngineState,
  GameAction,
  GamePackageV2,
  HistoryTimeline,
  Zone,
  createTimeline,
  dispatchTimeline,
  redoTimeline,
  undoTimeline,
  viewFor,
} from '@/engine/boardgame';
import { GameCabinetStorage } from '@/services/GameCabinetStorage';
import { BoardRenderer } from './runtime/BoardRenderer';
import { GeneratedActionBar } from './panels/GeneratedActionBar';
import { PromptDialog } from './panels/PromptDialog';
import { EntityInspector } from './editor/EntityInspector';
import { QuickRuleLinker } from './editor/QuickRuleLinker';
import { TemplateLibraryPanel } from './editor/TemplateLibraryModal';
import { RuleBuilderPanel } from './rules/RuleBuilderPanel';
import { Undo2, Redo2, Save, X } from 'lucide-react';

interface BoardGameStudioV2Props {
  initialPkg: GamePackageV2;
  onClose: () => void;
}

export function BoardGameStudioV2({ initialPkg, onClose }: BoardGameStudioV2Props) {
  const [timeline, setTimeline] = useState<HistoryTimeline>(() =>
    createTimeline(initialPkg, 1337)
  );
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(
    initialPkg.zones[0]?.id ?? null
  );
  const [activeTab, setActiveTab] = useState<'inspector' | 'rules' | 'templates'>('rules');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const pkg = timeline.pkg;
  const state: EngineState = timeline.present;
  const activePlayerId = state.turn.order[state.turn.currentIndex] ?? null;
  const projectedState = useMemo(
    () => viewFor(state, activePlayerId),
    [state, activePlayerId]
  );

  const selectedZone: Zone | null = selectedZoneId
    ? pkg.zones.find((z) => z.id === selectedZoneId) ?? null
    : null;

  const handleAction = (action: GameAction) => {
    const { timeline: nextTl, result } = dispatchTimeline(timeline, action);
    if (result.error) {
      setErrorMsg(result.error);
      return;
    }
    setErrorMsg(null);
    setTimeline(nextTl);
  };

  const updatePkg = (nextPkg: GamePackageV2) => {
    setTimeline(createTimeline(nextPkg, timeline.seed));
    setErrorMsg(null);
  };

  const handleSaveV2 = async () => {
    const res = await GameCabinetStorage.saveGameV2(pkg);
    setSavedNotice(res.ok ? 'Đã lưu gói v2 vào Tủ đồ chơi' : res.error || 'Lỗi lưu');
    setTimeout(() => setSavedNotice(null), 2500);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      data-overlay="true"
      className="fixed inset-0 z-[9995] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="w-full max-w-6xl h-[88vh] bg-white rounded-2xl border border-slate-300 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-lg bg-[#FFF7ED] text-[#E0562D] border border-[#FFEDD5] text-[11px] font-black">
              Studio v2
            </span>
            <span className="text-sm font-black text-slate-900 truncate">{pkg.title}</span>
            <span className="text-[11px] text-slate-500 font-semibold">
              Pha: {state.turn.phase} · Lượt: {activePlayerId || '—'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTimeline((tl) => undoTimeline(tl))}
              disabled={timeline.past.length === 0}
              title="Hoàn tác"
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <Undo2 className="w-4 h-4 text-slate-700" />
            </button>
            <button
              type="button"
              onClick={() => setTimeline((tl) => redoTimeline(tl))}
              disabled={timeline.future.length === 0}
              title="Làm lại"
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <Redo2 className="w-4 h-4 text-slate-700" />
            </button>
            <button
              type="button"
              onClick={handleSaveV2}
              className="px-3 py-1.5 rounded-lg bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Lưu v2
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {(errorMsg || savedNotice) && (
          <div className="px-4 py-1.5 text-xs font-semibold bg-orange-50 border-b border-[#FFEDD5] text-[#9A3412]">
            {errorMsg || savedNotice}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 min-h-0 grid grid-cols-12">
          {/* Left: Runtime Board + Actions */}
          <div className="col-span-8 p-4 flex flex-col gap-3 overflow-y-auto">
            <GeneratedActionBar
              pkg={pkg}
              state={projectedState}
              viewerPlayerId={activePlayerId}
              onAction={handleAction}
            />
            <PromptDialog
              state={projectedState}
              viewerPlayerId={activePlayerId}
              onAction={handleAction}
            />
            <div className="flex-1 min-h-0 overflow-auto">
              <BoardRenderer
                state={projectedState}
                viewerPlayerId={activePlayerId}
                onZoneClick={(z) => setSelectedZoneId(z.id)}
              />
            </div>
          </div>

          {/* Right: Editor & Rules */}
          <div className="col-span-4 border-l border-slate-200 bg-slate-50 p-3 flex flex-col gap-3 overflow-y-auto">
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-200/70 text-xs font-bold">
              {(
                [
                  { id: 'rules', label: 'Luật' },
                  { id: 'inspector', label: 'Thuộc tính' },
                  { id: 'templates', label: 'Mẫu' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-1.5 rounded-lg cursor-pointer ${
                    activeTab === tab.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'rules' && (
              <>
                <RuleBuilderPanel
                  pkg={pkg}
                  state={state}
                  onChangeRules={(rules) => updatePkg({ ...pkg, rules })}
                />
                <QuickRuleLinker
                  pkg={pkg}
                  onAddRule={(rule) => updatePkg({ ...pkg, rules: [...pkg.rules, rule] })}
                />
              </>
            )}

            {activeTab === 'inspector' && selectedZone && (
              <EntityInspector
                entityId={selectedZone.id}
                entityName={selectedZone.name}
                tags={selectedZone.tags}
                fields={selectedZone.fields}
                availableEntityIds={pkg.zones.map((z) => z.id)}
                onChange={({ tags, fields }) =>
                  updatePkg({
                    ...pkg,
                    zones: pkg.zones.map((z) =>
                      z.id === selectedZone.id ? { ...z, tags, fields } : z
                    ),
                  })
                }
              />
            )}

            {activeTab === 'templates' && (
              <TemplateLibraryPanel
                currentPkg={pkg}
                onSelectTemplate={(nextPkg) => updatePkg(nextPkg)}
                onMergeTemplate={(merged) => updatePkg(merged)}
              />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

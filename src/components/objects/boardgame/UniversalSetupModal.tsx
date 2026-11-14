'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Sparkles } from 'lucide-react';
import {
  BOARD_SHAPE_OPTIONS,
  BoardGamePackage,
  BoardGameTemplateId,
  BoardRuleMode,
  BoardShape,
  GameTriggerRule,
  ResourceDefinition,
} from '@/types/boardgame';

interface UniversalSetupModalProps {
  isOpen: boolean;
  pkg: BoardGamePackage;
  onClose: () => void;
  onApplyTemplate: (templateId: BoardGameTemplateId) => void;
  onUpdateRuleConfig: (patch: {
    ruleMode: BoardRuleMode;
    resources: ResourceDefinition[];
    triggerRules: GameTriggerRule[];
    mapShape?: BoardShape;
    tileShape?: BoardShape;
  }) => void;
  onGenerateAiUniversal?: (prompt: string) => Promise<void>;
  isGeneratingAi?: boolean;
}

const TEMPLATES: { id: BoardGameTemplateId; name: string; desc: string }[] = [
  { id: 'monopoly', name: 'Cờ Tỷ Phú', desc: 'Đường viền khép kín, sổ đỏ, nâng nhà, tiền tệ.' },
  { id: 'card_table', name: 'Đấu Thẻ Bài', desc: 'Tay bài bí mật, chồng rút/bỏ, lật & xoay lá (UNO, TCG).' },
  { id: 'grid_chess', name: 'Bàn Cờ Lưới', desc: 'Lưới 8x8 với nguồn quân vô tận & lật mặt (Caro, Cờ vây).' },
  { id: 'hex_strategy', name: 'Chiến Thuật Lục Giác', desc: 'Ô lục giác so le kèm nhiều loại tài nguyên (Catan).' },
  { id: 'node_track', name: 'Đường Đua Nút', desc: 'Các nút nối nhau kích hoạt dịch chuyển (Cá ngựa, Rắn).' },
  { id: 'sandbox', name: 'Bàn Tự Do (Sandbox)', desc: 'Bàn trống kéo thả tự do, không ràng buộc lượt hay tiền.' },
];

export function UniversalSetupModal({
  isOpen,
  pkg,
  onClose,
  onApplyTemplate,
  onUpdateRuleConfig,
  onGenerateAiUniversal,
  isGeneratingAi = false,
}: UniversalSetupModalProps) {
  const [mounted, setMounted] = useState(false);
  const [ruleMode, setRuleMode] = useState<BoardRuleMode>(pkg.ruleMode || 'sandbox');
  const [mapShape, setMapShape] = useState<BoardShape>(pkg.mapConfig.mapShape || 'square');
  const [tileShape, setTileShape] = useState<BoardShape>(pkg.tiles[0]?.shape || 'square');
  const [resources, setResources] = useState<ResourceDefinition[]>(pkg.resources || []);
  const [triggerRules, setTriggerRules] = useState<GameTriggerRule[]>(pkg.triggerRules || []);
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setRuleMode(pkg.ruleMode || 'sandbox');
      setMapShape(pkg.mapConfig.mapShape || 'square');
      setTileShape(pkg.tiles[0]?.shape || 'square');
      setResources(pkg.resources || []);
      setTriggerRules(pkg.triggerRules || []);
    }
  }, [isOpen, pkg.ruleMode, pkg.mapConfig.mapShape, pkg.tiles, pkg.resources, pkg.triggerRules]);

  if (!isOpen || !mounted) return null;

  const addResource = () => {
    const idx = resources.length + 1;
    setResources([
      ...resources,
      {
        id: `res-${Date.now()}-${idx}`,
        name: `Tài nguyên ${idx}`,
        unit: '',
        color: '#E0562D',
        initialAmount: 0,
      },
    ]);
  };

  const addTrigger = () => {
    setTriggerRules([
      ...triggerRules,
      {
        id: `trig-${Date.now()}`,
        label: 'Luật mới',
        when: 'on_enter_tile',
        sourceTileId: pkg.tiles[0]?.id,
        action: 'draw_cards',
        amount: 1,
      },
    ]);
  };

  const modal = (
    <div
      data-overlay="true"
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[9995] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Thiết lập Board Game đa năng</h2>
            <p className="text-xs text-slate-500">Chọn mẫu bàn cờ, chế độ luật, tài nguyên và luật Nếu–Thì.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          {onGenerateAiUniversal && (
            <section className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Khởi tạo nhanh bằng AI theo ý tưởng bất kỳ
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="VD: Game đấu thẻ bài sinh tồn trên đảo hoang với Máu và Năng lượng..."
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#E0562D]"
                />
                <button
                  type="button"
                  disabled={isGeneratingAi || !aiPrompt.trim()}
                  onClick={async () => {
                    await onGenerateAiUniversal(aiPrompt.trim());
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-lg bg-[#E0562D] hover:bg-[#c9451e] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isGeneratingAi ? 'Đang tạo...' : 'Tạo game AI'}
                </button>
              </div>
            </section>
          )}

          <section className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800">1. Mẫu thể loại bàn chơi</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TEMPLATES.map((tpl) => {
                const active = pkg.templateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      onApplyTemplate(tpl.id);
                      onClose();
                    }}
                    className={`p-2.5 rounded-lg text-left border transition-colors ${
                      active
                        ? 'bg-orange-50 border-[#E0562D] text-slate-900'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{tpl.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{tpl.desc}</div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold text-slate-800">2. Hình dạng bàn cờ & tất cả ô (Đa giác / Tròn)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Hình dạng bàn</label>
                <select
                  value={mapShape}
                  onChange={(e) => setMapShape(e.target.value as BoardShape)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-semibold"
                >
                  {BOARD_SHAPE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Hình dạng ô</label>
                <select
                  value={tileShape}
                  onChange={(e) => setTileShape(e.target.value as BoardShape)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-semibold"
                >
                  {BOARD_SHAPE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold text-slate-800">3. Chế độ luật chơi</h3>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'sandbox', label: 'Tự do (Sandbox)', desc: 'Không ép lượt/tiền' },
                  { id: 'turn_based', label: 'Theo lượt', desc: 'Quản lý lượt & đảo chiều' },
                  { id: 'monopoly', label: 'Cờ Tỷ Phú', desc: 'Mua đất, thuê, nâng nhà' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setRuleMode(m.id)}
                  className={`p-2.5 rounded-lg border text-left ${
                    ruleMode === m.id
                      ? 'bg-orange-50 border-[#E0562D] text-[#E0562D]'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{m.label}</div>
                  <div className="text-[10px] text-slate-500">{m.desc}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800">3. Bộ đếm tài nguyên (Máu, Gỗ, Điểm...)</h3>
              <button
                type="button"
                onClick={addResource}
                className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Thêm tài nguyên
              </button>
            </div>
            {resources.length === 0 ? (
              <p className="text-xs text-slate-400">Chưa có tài nguyên tùy chỉnh.</p>
            ) : (
              <div className="space-y-2">
                {resources.map((res, idx) => (
                  <div key={res.id} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={res.color}
                      onChange={(e) =>
                        setResources(resources.map((r, i) => (i === idx ? { ...r, color: e.target.value } : r)))
                      }
                      className="w-7 h-7 rounded border border-slate-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={res.name}
                      onChange={(e) =>
                        setResources(resources.map((r, i) => (i === idx ? { ...r, name: e.target.value } : r)))
                      }
                      placeholder="Tên (VD: Gỗ)"
                      className="flex-1 px-2.5 py-1.5 text-xs rounded border border-slate-200"
                    />
                    <input
                      type="number"
                      min={0}
                      value={res.initialAmount}
                      onChange={(e) =>
                        setResources(
                          resources.map((r, i) =>
                            i === idx ? { ...r, initialAmount: Math.max(0, Number(e.target.value) || 0) } : r
                          )
                        )
                      }
                      className="w-20 px-2.5 py-1.5 text-xs rounded border border-slate-200"
                      title="Số lượng ban đầu"
                    />
                    <button
                      type="button"
                      onClick={() => setResources(resources.filter((_, i) => i !== idx))}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800">4. Luật Nếu – Thì (Trigger Rules)</h3>
              <button
                type="button"
                onClick={addTrigger}
                className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Thêm luật
              </button>
            </div>
            {triggerRules.length === 0 ? (
              <p className="text-xs text-slate-400">Chưa có luật tự động nào.</p>
            ) : (
              <div className="space-y-2">
                {triggerRules.map((tr, idx) => (
                  <div key={tr.id} className="grid grid-cols-12 gap-1.5 items-center">
                    <select
                      value={tr.when}
                      onChange={(e) =>
                        setTriggerRules(
                          triggerRules.map((item, i) =>
                            i === idx ? { ...item, when: e.target.value as GameTriggerRule['when'] } : item
                          )
                        )
                      }
                      className="col-span-4 px-2 py-1.5 text-xs rounded border border-slate-200"
                    >
                      <option value="on_enter_tile">Khi vào ô</option>
                      <option value="on_roll_value">Khi tung ra điểm</option>
                      <option value="on_play_card">Khi đánh bài</option>
                    </select>
                    <select
                      value={tr.action}
                      onChange={(e) =>
                        setTriggerRules(
                          triggerRules.map((item, i) =>
                            i === idx ? { ...item, action: e.target.value as GameTriggerRule['action'] } : item
                          )
                        )
                      }
                      className="col-span-4 px-2 py-1.5 text-xs rounded border border-slate-200"
                    >
                      <option value="draw_cards">Rút thêm bài</option>
                      <option value="reverse_turn">Đảo chiều lượt</option>
                      <option value="skip_turn">Mất lượt</option>
                      <option value="extra_turn">Thêm 1 lượt</option>
                      <option value="resource_delta">Đổi tài nguyên</option>
                      <option value="teleport">Dịch chuyển tới ô</option>
                    </select>
                    <input
                      type="number"
                      value={tr.amount ?? 1}
                      onChange={(e) =>
                        setTriggerRules(
                          triggerRules.map((item, i) =>
                            i === idx ? { ...item, amount: Number(e.target.value) || 0 } : item
                          )
                        )
                      }
                      className="col-span-3 px-2 py-1.5 text-xs rounded border border-slate-200"
                      title="Giá trị / Số lượng"
                    />
                    <button
                      type="button"
                      onClick={() => setTriggerRules(triggerRules.filter((_, i) => i !== idx))}
                      className="col-span-1 p-1.5 rounded text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => {
              onUpdateRuleConfig({ ruleMode, resources, triggerRules, mapShape, tileShape });
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold"
          >
            Áp dụng cấu hình
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

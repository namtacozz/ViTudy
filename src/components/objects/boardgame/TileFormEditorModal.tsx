'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  BOARD_SHAPE_OPTIONS,
  BoardRuleMode,
  BoardShape,
  BoardTile,
  TileCustomField,
  TileFormTemplate,
  TileTemplatePreset,
} from '@/types/boardgame';
import { useViToken } from '@/context/ViTokenContext';
import { generateTilesContentWithAi } from '@/services/BoardGameAiService';
import {
  X,
  Wand2,
  Layers,
  Check,
  Loader2,
  Plus,
  Trash2,
  BookmarkPlus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface TileFormEditorModalProps {
  isOpen: boolean;
  tile: BoardTile | null;
  totalNormalTilesCount: number;
  ruleMode?: BoardRuleMode;
  tileTemplates?: TileTemplatePreset[];
  onClose: () => void;
  onSaveTile: (updated: BoardTile) => void;
  onApplyFormToAll: (
    form: TileFormTemplate,
    hasFunction: boolean,
    opts?: { shape?: BoardShape; customFields?: TileCustomField[] }
  ) => void;
  onSaveTileTemplate?: (template: TileTemplatePreset) => void;
  onDeleteTileTemplate?: (templateId: string) => void;
  onAiFillAllTiles: (
    items: { title: string; price: number; headerColor: string; baseRent: number; houseCost: number }[]
  ) => void;
}

const LOCAL_TILE_TEMPLATES_KEY = 'vitudy_tile_templates_v1';

export function TileFormEditorModal({
  isOpen,
  tile,
  totalNormalTilesCount,
  ruleMode = 'sandbox',
  tileTemplates = [],
  onClose,
  onSaveTile,
  onApplyFormToAll,
  onSaveTileTemplate,
  onDeleteTileTemplate,
  onAiFillAllTiles,
}: TileFormEditorModalProps) {
  const { aiConfig, syncBalanceFromServer } = useViToken();
  const [mounted, setMounted] = useState(false);

  const [title, setTitle] = useState('');
  const [shape, setShape] = useState<BoardShape>('square');
  const [imageUrl, setImageUrl] = useState('');
  const [hasFunction, setHasFunction] = useState(false);
  const [customFields, setCustomFields] = useState<TileCustomField[]>([]);
  const [form, setForm] = useState<TileFormTemplate>({
    hasHeader: false,
    headerBgColor: '#E0562D',
    hasBodyImage: false,
    hasFooterPrice: false,
    borderStyle: 'solid',
  });

  // Mẫu ô tái sử dụng (kết hợp từ props + localStorage)
  const [localTemplates, setLocalTemplates] = useState<TileTemplatePreset[]>([]);
  const [templateName, setTemplateName] = useState('');

  // Tùy chọn kinh tế Cờ Tỷ Phú (ẩn mặc định trừ khi ruleMode === 'monopoly')
  const [showMonopolySection, setShowMonopolySection] = useState(ruleMode === 'monopoly');
  const [price, setPrice] = useState<string>('');
  const [baseRent, setBaseRent] = useState(20000);
  const [houseCost, setHouseCost] = useState(50000);
  const [resellValue, setResellValue] = useState(40000);
  const [upgradeRuleText, setUpgradeRuleText] = useState('');

  // AI Thiết kế hàng loạt
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(LOCAL_TILE_TEMPLATES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLocalTemplates(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (tile) {
      setTitle(tile.title || '');
      setShape(tile.shape || 'square');
      setImageUrl(tile.imageUrl || '');
      setHasFunction(tile.hasFunction);
      setCustomFields(tile.customFields ? tile.customFields.map((f) => ({ ...f })) : []);
      setForm(
        tile.form || {
          hasHeader: false,
          headerBgColor: '#E0562D',
          hasBodyImage: Boolean(tile.imageUrl),
          hasFooterPrice: tile.price !== undefined,
          borderStyle: 'solid',
        }
      );
      setPrice(tile.price !== undefined ? String(tile.price) : '');
      setShowMonopolySection(ruleMode === 'monopoly' || tile.price !== undefined || Boolean(tile.propertyDetails));
      if (tile.propertyDetails) {
        setBaseRent(tile.propertyDetails.baseRent);
        setHouseCost(tile.propertyDetails.houseCost);
        setResellValue(tile.propertyDetails.resellValue);
        setUpgradeRuleText(tile.propertyDetails.upgradeRuleText || '');
      }
    }
  }, [tile, ruleMode]);

  if (!isOpen || !tile || !mounted) return null;

  const mergedTemplates: TileTemplatePreset[] = [
    ...tileTemplates,
    ...localTemplates.filter((lt) => !tileTemplates.some((pt) => pt.id === lt.id)),
  ];

  const handleAddField = () => {
    setCustomFields((prev) => [
      ...prev,
      {
        id: `fld-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        label: '',
        value: '',
        type: 'text',
        showOnTile: true,
      },
    ]);
  };

  const handleSavePreset = () => {
    const cleanName = templateName.trim() || `Mẫu ô ${mergedTemplates.length + 1}`;
    const preset: TileTemplatePreset = {
      id: `tpl-tile-${Date.now()}`,
      name: cleanName,
      shape,
      hasFunction,
      form: { ...form },
      customFields: customFields.map((f) => ({ ...f })),
      createdAt: new Date().toISOString(),
    };
    const nextLocal = [preset, ...localTemplates];
    setLocalTemplates(nextLocal);
    try {
      localStorage.setItem(LOCAL_TILE_TEMPLATES_KEY, JSON.stringify(nextLocal));
    } catch {}
    onSaveTileTemplate?.(preset);
    setTemplateName('');
  };

  const handleDeletePreset = (id: string) => {
    const nextLocal = localTemplates.filter((t) => t.id !== id);
    setLocalTemplates(nextLocal);
    try {
      localStorage.setItem(LOCAL_TILE_TEMPLATES_KEY, JSON.stringify(nextLocal));
    } catch {}
    onDeleteTileTemplate?.(id);
  };

  const handleApplyPresetToCurrent = (preset: TileTemplatePreset) => {
    setShape(preset.shape);
    setHasFunction(preset.hasFunction);
    setForm({ ...preset.form });
    setCustomFields(
      preset.customFields.map((f) => ({
        ...f,
        id: `fld-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      }))
    );
  };

  const handleSave = () => {
    const numPrice = price.trim() === '' ? undefined : Math.max(0, Number(price) || 0);
    const cleanedFields = customFields
      .filter((f) => f.label.trim() || f.value.trim())
      .map((f) => ({ ...f, label: f.label.trim(), value: f.value.trim() }));

    onSaveTile({
      ...tile,
      shape,
      title: title.trim(),
      price: numPrice,
      imageUrl: imageUrl.trim() || undefined,
      hasFunction,
      customFields: cleanedFields,
      form,
      propertyDetails:
        showMonopolySection && (numPrice !== undefined || tile.propertyDetails)
          ? {
              baseRent,
              houseCost,
              rentsByLevel: [baseRent * 2, baseRent * 4, baseRent * 6, baseRent * 8, baseRent * 12],
              resellValue,
              currentHouses: tile.propertyDetails?.currentHouses || 0,
              upgradeRuleText: upgradeRuleText.trim() || undefined,
            }
          : tile.propertyDetails,
    });
    onClose();
  };

  const handleAiGenerateAll = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    try {
      const res = await generateTilesContentWithAi({
        tileCount: Math.max(1, totalNormalTilesCount),
        themePrompt: aiPrompt,
        aiConfig,
        onBalanceUpdate: (balanceAfter) => {
          if (typeof balanceAfter === 'number') {
            syncBalanceFromServer(balanceAfter);
          }
        },
      });
      onAiFillAllTiles(res.items);
      onClose();
    } catch {
      // fallback handled inside service
    } finally {
      setIsAiGenerating(false);
    }
  };

  const modal = (
    <div
      data-overlay="true"
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[9995] bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Thiết kế ô cờ & Trường dữ liệu</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tự định nghĩa trường thông tin, lưu thành mẫu ô hoặc áp dụng lên toàn bộ bàn cờ.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Hình dạng, tên ô & màu */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nhãn / Tiêu đề ô</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Ô 1, Bắt đầu, Rừng rậm..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-[#E0562D] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hình dạng ô</label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value as BoardShape)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-semibold focus:border-[#E0562D] outline-none"
              >
                {BOARD_SHAPE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Màu dải tiêu đề</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.headerBgColor}
                  onChange={(e) => setForm({ ...form, headerBgColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-600">{form.headerBgColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ảnh minh họa (tùy chọn)</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setForm((f) => ({ ...f, hasBodyImage: Boolean(e.target.value.trim()) }));
                }}
                placeholder="https://... hoặc data:image/..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-[#E0562D] outline-none"
              />
            </div>
          </div>

          {/* Tùy chọn hiển thị */}
          <div className="flex flex-wrap items-center gap-4 pt-0.5">
            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasHeader}
                onChange={(e) => setForm({ ...form, hasHeader: e.target.checked })}
                className="accent-[#E0562D]"
              />
              <span>Hiện dải tiêu đề trên</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasBodyImage}
                onChange={(e) => setForm({ ...form, hasBodyImage: e.target.checked })}
                className="accent-[#E0562D]"
              />
              <span>Hiện ảnh nền ô</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasFunction}
                onChange={(e) => setHasFunction(e.target.checked)}
                className="accent-[#E0562D]"
              />
              <span>Ô có chức năng / sự kiện</span>
            </label>
          </div>

          {/* Trường dữ liệu tùy biến */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Trường dữ liệu tùy biến</div>
                <div className="text-[11px] text-slate-500">
                  Tạo bất kỳ trường nào cho game của bạn (Điểm, Máu, Tài nguyên, Hiệu ứng...).
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddField}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#E0562D] text-[11px] font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#E0562D]" />
                <span>Thêm trường</span>
              </button>
            </div>

            {customFields.length === 0 ? (
              <div className="text-[11px] text-slate-400 py-1">
                Ô chưa có trường dữ liệu nào. Bấm &ldquo;Thêm trường&rdquo; để tạo mới.
              </div>
            ) : (
              <div className="space-y-2">
                {customFields.map((field, idx) => (
                  <div key={field.id} className="grid grid-cols-12 gap-1.5 items-center">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) =>
                        setCustomFields((prev) =>
                          prev.map((f, i) => (i === idx ? { ...f, label: e.target.value } : f))
                        )
                      }
                      placeholder="Tên trường (VD: Điểm)"
                      className="col-span-4 px-2 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
                    />
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={field.value}
                      onChange={(e) =>
                        setCustomFields((prev) =>
                          prev.map((f, i) => (i === idx ? { ...f, value: e.target.value } : f))
                        )
                      }
                      placeholder="Giá trị"
                      className="col-span-4 px-2 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
                    />
                    <select
                      value={field.type}
                      onChange={(e) =>
                        setCustomFields((prev) =>
                          prev.map((f, i) =>
                            i === idx ? { ...f, type: e.target.value as TileCustomField['type'] } : f
                          )
                        )
                      }
                      className="col-span-2 px-1.5 py-1.5 text-[11px] rounded-md border border-slate-200 bg-white"
                    >
                      <option value="text">Chữ</option>
                      <option value="number">Số</option>
                      <option value="badge">Nhãn</option>
                    </select>
                    <label
                      title="Hiện trường này lên mặt ô"
                      className="col-span-1 flex items-center justify-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={field.showOnTile !== false}
                        onChange={(e) =>
                          setCustomFields((prev) =>
                            prev.map((f, i) =>
                              i === idx ? { ...f, showOnTile: e.target.checked } : f
                            )
                          )
                        }
                        className="accent-[#E0562D]"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setCustomFields((prev) => prev.filter((_, i) => i !== idx))}
                      className="col-span-1 p-1 text-slate-400 hover:text-rose-600 cursor-pointer flex justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lưu mẫu ô & Tái sử dụng / Áp dụng toàn bộ map */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-900">Mẫu ô tái sử dụng</span>
              {tile.role === 'normal_cell' && (
                <button
                  type="button"
                  onClick={() => {
                    onApplyFormToAll(form, hasFunction, { shape, customFields });
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-[#E0562D]" />
                  <span>Áp dụng cấu trúc này lên {totalNormalTilesCount} ô</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Đặt tên mẫu (VD: Ô Tài nguyên, Ô Bẫy...)"
                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 outline-none focus:border-[#E0562D]"
              />
              <button
                type="button"
                onClick={handleSavePreset}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Lưu thành mẫu ô</span>
              </button>
            </div>

            {mergedTemplates.length > 0 && (
              <div className="space-y-1.5 pt-1 max-h-36 overflow-y-auto">
                {mergedTemplates.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 truncate block">{preset.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {BOARD_SHAPE_OPTIONS.find((o) => o.id === preset.shape)?.label || preset.shape} ·{' '}
                        {preset.customFields.length} trường
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleApplyPresetToCurrent(preset)}
                        className="px-2 py-1 rounded bg-white border border-slate-200 hover:border-[#E0562D] text-[10px] font-bold text-slate-700 cursor-pointer"
                      >
                        Dùng cho ô này
                      </button>
                      {tile.role === 'normal_cell' && (
                        <button
                          type="button"
                          onClick={() => {
                            onApplyFormToAll(preset.form, preset.hasFunction, {
                              shape: preset.shape,
                              customFields: preset.customFields,
                            });
                            onClose();
                          }}
                          className="px-2 py-1 rounded bg-orange-50 border border-orange-200 text-[#E0562D] text-[10px] font-bold cursor-pointer"
                        >
                          Áp toàn bộ map
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeletePreset(preset.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Xóa mẫu"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tùy chọn Cờ Tỷ Phú thu gọn (chỉ mở khi cần) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowMonopolySection((v) => !v)}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer"
            >
              <span>Tùy chọn kinh tế Cờ Tỷ Phú (nếu dùng mua/thuê đất)</span>
              {showMonopolySection ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {showMonopolySection && (
              <div className="p-3.5 space-y-2.5 bg-white">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Giá mua (VNĐ)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="VD: 120000"
                      className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Tiền thuê cơ bản</label>
                    <input
                      type="number"
                      value={baseRent}
                      onChange={(e) => setBaseRent(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Phí nâng 1 nhà</label>
                    <input
                      type="number"
                      value={houseCost}
                      onChange={(e) => setHouseCost(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Giá thế chấp / bán lại</label>
                    <input
                      type="number"
                      value={resellValue}
                      onChange={(e) => setResellValue(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-200"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={upgradeRuleText}
                  onChange={(e) => setUpgradeRuleText(e.target.value)}
                  placeholder="Ghi chú luật nâng nhà / thuê riêng..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200"
                />
              </div>
            )}
          </div>

          {/* Trợ lý AI điền nhanh toàn bộ ô */}
          {tile.role === 'normal_cell' && (
            <div className="p-3.5 rounded-xl border border-[#FFEDD5] bg-[#FFF7ED] space-y-2">
              <div className="text-xs font-bold text-[#9A3412]">Nhờ AI gợi ý nội dung toàn bộ {totalNormalTilesCount} ô</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Nhập chủ đề (VD: Bản đồ thám hiểm vũ trụ, Trò chơi sinh tồn...)"
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-orange-200 bg-white outline-none"
                />
                <button
                  type="button"
                  disabled={isAiGenerating || !aiPrompt.trim()}
                  onClick={handleAiGenerateAll}
                  className="px-3 py-1.5 rounded-lg bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isAiGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  <span>AI thiết kế</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Lưu ô này</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

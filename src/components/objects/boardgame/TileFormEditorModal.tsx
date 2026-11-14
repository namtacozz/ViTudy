'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BoardTile, TileFormTemplate } from '@/types/boardgame';
import { useViToken } from '@/context/ViTokenContext';
import { generateTilesContentWithAi } from '@/services/BoardGameAiService';
import { X, Wand2, Layers, Check, Loader2 } from 'lucide-react';

interface TileFormEditorModalProps {
  isOpen: boolean;
  tile: BoardTile | null;
  totalNormalTilesCount: number;
  onClose: () => void;
  onSaveTile: (updated: BoardTile) => void;
  onApplyFormToAll: (form: TileFormTemplate, hasFunction: boolean) => void;
  onAiFillAllTiles: (
    items: { title: string; price: number; headerColor: string; baseRent: number; houseCost: number }[]
  ) => void;
}

export function TileFormEditorModal({
  isOpen,
  tile,
  totalNormalTilesCount,
  onClose,
  onSaveTile,
  onApplyFormToAll,
  onAiFillAllTiles,
}: TileFormEditorModalProps) {
  const { aiConfig, syncBalanceFromServer } = useViToken();
  const [mounted, setMounted] = useState(false);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [hasFunction, setHasFunction] = useState(true);
  const [form, setForm] = useState<TileFormTemplate>({
    hasHeader: true,
    headerBgColor: '#E0562D',
    hasBodyImage: false,
    hasFooterPrice: true,
    borderStyle: 'solid',
  });

  // Ô thông tin chi tiết ngoài map (nếu có)
  const [baseRent, setBaseRent] = useState(20000);
  const [houseCost, setHouseCost] = useState(50000);
  const [resellValue, setResellValue] = useState(40000);
  const [upgradeRuleText, setUpgradeRuleText] = useState('');

  // AI Thiết kế hàng loạt
  const [aiPrompt, setAiPrompt] = useState('Địa danh Việt Nam nổi tiếng theo chuẩn Cờ Tỷ Phú');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (tile) {
      setTitle(tile.title || '');
      setPrice(tile.price !== undefined ? String(tile.price) : '');
      setImageUrl(tile.imageUrl || '');
      setHasFunction(tile.hasFunction);
      setForm(
        tile.form || {
          hasHeader: true,
          headerBgColor: '#E0562D',
          hasBodyImage: Boolean(tile.imageUrl),
          hasFooterPrice: tile.price !== undefined,
          borderStyle: 'solid',
        }
      );
      if (tile.propertyDetails) {
        setBaseRent(tile.propertyDetails.baseRent);
        setHouseCost(tile.propertyDetails.houseCost);
        setResellValue(tile.propertyDetails.resellValue);
        setUpgradeRuleText(tile.propertyDetails.upgradeRuleText || '');
      }
    }
  }, [tile]);

  if (!isOpen || !tile || !mounted) return null;

  const handleSave = () => {
    const numPrice = price.trim() === '' ? undefined : Math.max(0, Number(price) || 0);
    onSaveTile({
      ...tile,
      title: title.trim(),
      price: numPrice,
      imageUrl: imageUrl.trim() || undefined,
      hasFunction,
      form,
      propertyDetails:
        tile.role === 'external_info' || hasFunction
          ? {
              baseRent,
              houseCost,
              rentsByLevel: [baseRent * 2, baseRent * 4, baseRent * 6, baseRent * 8, baseRent * 12],
              resellValue,
              currentHouses: tile.propertyDetails?.currentHouses || 0,
              upgradeRuleText: upgradeRuleText.trim() || undefined,
            }
          : undefined,
    });
    onClose();
  };

  const handleAiGenerateAll = async () => {
    setIsAiGenerating(true);
    try {
      const res = await generateTilesContentWithAi({
        tileCount: totalNormalTilesCount,
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
    } finally {
      setIsAiGenerating(false);
    }
  };

  return createPortal(
    <div
      data-modal="true"
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[9995] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {tile.role === 'external_info' ? 'Thiết kế ô thông tin ngoài map' : 'Thiết kế form & giá trị ô cờ'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tùy chỉnh hiển thị từng ô, áp dụng toàn bộ map hoặc nhờ AI thiết kế giúp.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Công tắc chức năng */}
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-slate-900">Ô có giá trị chức năng</div>
              <div className="text-[11px] text-slate-500">
                Tắt nếu làm Cờ vua / Cờ caro (chỉ đánh dấu vị trí). Bật cho Cờ tỷ phú.
              </div>
            </div>
            <input
              type="checkbox"
              checked={hasFunction}
              onChange={(e) => setHasFunction(e.target.checked)}
              className="w-4 h-4 accent-[#E0562D] cursor-pointer"
            />
          </label>

          {/* Form fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên địa điểm / Tiêu đề</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Hồ Hoàn Kiếm"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-[#E0562D] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giá mua (VNĐ)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="VD: 120000"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-[#E0562D] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Màu dải Header</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Link ảnh Body (tùy chọn)</label>
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

          {/* Tùy chọn bố cục form */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasHeader}
                onChange={(e) => setForm({ ...form, hasHeader: e.target.checked })}
                className="accent-[#E0562D]"
              />
              <span>Hiện Header tên</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasBodyImage}
                onChange={(e) => setForm({ ...form, hasBodyImage: e.target.checked })}
                className="accent-[#E0562D]"
              />
              <span>Hiện Body hình ảnh</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasFooterPrice}
                onChange={(e) => setForm({ ...form, hasFooterPrice: e.target.checked })}
                className="accent-[#E0562D]"
              />
              <span>Hiện Footer giá tiền</span>
            </label>
          </div>

          {/* Thông số kinh tế chi tiết (Nâng nhà, Tiền phạt, Bán lại) */}
          {hasFunction && (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
              <div className="text-xs font-bold text-slate-800">Thông số kinh tế khi người chơi dẫm lên</div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Tiền phạt dẫm lên</label>
                  <input
                    type="number"
                    value={baseRent}
                    onChange={(e) => setBaseRent(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Phí nâng 1 nhà</label>
                  <input
                    type="number"
                    value={houseCost}
                    onChange={(e) => setHouseCost(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Giá bán lại</label>
                  <input
                    type="number"
                    value={resellValue}
                    onChange={(e) => setResellValue(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
                  />
                </div>
              </div>
              <input
                type="text"
                value={upgradeRuleText}
                onChange={(e) => setUpgradeRuleText(e.target.value)}
                placeholder="Ghi chú cách nâng nhà / luật riêng của ô này..."
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              />
            </div>
          )}

          {/* Apply toàn bộ & AI Thiết kế */}
          {tile.role === 'normal_cell' && (
            <div className="p-3.5 rounded-xl border border-[#FFEDD5] bg-[#FFF7ED] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#9A3412]">Áp dụng hàng loạt & Trợ lý AI</span>
                <button
                  type="button"
                  onClick={() => {
                    onApplyFormToAll(form, hasFunction);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Áp dụng form lên toàn bộ {totalNormalTilesCount} ô</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Chủ đề AI thiết kế toàn bộ các ô..."
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-orange-200 bg-white outline-none"
                />
                <button
                  type="button"
                  disabled={isAiGenerating}
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
            <span>Lưu ô cờ</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

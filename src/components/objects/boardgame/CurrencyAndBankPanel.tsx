'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  BoardGamePackage,
  CurrencyNoteDesign,
  VndDenomination,
  calculateBalanceTotal,
  createStarterVndBalance,
} from '@/types/boardgame';
import { applyTransfer } from '@/lib/boardGameEngine';
import { X, Banknote, Landmark, ArrowRightLeft, Coins } from 'lucide-react';

interface CurrencyAndBankPanelProps {
  isOpen: boolean;
  pkg: BoardGamePackage;
  players: { id: string; name: string }[];
  onClose: () => void;
  onUpdatePackage: (updated: BoardGamePackage) => void;
}

export function CurrencyAndBankPanel({
  isOpen,
  pkg,
  players,
  onClose,
  onUpdatePackage,
}: CurrencyAndBankPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'bank' | 'design'>('bank');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id || 'player-1');
  const [transferAmount, setTransferAmount] = useState<number>(50000);
  const [targetPlayerId, setTargetPlayerId] = useState<string>('bank');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (players.length > 0 && !players.some((p) => p.id === selectedPlayerId)) {
      setSelectedPlayerId(players[0].id);
    }
  }, [players, selectedPlayerId]);

  if (!isOpen || !mounted) return null;

  const balances = pkg.matchState?.playerBalances || {};
  const logs = pkg.matchState?.logs || [];

  const [transferError, setTransferError] = useState<string | null>(null);

  const handleDealStarterCash = () => {
    setTransferError(null);
    let working: BoardGamePackage = {
      ...pkg,
      matchState: {
        ...pkg.matchState,
        isPlaying: true,
        playerBalances: {},
        logs: [],
        ledgerChecksum: undefined,
      },
    };
    const starterAmount = calculateBalanceTotal(createStarterVndBalance());
    for (const p of players) {
      const res = applyTransfer(working, {
        fromId: 'bank',
        toId: p.id,
        amount: starterAmount,
        reason: 'Phát vốn khởi điểm đầu ván',
      });
      if (res.ok) working = res.pkg;
    }
    onUpdatePackage(working);
  };

  const handleTransferMoney = (direction: 'bank_to_player' | 'player_to_target') => {
    setTransferError(null);
    const amount = Math.max(1000, Math.round(transferAmount / 1000) * 1000);

    const res =
      direction === 'bank_to_player'
        ? applyTransfer(pkg, {
            fromId: 'bank',
            toId: selectedPlayerId,
            amount,
            reason: 'Ngân hàng chi tiền',
          })
        : applyTransfer(pkg, {
            fromId: selectedPlayerId,
            toId: targetPlayerId,
            amount,
            reason: 'Chuyển khoản trực tiếp',
          });

    if (!res.ok) {
      setTransferError(res.error || 'Giao dịch không hợp lệ.');
      return;
    }
    onUpdatePackage(res.pkg);
  };

  const handleUpdateCurrencyDesign = (denom: VndDenomination, patch: Partial<CurrencyNoteDesign>) => {
    const updatedDesigns = pkg.currencyDesigns.map((c) =>
      c.denomination === denom ? { ...c, ...patch } : c
    );
    onUpdatePackage({
      ...pkg,
      currencyDesigns: updatedDesigns,
    });
  };

  return createPortal(
    <div
      data-modal="true"
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[9995] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-[#FFEDD5] flex items-center justify-center text-[#E0562D]">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Ngân Hàng & Tiền Việt Nam (1k – 500k)</h3>
              <p className="text-xs text-slate-500">
                Quản lý két tiền 9 mệnh giá, phát tiền khởi đầu và thiết kế mặt tờ tiền.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('bank')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 cursor-pointer transition-colors ${
              activeTab === 'bank'
                ? 'border-[#E0562D] text-[#E0562D] bg-orange-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Quầy Giao Dịch Ngân Hàng
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('design')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 cursor-pointer transition-colors ${
              activeTab === 'design'
                ? 'border-[#E0562D] text-[#E0562D] bg-orange-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Thiết Kế 9 Mệnh Giá Tiền VNĐ
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'bank' ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-900">Quỹ khởi đầu ván chơi</div>
                  <div className="text-[11px] text-slate-500">
                    Phát bộ tiền VNĐ (1k – 500k) cho toàn bộ người chơi tham gia.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDealStarterCash}
                  className="px-4 py-2 rounded-lg bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  <span>Phát tiền khởi đầu</span>
                </button>
              </div>

              {/* Ví từng người chơi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {players.map((p) => {
                  const bal = balances[p.id];
                  const total = calculateBalanceTotal(bal);
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlayerId(p.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedPlayerId === p.id
                          ? 'border-[#E0562D] bg-orange-50/30'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900">{p.name}</span>
                        <span className="text-sm font-black text-[#E0562D]">
                          {total.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {pkg.currencyDesigns.map((c) => {
                          const cnt = bal?.[c.denomination] || 0;
                          if (cnt === 0) return null;
                          return (
                            <span
                              key={c.denomination}
                              style={{ backgroundColor: c.colorHex, color: c.accentHex }}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-black/10"
                            >
                              {c.label} × {cnt}
                            </span>
                          );
                        })}
                        {total === 0 && (
                          <span className="text-[11px] text-slate-400">Chưa có tiền</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Thanh chuyển khoản nhanh */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#E0562D]" />
                  <span>Giao dịch tiền nhanh</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedPlayerId}
                    onChange={(e) => setSelectedPlayerId(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 font-semibold"
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-slate-400">→</span>
                  <select
                    value={targetPlayerId}
                    onChange={(e) => setTargetPlayerId(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 font-semibold"
                  >
                    <option value="bank">Ngân hàng</option>
                    {players
                      .filter((p) => p.id !== selectedPlayerId)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                  <input
                    type="number"
                    step={1000}
                    min={1000}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(Number(e.target.value) || 1000)}
                    className="w-28 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleTransferMoney('player_to_target')}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Chuyển tiền
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTransferMoney('bank_to_player')}
                    className="px-3 py-1.5 rounded-lg bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold cursor-pointer"
                  >
                    Ngân hàng thưởng
                  </button>
                </div>
                {transferError && (
                  <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
                    {transferError}
                  </p>
                )}
              </div>

              {/* Nhật ký giao dịch */}
              {logs.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto border-t border-slate-100 pt-2">
                  {logs.map((l) => (
                    <div key={l.id} className="text-[11px] text-slate-600 flex items-center gap-2">
                      <span className="font-mono text-slate-400">{l.timestamp}</span>
                      <span>{l.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Tab Thiết kế 9 tờ tiền Việt Nam */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {pkg.currencyDesigns.map((c) => (
                <div
                  key={c.denomination}
                  className="p-3 rounded-xl border border-slate-200 bg-white space-y-2"
                >
                  <div
                    style={{ backgroundColor: c.colorHex, color: c.accentHex }}
                    className="h-16 rounded-lg border border-black/15 p-2 flex items-center justify-between relative overflow-hidden"
                  >
                    {c.customImageUrl && (
                      <img
                        src={c.customImageUrl}
                        alt={c.label}
                        className="absolute inset-0 w-full h-full object-cover opacity-35"
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-1.5">
                      <Banknote className="w-4 h-4" />
                      <span className="text-sm font-black">{c.denomination.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <span className="relative z-10 text-xs font-black px-1.5 py-0.5 rounded bg-white/70">
                      {c.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={c.colorHex}
                      onChange={(e) =>
                        handleUpdateCurrencyDesign(c.denomination, { colorHex: e.target.value })
                      }
                      title="Màu nền tờ tiền"
                      className="w-6 h-6 rounded border border-slate-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={c.customImageUrl || ''}
                      onChange={(e) =>
                        handleUpdateCurrencyDesign(c.denomination, {
                          customImageUrl: e.target.value.trim() || undefined,
                        })
                      }
                      placeholder="URL ảnh in lên tiền..."
                      className="flex-1 px-2 py-1 text-[11px] rounded border border-slate-200 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

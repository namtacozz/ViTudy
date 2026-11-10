'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PaymentHistoryItem, PaymentService } from '@/services/PaymentService';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  XCircle, 
  ArrowRight, 
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { SUPPORT_EMAIL } from '@/lib/constants';

interface PaymentHistoryProps {
  onRetryPayment?: (packageId?: string) => void;
  onResumePending?: (item: PaymentHistoryItem) => void;
}

type StatusFilter = 'all' | 'completed' | 'pending' | 'expired';

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');

    if (isToday) return `Hôm nay ${hours}:${mins}`;
    if (isYesterday) return `Hôm qua ${hours}:${mins}`;

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month} ${hours}:${mins}`;
  } catch {
    return dateStr;
  }
}

export function PaymentHistory({ onRetryPayment, onResumePending }: PaymentHistoryProps) {
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showOlderExpired, setShowOlderExpired] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const items = await PaymentService.listMyPayments(50);
      setHistory(items);
    } catch {
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCopyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleCancelPayment = async (txId: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Bạn có chắc muốn hủy yêu cầu nạp tiền này?')) {
      return;
    }
    setCancellingId(txId);
    try {
      await PaymentService.cancelPayment(txId);
      await fetchHistory();
    } catch {} finally {
      setCancellingId(null);
    }
  };

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (filter === 'all') return true;
      if (filter === 'completed') return item.status === 'completed' || item.status === 'completed_late';
      if (filter === 'pending') return item.status === 'pending';
      if (filter === 'expired') return item.status === 'expired' || item.status === 'failed';
      return true;
    });
  }, [history, filter]);

  // Phân tách các giao dịch hết hạn cũ để tránh làm tràn màn hình
  const { regularItems, olderExpiredItems } = useMemo(() => {
    if (filter === 'completed' || filter === 'pending') {
      return { regularItems: filteredHistory, olderExpiredItems: [] };
    }

    const regular: PaymentHistoryItem[] = [];
    const olderExpired: PaymentHistoryItem[] = [];
    let expiredCount = 0;

    for (const item of filteredHistory) {
      if (item.status === 'expired' || item.status === 'failed') {
        expiredCount++;
        // Giữ giao dịch hết hạn gần nhất, còn các giao dịch hết hạn thứ 2 trở đi thì gom vào nhóm cũ
        if (expiredCount === 1) {
          regular.push(item);
        } else {
          olderExpired.push(item);
        }
      } else {
        regular.push(item);
      }
    }

    return { regularItems: regular, olderExpiredItems: olderExpired };
  }, [filteredHistory, filter]);

  const getStatusBadge = (status: PaymentHistoryItem['status'], createdAt: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Thành công</span>
          </span>
        );
      case 'completed_late':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Khớp muộn</span>
          </span>
        );
      case 'pending': {
        const expiresAt = new Date(createdAt).getTime() + 15 * 60 * 1000;
        const remainingSecs = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
        const remMins = Math.floor(remainingSecs / 60);
        const remSecs = remainingSecs % 60;
        const timeBadge = remainingSecs > 0 ? ` (còn ${remMins}:${remSecs.toString().padStart(2, '0')})` : '';

        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Chờ thanh toán{timeBadge}</span>
          </span>
        );
      }
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            <AlertCircle className="w-3 h-3" />
            <span>Đã hết hạn</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3" />
            <span>Đã hủy</span>
          </span>
        );
    }
  };

  const renderTransactionCard = (tx: PaymentHistoryItem) => {
    const isPending = tx.status === 'pending';
    const isExpired = tx.status === 'expired' || tx.status === 'failed';
    const isCopied = copiedId === tx.id;

    return (
      <div
        key={tx.id}
        className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
          isPending 
            ? 'bg-amber-50/40 border-amber-200 shadow-2xs' 
            : 'bg-slate-50/80 border-slate-200/90 hover:bg-slate-100/70'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-900 tracking-wider">
              {tx.code}
            </span>
            <button
              type="button"
              onClick={() => handleCopyCode(tx.code, tx.id)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
              title="Sao chép mã giao dịch"
              aria-label="Sao chép mã giao dịch"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {getStatusBadge(tx.status, tx.createdAt)}
          </div>
          <div className="text-[11px] text-slate-600 font-medium mt-1">
            {formatRelativeTime(tx.createdAt)}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div className="text-left sm:text-right">
            <div className="font-mono font-bold text-slate-900">
              {tx.amountVnd.toLocaleString('vi-VN')}đ
            </div>
            <div className="text-[11px] font-black font-mono text-[#E0562D]">
              +{tx.tokenAmount.toLocaleString('vi-VN')} ViToken
            </div>
          </div>

          {/* Hành động nhanh theo trạng thái */}
          <div className="flex items-center gap-2">
            {isPending && (
              <>
                <button
                  type="button"
                  onClick={() => handleCancelPayment(tx.id)}
                  disabled={cancellingId === tx.id}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:text-red-600 hover:bg-red-50 text-[11px] font-semibold transition-all cursor-pointer"
                  title="Hủy mã thanh toán này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onResumePending ? onResumePending(tx) : onRetryPayment?.()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E0562D] hover:bg-[#c9451e] text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  <span>Tiếp tục thanh toán</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </>
            )}

            {isExpired && (
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Tra soat giao dich ${tx.code}&body=Toi da chuyen khoan cho ma giao dich ${tx.code} so tien ${tx.amountVnd.toLocaleString('vi-VN')}d.`}
                  className="text-[11px] font-bold text-slate-600 hover:text-[#E0562D] underline whitespace-nowrap"
                  title="Báo cho ban quản trị nếu bạn đã chuyển khoản sau khi mã hết hạn"
                >
                  Tôi đã chuyển khoản
                </a>
                <button
                  type="button"
                  onClick={() => onRetryPayment?.()}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Tạo mã mới</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3.5">
      {/* Header controls: Status Filters + Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({history.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === 'completed'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Thành công ({history.filter(h => h.status === 'completed' || h.status === 'completed_late').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Chờ thanh toán ({history.filter(h => h.status === 'pending').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('expired')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === 'expired'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            Đã hết hạn ({history.filter(h => h.status === 'expired' || h.status === 'failed').length})
          </button>
        </div>

        <button
          type="button"
          onClick={fetchHistory}
          disabled={isLoading}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 py-1 px-2 rounded-md hover:bg-slate-100 transition-colors cursor-pointer ml-auto"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Đang tải lịch sử giao dịch...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-8 px-4 text-center text-xs text-slate-600 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            {filter === 'completed' ? (
              <>
                <p className="font-semibold text-slate-700">Chưa có giao dịch thành công nào.</p>
                <p className="text-[11px] text-slate-500">Nạp ViToken để bắt đầu mở tài liệu và sử dụng toàn bộ tính năng học tập!</p>
                {onRetryPayment && (
                  <button
                    type="button"
                    onClick={() => onRetryPayment()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold transition-all shadow-xs cursor-pointer mt-1"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Nạp ViToken ngay</span>
                  </button>
                )}
              </>
            ) : filter === 'pending' ? (
              <p>Không có giao dịch nào đang chờ thanh toán.</p>
            ) : filter === 'expired' ? (
              <p>Không có giao dịch nào bị hết hạn.</p>
            ) : (
              <p>Chưa có giao dịch nạp ViToken nào được ghi nhận.</p>
            )}
          </div>
        ) : (
          <>
            {regularItems.map(renderTransactionCard)}

            {/* Khối thu gọn cho các giao dịch hết hạn cũ */}
            {olderExpiredItems.length > 0 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowOlderExpired(!showOlderExpired)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-100/70 hover:bg-slate-200/70 text-slate-600 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Đã ẩn {olderExpiredItems.length} giao dịch đã hết hạn cũ</span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500">
                    <span>{showOlderExpired ? 'Thu gọn' : 'Xem chi tiết'}</span>
                    {showOlderExpired ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </span>
                </button>

                {showOlderExpired && (
                  <div className="mt-2 space-y-2 animate-fade-in">
                    {olderExpiredItems.map(renderTransactionCard)}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { PaymentHistoryItem, PaymentService } from '@/services/PaymentService';
import { History, CheckCircle2, Clock, AlertCircle, RefreshCw, XCircle } from 'lucide-react';

export function PaymentHistory() {
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const items = await PaymentService.listMyPayments(20);
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

  const getStatusBadge = (status: PaymentHistoryItem['status']) => {
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
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Chờ thanh toán</span>
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            <AlertCircle className="w-3 h-3" />
            <span>Hết hạn</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3" />
            <span>Thất bại</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">
          20 giao dịch nạp tiền gần nhất
        </span>
        <button
          type="button"
          onClick={fetchHistory}
          disabled={isLoading}
          className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Đang tải lịch sử giao dịch...
          </div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Chưa có giao dịch nạp tiền nào được ghi nhận.
          </div>
        ) : (
          history.map((tx) => (
            <div
              key={tx.id}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs transition-all hover:bg-slate-100/70"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-slate-900 tracking-wider">
                    {tx.code}
                  </span>
                  {getStatusBadge(tx.status)}
                </div>
                <div className="text-[10.5px] text-slate-400 font-mono mt-1">
                  {new Date(tx.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-bold text-slate-800">
                  {tx.amountVnd.toLocaleString('vi-VN')} đ
                </div>
                <div className="text-[11px] font-black font-mono text-[#E0562D]">
                  +{tx.tokenAmount.toLocaleString()} V
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function isChunkLoadError(error: Error | null): boolean {
  if (!error) return false;
  return (
    error.name === 'ChunkLoadError' ||
    /loading chunk [\w-]+ failed|failed to fetch dynamically imported module/i.test(error.message || '')
  );
}

export class ModalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ModalErrorBoundary] Lỗi render trong modal:', error, info);
    if (typeof window !== 'undefined' && isChunkLoadError(error)) {
      try {
        const lastReload = Number(sessionStorage.getItem('vitudy_chunk_reload_ts') || '0');
        if (Date.now() - lastReload > 15_000) {
          sessionStorage.setItem('vitudy_chunk_reload_ts', String(Date.now()));
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
    }
  }

  handleReset = () => {
    if (typeof window !== 'undefined' && isChunkLoadError(this.state.error)) {
      window.location.reload();
      return;
    }
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      const isChunkErr = isChunkLoadError(this.state.error);
      return (
        <div className="p-6 bg-white rounded-2xl border border-rose-200 shadow-xl max-w-md mx-auto my-8 text-center flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            {isChunkErr
              ? 'Phiên bản mới vừa được cập nhật'
              : this.props.fallbackTitle || 'Không thể hiển thị nội dung hộp thoại'}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            {isChunkErr
              ? 'Trình duyệt đang giữ tệp mã cũ từ phiên trước. Bấm tải lại trang để đồng bộ bản mới nhất.'
              : this.state.error?.message || 'Đã xảy ra sự cố giao diện không mong muốn. Dữ liệu bàn học của bạn vẫn an toàn.'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isChunkErr ? 'Tải lại trang' : 'Thử lại / Đóng'}</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

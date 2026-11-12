'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthResult, useOptionalAuth } from '@/context/AuthContext';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSignIn?: (email: string, pass: string) => Promise<AuthResult>;
  onSignUp?: (email: string, pass: string, name?: string) => Promise<AuthResult>;
  onResetPassword?: (email: string) => Promise<AuthResult>;
  isLoading?: boolean;
  error?: string | null;
}

export function AuthForm({ mode, onSignIn, onSignUp, onResetPassword, isLoading = false, error: externalError }: AuthFormProps) {
  const auth = useOptionalAuth();
  const resetFn = onResetPassword || auth?.resetPasswordForEmail;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setForgotSuccess(null);
    if (!email.trim()) {
      setLocalError('Vui lòng nhập email tài khoản của bạn.');
      return;
    }

    if (!resetFn) {
      setLocalError('Chức năng khôi phục mật khẩu tạm thời chưa khả dụng.');
      return;
    }

    setIsSendingReset(true);
    try {
      const res = await resetFn(email.trim());
      if (res.success) {
        setForgotSuccess(`Đã gửi liên kết khôi phục mật khẩu tới ${email}. Vui lòng kiểm tra hộp thư (cả mục Spam nếu cần).`);
      } else {
        setLocalError(res.error || 'Không thể gửi email khôi phục.');
      }
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setLocalError('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }

    if (mode === 'login' && onSignIn) {
      const res = await onSignIn(email, password);
      if (!res.success && res.error) {
        setLocalError(res.error);
      }
    } else if (mode === 'signup' && onSignUp) {
      const res = await onSignUp(email, password, displayName);
      if (!res.success && res.error) {
        setLocalError(res.error);
      }
    }
  };

  const errorMessage = localError || externalError;

  if (isForgotMode) {
    return (
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <button
            type="button"
            onClick={() => {
              setIsForgotMode(false);
              setLocalError(null);
              setForgotSuccess(null);
            }}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại đăng nhập</span>
          </button>
          <h3 className="text-sm font-bold text-slate-900">Khôi phục mật khẩu</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Nhập email tài khoản để nhận đường dẫn đặt lại mật khẩu mới.
          </p>
        </div>

        <div>
          <label htmlFor="reset-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email tài khoản
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tenban@email.com"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0562D] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {forgotSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium leading-relaxed flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{forgotSuccess}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium leading-relaxed">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSendingReset}
          className="w-full py-2.5 px-4 bg-[#E0562D] hover:bg-[#c9451e] text-white text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSendingReset ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang gửi liên kết...</span>
            </>
          ) : (
            <span>Gửi liên kết khôi phục</span>
          )}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" spellCheck={false}>
      {mode === 'signup' && (
        <div>
          <label htmlFor="displayName" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Họ và tên
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0562D] focus:border-transparent transition-all"
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ten@vidu.com"
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0562D] focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
            Mật khẩu
          </label>
          {mode === 'login' && (
            <button
              type="button"
              onClick={() => {
                setIsForgotMode(true);
                setLocalError(null);
                setForgotSuccess(null);
              }}
              className="text-xs text-[#E0562D] hover:underline font-bold cursor-pointer"
            >
              Quên mật khẩu?
            </button>
          )}
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'login' ? 'Nhập mật khẩu của bạn' : 'Tối thiểu 6 ký tự'}
            className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0562D] focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium leading-relaxed">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-[#E0562D] hover:bg-[#c9451e] text-white text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang xử lý...</span>
          </>
        ) : (
          <span>{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</span>
        )}
      </button>
    </form>
  );
}

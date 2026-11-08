'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useViToken } from '@/context/ViTokenContext';
import { AiProvider } from '@/types/vitoken';
import { 
  Flame, 
  Sparkles, 
  History, 
  Cpu, 
  Key, 
  ExternalLink, 
  CheckCircle2, 
  X,
  Bot,
  Store,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Clock,
  ShieldCheck,
  Zap,
  Bell
} from 'lucide-react';
import { MarketModal } from '../modals/MarketModal';

// Vector Coin SVG Icon
function ViTokenCoin({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#E0562D" stroke="#c9451e" strokeWidth="1.5" />
      <text x="12" y="16" textAnchor="middle" fill="white" fontWeight="900" fontSize="11" fontFamily="sans-serif">V</text>
    </svg>
  );
}

// Provider SVG Logos
function OpenAILogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.66-4.5042a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1402-2.0252zm-1.1214-9.976a4.4708 4.4708 0 0 1 2.3418-1.9727V12.02l2.02-1.1636a.0804.0804 0 0 1 .0757 0l4.8398 2.7913-5.8428 3.3685a.7948.7948 0 0 0-.3928.6813v.1514L3.633 14.398a4.504 4.504 0 0 1-1.1546-6.449zm16.8993 4.1444l-5.8428-3.3732 2.02-1.1635a.0804.0804 0 0 1 .0757 0l4.8399 2.7913v5.5826a4.4992 4.4992 0 0 1-3.6128 4.4098v-5.6657a.7948.7948 0 0 0-.3928-.6813zm2.5224-3.529a4.4755 4.4755 0 0 1 .5347 3.0136l-.142-.0852-4.783-2.7582a.7712.7712 0 0 0-.7806 0l-5.8428 3.3685V9.6698a.0804.0804 0 0 1 .0332-.0615l4.8804-2.815a4.4992 4.4992 0 0 1 6.1402 2.0252zM8.8856 12.072l2.368-1.365 2.368 1.365v2.7301l-2.368 1.365-2.368-1.365z"/>
    </svg>
  );
}

function GeminiLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 24A12 12 0 0 1 0 12 12 12 0 0 1 12 0a12 12 0 0 1 12 12 12 12 0 0 1-12 12zm0-3a9 9 0 0 0 9-9 9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 9 9z" fillOpacity="0.1"/>
      <path d="M12 2C12 7.52 7.52 12 2 12c5.52 0 10 4.48 10 10 0-5.52 4.48-10 10-10-5.52 0-10-4.48-10-10z"/>
    </svg>
  );
}

export function TopRightWallet() {
  const { wallet, aiConfig, updateAiConfig, claimDailyStreak } = useViToken();

  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  // Form states for AI config
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>(aiConfig.provider);
  const [apiKeyInput, setApiKeyInput] = useState((aiConfig as any).apiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testConnectionStatus, setTestConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [chatGptCodeInput, setChatGptCodeInput] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const [dailyClaimResult, setDailyClaimResult] = useState<string | null>(null);
  const [dailyReminder, setDailyReminder] = useState(true);

  // Countdown until midnight
  const [timeLeftToMidnight, setTimeLeftToMidnight] = useState('');

  const todayDateStr = new Date().toISOString().split('T')[0];
  const isTodayClaimed = wallet.lastClaimDate === todayDateStr;
  const currentDayOfWeek = (new Date().getDay() + 6) % 7; // 0 = T2, 6 = CN

  // Calculate live countdown to midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeftToMidnight(`${hours}h ${minutes}p`);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, []);

  // Sync reminder from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vitudy_daily_reminder');
      if (saved !== null) {
        setDailyReminder(saved === 'true');
      }
    } catch (e) {}
  }, []);

  // Keyboard shortcut Esc for closing open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDailyModalOpen) setIsDailyModalOpen(false);
        if (isHistoryModalOpen) setIsHistoryModalOpen(false);
        if (isAiModalOpen) setIsAiModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDailyModalOpen, isHistoryModalOpen, isAiModalOpen]);

  // Check if AI config has changes
  const hasAiChanges = useMemo(() => {
    if (selectedProvider !== aiConfig.provider) return true;
    if (selectedProvider.startsWith('byok') && apiKeyInput.trim() !== ((aiConfig as any).apiKey || '')) return true;
    if (selectedProvider === 'oauth_chatgpt' && chatGptCodeInput.trim() !== '') return true;
    return false;
  }, [selectedProvider, apiKeyInput, chatGptCodeInput, aiConfig]);

  const handleClaim = () => {
    const res = claimDailyStreak();
    if (res.earned > 0) {
      setDailyClaimResult(`Tuyệt vời! Bạn đã nhận thành công +${res.earned} ViToken cho ngày hôm nay.`);
    } else {
      setDailyClaimResult(res.message || 'Hôm nay bạn đã nhận thưởng rồi. Hãy quay lại vào ngày mai.');
    }
  };

  const handleTestKey = () => {
    if (!apiKeyInput.trim()) {
      setTestConnectionStatus('error');
      return;
    }
    setTestConnectionStatus('testing');
    setTimeout(() => {
      // Mock validation logic: check key prefix
      if (selectedProvider === 'byok_openai' && (apiKeyInput.startsWith('sk-') || apiKeyInput.length > 20)) {
        setTestConnectionStatus('success');
      } else if (selectedProvider === 'byok_gemini' && (apiKeyInput.startsWith('AIza') || apiKeyInput.length > 20)) {
        setTestConnectionStatus('success');
      } else {
        setTestConnectionStatus('success');
      }
    }, 800);
  };

  const handleSaveAiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateAiConfig({
      provider: selectedProvider,
      apiKey: apiKeyInput.trim() || undefined,
      model: selectedProvider === 'system' 
        ? 'gpt-4o-mini' 
        : selectedProvider === 'byok_openai' 
        ? 'gpt-4o' 
        : selectedProvider === 'oauth_chatgpt' 
        ? 'gpt-4o' 
        : 'gemini-1.5-flash'
    });
    setSaveSuccessMessage('Đã lưu cấu hình AI thành công.');
    setTimeout(() => {
      setSaveSuccessMessage(null);
      setIsAiModalOpen(false);
    }, 1000);
  };

  const WEEK_DAYS = [
    { key: 'mon', label: 'T2', fullLabel: 'Thứ Hai', tokens: 5 },
    { key: 'tue', label: 'T3', fullLabel: 'Thứ Ba', tokens: 5 },
    { key: 'wed', label: 'T4', fullLabel: 'Thứ Tư', tokens: 5 },
    { key: 'thu', label: 'T5', fullLabel: 'Thứ Năm', tokens: 5 },
    { key: 'fri', label: 'T6', fullLabel: 'Thứ Sáu', tokens: 5 },
    { key: 'sat', label: 'T7', fullLabel: 'Thứ Bảy', tokens: 5 },
    { key: 'sun', label: 'CN', fullLabel: 'Chủ Nhật', tokens: 10, isDouble: true },
  ];

  return (
    <>
      <div className="absolute top-4 right-4 z-40 flex items-center bg-white/95 border border-slate-300 rounded-2xl p-1.5 shadow-sm backdrop-blur-md pointer-events-auto select-none">
        {/* Daily Streak Button */}
        <button
          onClick={() => {
            setDailyClaimResult(null);
            setIsDailyModalOpen(true);
          }}
          title={`Chuỗi học tập: ${wallet.streakDays} ngày liên tiếp (Bấm để điểm danh nhận ViToken)`}
          className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all cursor-pointer group ${
            isDailyModalOpen ? 'bg-slate-200' : 'hover:bg-slate-100'
          }`}
        >
          {wallet.streakDays > 0 ? (
            <>
              {/* Ngọn lửa tô đầy ruột màu cam ViT */}
              <Flame className="w-8 h-8 text-[#E0562D] fill-[#E0562D] transition-transform group-hover:scale-105 drop-shadow-xs" />
              {/* Số chuỗi to bằng với icon lửa ở sau và màu trắng */}
              <span className="absolute inset-0 flex items-center justify-center text-sm font-black font-mono text-white select-none pointer-events-none pt-0.5">
                {wallet.streakDays}
              </span>
            </>
          ) : (
            <>
              <Flame className="w-7 h-7 text-slate-400 stroke-[2] transition-transform group-hover:scale-105" />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono text-slate-500 select-none pointer-events-none pt-0.5">
                0
              </span>
            </>
          )}
        </button>

        <div className="w-[1px] h-6 bg-slate-200 my-auto mx-0.5" />

        {/* Chợ Tài Liệu */}
        <button
          onClick={() => setIsMarketOpen(true)}
          title="Chợ Tài Liệu"
          className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all cursor-pointer group ${
            isMarketOpen 
              ? 'bg-slate-200 text-slate-900' 
              : 'text-slate-900 hover:text-black hover:bg-slate-100'
          }`}
        >
          <Store className="w-5 h-5 text-slate-900 stroke-[2.4]" />
        </button>

        <div className="w-[1px] h-6 bg-slate-200 my-auto mx-0.5" />

        {/* Credit Balance Pill */}
        <button
          onClick={() => setIsHistoryModalOpen(true)}
          className={`flex items-center gap-2 px-3 h-11 rounded-xl transition-all cursor-pointer ${
            isHistoryModalOpen ? 'bg-slate-200 text-slate-900' : 'text-slate-900 hover:bg-slate-100'
          }`}
          title="Xem lịch sử số dư ViToken (1 V = 1 ViToken)"
        >
          <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-xs">
            V
          </div>
          <span className="text-sm font-black font-mono text-slate-900">
            {wallet.balance}
          </span>
        </button>

        <div className="w-[1px] h-6 bg-slate-200 my-auto mx-0.5" />

        {/* AI Bot Pill */}
        <button
          onClick={() => setIsAiModalOpen(true)}
          className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all cursor-pointer ${
            isAiModalOpen 
              ? 'bg-slate-200 text-slate-900' 
              : 'text-slate-900 hover:text-black hover:bg-slate-100'
          }`}
          title={`Cài đặt mô hình AI (Mô hình: ${aiConfig.model})`}
        >
          <Bot className="w-5 h-5 text-slate-900 stroke-[2.4]" />
        </button>
      </div>

      {/* MODAL: Chợ Tài Liệu */}
      <MarketModal
        isOpen={isMarketOpen}
        onClose={() => setIsMarketOpen(false)}
      />

      {/* MODAL: Điểm danh nhận ViToken (Section 5) */}
      {isDailyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-center text-slate-900 animate-fade-in font-sans">
            {/* 44px close button touch target */}
            <button
              onClick={() => setIsDailyModalOpen(false)}
              aria-label="Đóng điểm danh"
              className="absolute top-3.5 right-3.5 w-11 h-11 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-2.5">
              <Flame className="w-7 h-7 text-[#E0562D] fill-[#E0562D]" />
            </div>

            <h3 className="text-base font-black text-slate-900 mb-1">
              Điểm danh hằng ngày
            </h3>
            <p className="text-xs text-slate-500 mb-3.5 leading-relaxed">
              Điểm danh mỗi ngày nhận 5 ViToken, riêng Chủ Nhật x2 nhận 10 ViToken.
            </p>

            {/* 7 Day States Grid */}
            <div className="grid grid-cols-7 gap-1.5 mb-3.5">
              {WEEK_DAYS.map((day, idx) => {
                const isToday = idx === currentDayOfWeek;
                const isPast = idx < currentDayOfWeek;
                const isClaimedToday = isToday && isTodayClaimed;
                const isSunday = day.key === 'sun';
                // A past day was claimed if user's streak includes it
                const isPastClaimed = isPast && (wallet.streakDays >= (currentDayOfWeek - idx));
                const isClaimed = isClaimedToday || isPastClaimed;
                const isMissed = isPast && !isClaimed;

                return (
                  <div key={day.key} className="flex flex-col items-center" title={`${day.fullLabel}: +${day.tokens} ViToken`}>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border shadow-2xs select-none relative ${
                        isClaimed
                          ? 'bg-emerald-500 border-emerald-600 text-white font-bold'
                          : isToday && !isTodayClaimed
                          ? 'bg-[#FFF7ED] border-[#E0562D] text-[#9A3412] font-black ring-2 ring-[#E0562D] ring-offset-1 animate-pulse'
                          : isSunday
                          ? 'bg-orange-50 border-orange-300 text-[#E0562D] font-black'
                          : isMissed
                          ? 'bg-slate-100 border-slate-200 text-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {isClaimed ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : isMissed ? (
                        <span className="text-xs font-bold text-slate-400 font-mono">-</span>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-[10.5px] font-black font-mono">
                            +{day.tokens}
                          </span>
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-[11px] font-bold mt-1.5 select-none ${
                        isToday ? 'text-[#E0562D] font-black' : 'text-slate-500'
                      }`}
                    >
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Streak Days + Next Reward Milestone */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-3 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Flame className="w-4 h-4 text-[#E0562D] fill-[#E0562D]" />
                  <span>Chuỗi {wallet.streakDays} ngày</span>
                </div>
                <span className="text-[11px] font-bold text-[#E0562D]">
                  {wallet.streakDays < 7 
                    ? `Mốc 7 ngày: +20 ViToken` 
                    : `Mốc 14 ngày: +50 ViToken`}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#E0562D] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(14, ((wallet.streakDays % 7) / 7) * 100))}%` }}
                />
              </div>
            </div>

            {/* Daily Reminder Toggle */}
            <label className="flex items-center justify-center gap-2 text-[11.5px] text-slate-600 mb-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dailyReminder}
                onChange={(e) => {
                  setDailyReminder(e.target.checked);
                  try {
                    localStorage.setItem('vitudy_daily_reminder', String(e.target.checked));
                  } catch (err) {}
                }}
                className="w-3.5 h-3.5 accent-[#E0562D] rounded cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Bell className="w-3 h-3 text-slate-400" />
                <span>Nhắc tôi điểm danh mỗi ngày</span>
              </span>
            </label>

            {dailyClaimResult ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs mb-1 font-semibold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{dailyClaimResult}</span>
              </div>
            ) : isTodayClaimed ? (
              <button
                disabled
                className="w-full py-2.5 bg-slate-100 text-slate-500 border border-slate-200 font-bold rounded-xl text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Đã nhận hôm nay • Nhận tiếp sau {timeLeftToMidnight}</span>
              </button>
            ) : (
              <button
                onClick={handleClaim}
                className="w-full py-2.5 bg-[#E0562D] hover:bg-[#c9451e] text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ViTokenCoin className="w-4 h-4" />
                <span>Nhận ViToken ngay</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Lịch sử ViToken */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-slate-900 animate-fade-in font-sans">
            <button
              onClick={() => setIsHistoryModalOpen(false)}
              aria-label="Đóng lịch sử"
              className="absolute top-3.5 right-3.5 w-11 h-11 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Lịch sử ViToken</h3>
                <p className="text-[11px] text-slate-500">Số dư hiện tại: <strong className="font-mono text-slate-900 font-black">{wallet.balance} ViToken</strong> (1 V = 1 ViToken)</p>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mt-3">
              {wallet.history.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Chưa có giao dịch nào
                </div>
              ) : (
                wallet.history.map(tx => (
                  <div 
                    key={tx.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-medium text-slate-800">{tx.description}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(tx.timestamp).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <span className={`font-mono font-bold ${tx.amount >= 0 ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} V
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cài đặt kết nối AI (Section 6) */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-slate-900 animate-fade-in font-sans">
            {/* 44px close button touch target */}
            <button
              onClick={() => setIsAiModalOpen(false)}
              aria-label="Đóng cài đặt AI"
              className="absolute top-3.5 right-3.5 w-11 h-11 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">Cài đặt kết nối AI</h3>
                <p className="text-xs text-slate-500">
                  Chọn nhà cung cấp trí tuệ nhân tạo để phân tích, tóm tắt và sinh đề thi.
                </p>
              </div>
            </div>

            {/* User ViToken Balance in AI Modal */}
            <div className="my-3 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs">
              <span className="text-slate-600 font-medium">Số dư ví của bạn:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-slate-900">{wallet.balance} ViToken</span>
                <div className="w-4 h-4 rounded-full bg-slate-900 text-white font-black text-[9px] flex items-center justify-center">
                  V
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveAiConfig} className="space-y-3">
              {/* Provider Choices */}
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: 'system',
                    name: 'Hệ thống ViTudy',
                    badge: 'Trừ ViToken',
                    badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200',
                    desc: 'Sử dụng mô hình GPT-4o-mini tiêu chuẩn qua máy chủ ViTudy.',
                    model: 'GPT-4o-mini',
                    icon: <Sparkles className="w-4 h-4 text-[#E0562D]" />
                  },
                  {
                    id: 'byok_gemini',
                    name: 'Google Gemini',
                    badge: 'Miễn phí theo hạn mức',
                    badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    desc: 'Dùng API Key cá nhân từ Google AI Studio, hoàn toàn miễn phí theo hạn mức.',
                    model: 'Gemini 1.5 Flash',
                    icon: <GeminiLogo className="w-4 h-4 text-sky-600" />
                  },
                  {
                    id: 'byok_openai',
                    name: 'OpenAI cá nhân (BYOK)',
                    badge: 'Khóa cá nhân',
                    badgeStyle: 'bg-sky-50 text-sky-800 border-sky-200',
                    desc: 'Nhập API Key OpenAI cá nhân của bạn. Không trừ ViToken của hệ thống.',
                    model: 'GPT-4o',
                    icon: <OpenAILogo className="w-4 h-4 text-slate-900" />
                  },
                  {
                    id: 'oauth_chatgpt',
                    name: 'Đăng nhập bằng tài khoản ChatGPT',
                    badge: 'Ủy quyền tài khoản',
                    badgeStyle: 'bg-purple-50 text-purple-800 border-purple-200',
                    desc: 'Ủy quyền trực tiếp tài khoản ChatGPT Plus qua giao thức bảo mật PKCE.',
                    model: 'GPT-4o Plus',
                    icon: <OpenAILogo className="w-4 h-4 text-purple-700" />
                  }
                ].map(opt => {
                  const isSelected = selectedProvider === opt.id;
                  const isCurrentActive = aiConfig.provider === opt.id;

                  return (
                    <label
                      key={opt.id}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer flex items-start justify-between gap-3 transition-all ${
                        isSelected
                          ? 'bg-slate-50/80 border-slate-900 ring-1 ring-slate-900'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="radio"
                          name="ai_provider"
                          value={opt.id}
                          checked={isSelected}
                          onChange={() => {
                            setSelectedProvider(opt.id as any);
                            setTestConnectionStatus('idle');
                          }}
                          className="mt-1 accent-slate-900 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900">{opt.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${opt.badgeStyle}`}>
                              {opt.badge}
                            </span>
                            {isCurrentActive && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
                                Đang dùng
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {opt.desc}
                          </div>
                          <div className="text-[10.5px] font-mono text-slate-400 mt-1">
                            Mô hình: <span className="font-bold text-slate-700">{opt.model}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0 mt-0.5">
                        {opt.icon}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* BYOK API Key Section */}
              {selectedProvider.startsWith('byok') && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-800">
                      Nhập API Key ({selectedProvider === 'byok_openai' ? 'OpenAI: sk-...' : 'Gemini: AIza...'})
                    </label>
                    <a
                      href={selectedProvider === 'byok_openai' ? 'https://platform.openai.com/api-keys' : 'https://aistudio.google.com/app/apikey'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#E0562D] hover:underline flex items-center gap-0.5 text-[11px] font-semibold"
                    >
                      <span>Lấy khóa API</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder={selectedProvider === 'byok_openai' ? 'sk-proj-...' : 'AIzaSy...'}
                      value={apiKeyInput}
                      onChange={(e) => {
                        setApiKeyInput(e.target.value);
                        setTestConnectionStatus('idle');
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-3 pr-20 py-2 text-xs text-slate-900 outline-none focus:border-slate-800 font-mono"
                    />
                    <div className="absolute right-1.5 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        title={showApiKey ? 'Ẩn khóa' : 'Hiện khóa'}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={handleTestKey}
                        disabled={testConnectionStatus === 'testing' || !apiKeyInput.trim()}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-[10.5px] font-bold text-slate-700 rounded-lg cursor-pointer transition-colors"
                      >
                        {testConnectionStatus === 'testing' ? 'Kiểm tra...' : 'Test'}
                      </button>
                    </div>
                  </div>

                  {/* Test Connection Result */}
                  {testConnectionStatus === 'success' && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kết nối API hợp lệ và sẵn sàng sử dụng.</span>
                    </div>
                  )}
                  {testConnectionStatus === 'error' && (
                    <div className="flex items-center gap-1.5 text-[11px] text-red-600 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>Vui lòng nhập khóa API hợp lệ trước khi kiểm tra.</span>
                    </div>
                  )}

                  {/* Security Notice */}
                  <div className="flex items-start gap-1.5 text-[10.5px] text-slate-500 pt-1 border-t border-slate-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>Khóa API được lưu cục bộ an toàn trên trình duyệt của bạn, không gửi qua máy chủ trung gian.</span>
                  </div>
                </div>
              )}

              {/* OAuth ChatGPT Section */}
              {selectedProvider === 'oauth_chatgpt' && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Đăng nhập tài khoản ChatGPT</span>
                    <a
                      href="https://chatgpt.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-900 hover:underline flex items-center gap-0.5 text-[11px] font-bold"
                    >
                      <span>Mở ChatGPT Web</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Ủy quyền tài khoản ChatGPT Plus để sử dụng trực tiếp hạn mức gói của bạn mà không tốn ViToken.
                  </p>
                  <input
                    type="text"
                    placeholder="Dán mã ủy quyền callback tại đây..."
                    value={chatGptCodeInput}
                    onChange={(e) => setChatGptCodeInput(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-800 font-mono"
                  />
                </div>
              )}

              {saveSuccessMessage && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{saveSuccessMessage}</span>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={!hasAiChanges}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#E0562D] hover:bg-[#c9451e] disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

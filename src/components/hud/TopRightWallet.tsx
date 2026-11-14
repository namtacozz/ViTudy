'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  Bell,
  Plus,
  RefreshCw,
  ClipboardPaste,
  LogOut,
  ChevronDown,
  ChevronUp,
  Info,
  Lock
} from 'lucide-react';
import { MarketModal } from '../modals/MarketModal';
import { TopUpModal } from '../payment/TopUpModal';
import { testAiConnection, exchangeOpenAiCode } from '@/lib/aiClient';
import {
  startOpenAiPkceLogin,
  getOpenAiOAuthSession,
  clearOpenAiOAuthSession,
  OpenAiOAuthSession,
} from '@/lib/openaiOAuth';
import { getAssetPath } from '@/lib/assets';

// Vector Coin SVG Icon -> Logo ViToken chính thức từ vitoken.svg
function ViTokenCoin({ className = "w-4 h-4" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={getAssetPath('/icons/vitoken.svg')} 
      alt="ViToken" 
      width={16}
      height={16}
      className={`${className} object-contain inline-block flex-shrink-0`}
      style={{ width: '16px', height: '16px', maxWidth: '16px', maxHeight: '16px' }}
    />
  );
}

export interface ModelItem {
  id: string;
  name: string;
  desc: string;
}

export interface ModelGroup {
  group: string;
  models: ModelItem[];
}

const CHATGPT_MODEL_GROUPS: ModelGroup[] = [
  {
    group: 'Siêu suy luận & Chuyên sâu',
    models: [
      { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra', desc: 'Mạnh nhất, phù hợp bài toán nhiều bước' },
      { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna', desc: 'Phản hồi sâu, xử lý tài liệu dài' },
      { id: 'gpt-5.6-sol', name: 'GPT-5.6 Sol', desc: 'Phân tích cấu trúc và tổng hợp' },
      { id: 'o3-mini', name: 'o3-mini', desc: 'Tối ưu cho Toán và lập trình' },
      { id: 'o1', name: 'o1', desc: 'Suy luận từng bước chi tiết' },
    ]
  },
  {
    group: 'Cân bằng & Đa dụng',
    models: [
      { id: 'gpt-5.5', name: 'GPT-5.5', desc: 'Cân bằng tốc độ và độ chính xác' },
      { id: 'gpt-5', name: 'GPT-5', desc: 'Đa dụng cho các môn học' },
      { id: 'gpt-4o', name: 'GPT-4o', desc: 'Hiểu hình ảnh và văn bản' },
      { id: 'chatgpt-4o-latest', name: 'ChatGPT-4o Latest', desc: 'Bản cập nhật thường xuyên' },
    ]
  },
  {
    group: 'Phản hồi nhanh & Tiết kiệm',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Phản hồi nhanh và tiết kiệm' },
      { id: 'o1-mini', name: 'o1-mini', desc: 'Suy luận nhanh cho bài tập ngắn' },
    ]
  }
];

const SYSTEM_MODEL_LIST: ModelItem[] = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Mặc định · Phản hồi nhanh và tiết kiệm' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Tối ưu tóm tắt và sinh câu hỏi' },
  { id: 'gpt-4o', name: 'GPT-4o', desc: 'Phân tích bài toán chuyên sâu' },
];

const BYOK_GEMINI_MODELS: ModelItem[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Nhanh, nhẹ, miễn phí' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Suy luận đa phương thức nâng cao' },
];

const BYOK_OPENAI_MODELS: ModelItem[] = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Nhanh & tiết kiệm chi phí' },
  { id: 'gpt-4o', name: 'GPT-4o', desc: 'Toàn diện cao cấp' },
  { id: 'o3-mini', name: 'o3-mini', desc: 'Suy luận STEM xuất sắc' },
];

const PROVIDER_MODELS: Record<AiProvider, ModelItem[]> = {
  system: SYSTEM_MODEL_LIST,
  oauth_chatgpt: CHATGPT_MODEL_GROUPS.flatMap(g => g.models),
  byok_gemini: BYOK_GEMINI_MODELS,
  byok_openai: BYOK_OPENAI_MODELS,
  byok_claude: [],
  oauth_gemini: []
};

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
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeAllModals = () => {
    setIsDailyModalOpen(false);
    setIsHistoryModalOpen(false);
    setIsAiModalOpen(false);
    setIsMarketOpen(false);
    setIsTopUpOpen(false);
  };

  // Form states for AI config
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>(aiConfig.provider);
  const [selectedModel, setSelectedModel] = useState<string>(aiConfig.model || 'gpt-4o-mini');
  const [apiKeyInput, setApiKeyInput] = useState((aiConfig as any).apiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAdvancedByok, setShowAdvancedByok] = useState(false);
  const [autoFallbackToSystem, setAutoFallbackToSystem] = useState(true);
  const [chatGptCodeInput, setChatGptCodeInput] = useState('');
  const [oauthSession, setOauthSession] = useState<OpenAiOAuthSession | null>(null);
  const [isExchangingOAuth, setIsExchangingOAuth] = useState(false);
  const [hasOpenedPkceWindow, setHasOpenedPkceWindow] = useState(false);
  const [testConnectionStatus, setTestConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResultMessage, setTestResultMessage] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAiModalOpen) {
      if (typeof window !== 'undefined') {
        const fallbackPref = localStorage.getItem('vitudy_auto_fallback_system');
        if (fallbackPref !== null) {
          setAutoFallbackToSystem(fallbackPref === 'true');
        }
      }
      setSelectedProvider(aiConfig.provider);
      const currentModels = PROVIDER_MODELS[aiConfig.provider] || [];
      const isValid = currentModels.some((m) => m.id === aiConfig.model);
      if (isValid) {
        setSelectedModel(aiConfig.model);
      } else if (currentModels.length > 0) {
        setSelectedModel(currentModels[0].id);
      }
      setOauthSession(getOpenAiOAuthSession());
      setTestConnectionStatus('idle');
      setTestResultMessage(null);
    }
  }, [isAiModalOpen, aiConfig]);

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
        if (isTopUpOpen) setIsTopUpOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDailyModalOpen, isHistoryModalOpen, isAiModalOpen, isTopUpOpen]);

  // Check if AI config has changes
  const hasAiChanges = useMemo(() => {
    if (selectedProvider !== aiConfig.provider) return true;
    if (selectedModel !== (aiConfig.model || 'gpt-4o-mini')) return true;
    if (selectedProvider === 'oauth_chatgpt' && (chatGptCodeInput.trim() !== '' || Boolean(oauthSession) !== Boolean(aiConfig.isOauthConnected))) return true;
    if ((selectedProvider === 'byok_gemini' || selectedProvider === 'byok_openai') && apiKeyInput.trim() !== ((aiConfig as any).apiKey || '')) return true;
    return false;
  }, [selectedProvider, selectedModel, chatGptCodeInput, oauthSession, aiConfig, apiKeyInput]);

  const handleStartOpenAiPkce = async () => {
    try {
      setTestConnectionStatus('idle');
      setTestResultMessage(null);
      const { authorizeUrl } = await startOpenAiPkceLogin();
      setHasOpenedPkceWindow(true);
      window.open(authorizeUrl, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      setTestConnectionStatus('error');
      setTestResultMessage(err.message || 'Không thể khởi tạo phiên đăng nhập PKCE.');
    }
  };

  const handleConnectOpenAiInput = async (rawValue?: string) => {
    const inputToUse = (rawValue ?? chatGptCodeInput).trim();
    if (!inputToUse) {
      setTestConnectionStatus('error');
      setTestResultMessage('Vui lòng dán đường dẫn callback (http://localhost:1455/auth/callback?code=...) hoặc nội dung auth.json.');
      return;
    }

    setIsExchangingOAuth(true);
    setTestConnectionStatus('testing');
    setTestResultMessage(null);
    try {
      const session = await exchangeOpenAiCode(inputToUse);
      setOauthSession(session);
      setChatGptCodeInput('');
      setHasOpenedPkceWindow(false);
      updateAiConfig({
        provider: 'oauth_chatgpt',
        model: selectedModel,
        isOauthConnected: true,
      });
      setTestConnectionStatus('success');
      const accountLabel = session.email || (session.accountId ? `ID ${session.accountId.slice(0, 8)}...` : 'ChatGPT Plus');
      setTestResultMessage(`Đã kết nối thành công tài khoản ${accountLabel} (Chuẩn PKCE + Tự động gia hạn Token).`);
    } catch (err: any) {
      setTestConnectionStatus('error');
      setTestResultMessage(err.message || 'Không thể đổi mã ủy quyền OpenAI OAuth.');
    } finally {
      setIsExchangingOAuth(false);
    }
  };

  const handlePasteAndConnectOneClick = async () => {
    try {
      if (chatGptCodeInput.trim()) {
        await handleConnectOpenAiInput(chatGptCodeInput);
        return;
      }
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText && clipText.trim()) {
          setChatGptCodeInput(clipText.trim());
          await handleConnectOpenAiInput(clipText.trim());
          return;
        }
      }
      setTestConnectionStatus('error');
      setTestResultMessage('Bộ nhớ tạm (Clipboard) đang trống hoặc trình duyệt chặn quyền đọc. Hãy dán (Ctrl+V) vào ô bên dưới.');
    } catch {
      setTestConnectionStatus('error');
      setTestResultMessage('Trình duyệt yêu cầu dán thủ công: Hãy nhấn Ctrl+V vào ô nhập bên dưới rồi bấm Kết nối.');
    }
  };

  const handleDisconnectOpenAi = () => {
    clearOpenAiOAuthSession();
    setOauthSession(null);
    setChatGptCodeInput('');
    setHasOpenedPkceWindow(false);
    updateAiConfig({
      provider: selectedProvider,
      model: selectedModel,
      isOauthConnected: false,
    });
    setTestConnectionStatus('idle');
    setTestResultMessage(null);
  };

  const handleDisconnectConfirm = () => {
    if (typeof window !== 'undefined' && !window.confirm('Bạn có chắc chắn muốn ngắt kết nối tài khoản ChatGPT khỏi ViTudy?')) {
      return;
    }
    handleDisconnectOpenAi();
  };

  const handleProviderKeyDown = (e: React.KeyboardEvent, provider: AiProvider) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleSelectProvider(provider === 'system' ? 'oauth_chatgpt' : 'system');
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      handleSelectProvider(provider === 'system' ? 'oauth_chatgpt' : 'system');
    }
  };

  const handleClaim = () => {
    const res = claimDailyStreak();
    if (res.earned > 0) {
      setDailyClaimResult(`Tuyệt vời! Bạn đã nhận thành công +${res.earned} ViToken cho ngày hôm nay.`);
    } else {
      setDailyClaimResult(res.message || 'Hôm nay bạn đã nhận thưởng rồi. Hãy quay lại vào ngày mai.');
    }
  };

  const handleSelectProvider = (provider: AiProvider) => {
    setSelectedProvider(provider);
    setTestConnectionStatus('idle');
    setTestResultMessage(null);
    const models = PROVIDER_MODELS[provider] || [];
    if (models.length > 0) {
      setSelectedModel(models[0].id);
    }
  };

  const handleTestConnection = async () => {
    setTestConnectionStatus('testing');
    setTestResultMessage(null);
    try {
      const result = await testAiConnection({
        provider: selectedProvider,
        model: selectedModel,
        apiKey: apiKeyInput,
        accessToken: chatGptCodeInput
      });
      if (result.success) {
        setTestConnectionStatus('success');
        setTestResultMessage(result.message);
      } else {
        setTestConnectionStatus('error');
        setTestResultMessage(result.message);
      }
    } catch (err: any) {
      setTestConnectionStatus('error');
      setTestResultMessage(err.message || 'Lỗi kiểm tra kết nối.');
    }
  };

  const handleSaveAiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProvider === 'oauth_chatgpt' && chatGptCodeInput.trim() && !oauthSession) {
      await handleConnectOpenAiInput(chatGptCodeInput);
    }
    updateAiConfig({
      provider: selectedProvider,
      model: selectedModel,
      isOauthConnected: selectedProvider === 'oauth_chatgpt' ? Boolean(getOpenAiOAuthSession()) : false,
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
      <div 
        data-tour="wallet-market"
        className="relative flex items-center bg-white/95 border border-slate-300 rounded-xl sm:rounded-2xl p-0.5 sm:p-1.5 shadow-sm backdrop-blur-md pointer-events-auto select-none gap-0.5 sm:gap-1 max-w-[50vw] shrink-0 justify-end"
      >
        {/* Daily Streak Button */}
        <button
          onClick={() => {
            closeAllModals();
            setDailyClaimResult(null);
            setIsDailyModalOpen(true);
          }}
          title={`Chuỗi học tập: ${wallet.streakDays} ngày liên tiếp (Bấm để điểm danh nhận ViToken)`}
          className={`relative flex items-center justify-center w-8.5 h-8.5 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl transition-all cursor-pointer group ${
            isDailyModalOpen ? 'bg-slate-200' : 'hover:bg-slate-100'
          }`}
        >
          {wallet.streakDays > 0 ? (
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
              {/* Ngọn lửa Cam ViT với bụng tròn ôm trọn số chuỗi ngày */}
              <Flame className="w-6.5 h-6.5 sm:w-8.5 sm:h-8.5 text-[#E0562D] fill-[#E0562D] drop-shadow-xs transition-transform group-hover:scale-105" />
              {/* Số chuỗi căn chuẩn xác 100% vào tâm bụng tròn ngọn lửa (x=50%, y=64%) */}
              <span className="absolute top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] sm:text-[11px] font-black font-mono text-white select-none pointer-events-none leading-none">
                {wallet.streakDays}
              </span>
            </div>
          ) : (
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
              <Flame className="w-5.5 h-5.5 sm:w-7.5 sm:h-7.5 text-slate-400 stroke-[2] transition-transform group-hover:scale-105" />
              <span className="absolute top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9.5px] sm:text-[10.5px] font-bold font-mono text-slate-500 select-none pointer-events-none leading-none">
                0
              </span>
            </div>
          )}
        </button>

        <div className="hidden sm:block w-[1px] h-5 sm:h-6 bg-slate-200 my-auto mx-0.5" />

        {/* Chợ Tài Liệu (Ẩn trên mobile nhỏ để tránh đè lên TopLeftNav) */}
        <button
          id="market-trigger-btn"
          data-tour="market-btn"
          onClick={() => {
            closeAllModals();
            setIsMarketOpen(true);
          }}
          title="Chợ tài liệu"
          aria-label="Chợ tài liệu"
          className={`hidden sm:flex items-center justify-center w-8.5 h-8.5 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl transition-all cursor-pointer group ${
            isMarketOpen 
              ? 'bg-slate-200 text-slate-900' 
              : 'text-slate-900 hover:text-black hover:bg-slate-100'
          }`}
        >
          <Store className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900 stroke-[2.4]" />
        </button>

        <div className="w-[1px] h-5 sm:h-6 bg-slate-200 my-auto mx-0.5" />

        {/* Credit Balance & Top Up Pill */}
        <div className="flex items-center bg-slate-100/70 rounded-lg sm:rounded-xl p-0.5 border border-slate-200">
          <button
            id="wallet-history-trigger-btn"
            onClick={() => {
              closeAllModals();
              setIsHistoryModalOpen(true);
            }}
            className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 h-7.5 sm:h-10 rounded-md sm:rounded-lg transition-all cursor-pointer ${
              isHistoryModalOpen ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-800 hover:bg-white/80'
            }`}
            title={`Số dư: ${wallet.balance} ViToken · Bấm để xem lịch sử nạp & trừ điểm`}
            aria-label={`Số dư ví: ${wallet.balance} ViToken. Bấm để xem lịch sử giao dịch`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={getAssetPath('/icons/vitoken.svg')} 
              alt="ViToken" 
              width={20}
              height={20}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-contain shrink-0" 
              style={{ width: '18px', height: '18px', maxWidth: '20px', maxHeight: '20px' }}
            />
            <span className="text-xs font-black font-mono text-slate-900">
              {wallet.balance}
            </span>
            <span className="text-[11px] font-bold text-slate-600 hidden sm:inline">
              ViToken
            </span>
          </button>

          <button
            id="topup-trigger-btn"
            onClick={() => {
              closeAllModals();
              setIsTopUpOpen(true);
            }}
            title="Nạp ViToken (VietQR)"
            aria-label="Nạp ViToken qua VietQR"
            className="flex items-center justify-center w-7.5 h-7.5 sm:w-10 sm:h-10 min-w-[30px] sm:min-w-[40px] rounded-md sm:rounded-lg bg-[#E0562D] hover:bg-[#c9451e] text-white transition-all shadow-xs active:scale-95 cursor-pointer ml-0.5"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
          </button>
        </div>

        <div className="hidden sm:block w-[1px] h-5 sm:h-6 bg-slate-200 my-auto mx-0.5" />

        {/* AI Bot Pill (Ẩn trên mobile nhỏ để tránh đè lên TopLeftNav) */}
        <button
          id="ai-config-trigger-btn"
          data-tour="inteline-btn"
          onClick={() => {
            closeAllModals();
            setIsAiModalOpen(true);
          }}
          className={`hidden sm:flex items-center justify-center w-8.5 h-8.5 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl transition-all cursor-pointer ${
            isAiModalOpen 
              ? 'bg-slate-200 text-slate-900' 
              : 'text-slate-900 hover:text-black hover:bg-slate-100'
          }`}
          title="Cài đặt AI"
          aria-label="Cài đặt AI"
        >
          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900 stroke-[2.4]" />
        </button>
      </div>

      {/* MODAL: Chợ Tài Liệu */}
      <MarketModal
        isOpen={isMarketOpen}
        onClose={() => setIsMarketOpen(false)}
      />

      {/* MODAL: Điểm danh nhận ViToken (Section 5) */}
      {isDailyModalOpen && mounted && createPortal(
        <div 
          id="streak-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDailyModalOpen(false);
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9990] flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-300 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-center text-slate-900 animate-fade-in font-sans"
          >
            {/* 44px close button touch target */}
            <button
              id="close-streak-modal"
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
                          ? 'bg-[#FFF7ED] border-[#E0562D] text-[#9A3412] font-black ring-2 ring-[#E0562D] ring-offset-2 animate-pulse'
                          : isToday && isTodayClaimed
                          ? 'bg-emerald-500 border-emerald-600 text-white font-bold ring-2 ring-emerald-500 ring-offset-1'
                          : isSunday
                          ? 'bg-orange-50 border-orange-300 text-[#E0562D] font-black'
                          : isMissed
                          ? 'bg-slate-100 border-dashed border-slate-300 text-slate-400 opacity-60'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      {isClaimed ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : isMissed ? (
                        <span className="text-[10px] font-bold text-slate-400 font-mono">lỡ</span>
                      ) : (
                        <div className="flex items-center gap-0.5">
                          <span className="text-[11px] font-black font-mono text-slate-900">
                            +{day.tokens}
                          </span>
                          <ViTokenCoin className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-[11px] font-bold mt-1.5 select-none ${
                        isToday ? 'text-[#E0562D] font-black' : 'text-slate-600'
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
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Flame className="w-4 h-4 text-[#E0562D] fill-[#E0562D]" />
                  <span>Chuỗi {wallet.streakDays} ngày</span>
                  <span className="text-[10.5px] font-mono font-bold text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                    {(wallet.streakDays % 7) || (wallet.streakDays > 0 ? 7 : 0)}/7 ngày
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#E0562D]">
                  {wallet.streakDays < 7 
                    ? `Mốc 7 ngày: +20 ViToken` 
                    : `Mốc 14 ngày: +50 ViToken`}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
                <div 
                  className="bg-[#E0562D] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(12, (((wallet.streakDays % 7) || (wallet.streakDays > 0 ? 7 : 0)) / 7) * 100))}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-2 leading-tight">
                Chuỗi tính theo số ngày điểm danh liên tiếp. Bỏ lỡ 1 ngày sẽ tính lại từ ngày 1. Đạt mốc 7 ngày nhận thêm +20 ViToken.
              </div>
            </div>

            {/* Daily Reminder Toggle */}
            <label className="flex items-center justify-center gap-2 text-[11.5px] text-slate-600 mb-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dailyReminder}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setDailyReminder(checked);
                  if (checked && typeof window !== 'undefined' && 'Notification' in window) {
                    Notification.requestPermission();
                  }
                  try {
                    localStorage.setItem('vitudy_daily_reminder', String(checked));
                  } catch (err) {}
                }}
                className="w-3.5 h-3.5 accent-[#E0562D] rounded cursor-pointer"
              />
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Bell className="w-3.5 h-3.5 text-slate-500" />
                <span>Nhắc tôi qua thông báo trình duyệt mỗi ngày</span>
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
        </div>,
        document.body
      )}

      {/* MODAL: Lịch sử ViToken */}
      {isHistoryModalOpen && mounted && createPortal(
        <div 
          id="history-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsHistoryModalOpen(false);
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9990] flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-300 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-slate-900 animate-fade-in font-sans"
          >
            <button
              id="close-history-modal"
              onClick={() => setIsHistoryModalOpen(false)}
              aria-label="Đóng lịch sử"
              className="absolute top-3.5 right-3.5 w-11 h-11 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Lịch sử ViToken</h3>
                  <p className="text-[11px] text-slate-500">Số dư hiện tại: <strong className="font-mono text-slate-900 font-black">{wallet.balance} ViToken</strong></p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsHistoryModalOpen(false);
                  setIsTopUpOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Nạp ViToken</span>
              </button>
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
        </div>,
        document.body
      )}

      {/* MODAL: Cài đặt kết nối AI (Section 6) */}
      {isAiModalOpen && mounted && createPortal(
        <div 
          id="ai-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAiModalOpen(false);
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9990] flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 shadow-xl relative text-slate-900 animate-fade-in font-sans"
          >
            {/* 44px close button touch target */}
            <button
              id="close-ai-modal"
              onClick={() => setIsAiModalOpen(false)}
              aria-label="Đóng cài đặt AI"
              className="absolute top-3.5 right-3.5 w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">Cài đặt kết nối AI</h3>
                <p className="text-xs text-slate-500">
                  Chọn nhà cung cấp trí tuệ nhân tạo để phân tích, tóm tắt và sinh đề thi.
                </p>
              </div>
            </div>

            {/* User ViToken Balance in AI Modal */}
            <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 text-slate-500 mb-4">
              <span>Số dư ví của bạn:</span>
              <span className="font-mono font-bold text-slate-900">{wallet.balance} ViToken</span>
            </div>

            <form onSubmit={handleSaveAiConfig} className="space-y-6 max-h-[75vh] overflow-y-auto pr-1 pb-6">
              {/* 1. Chọn Nhà Cung Cấp */}
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-2">
                  1. Chọn Nhà cung cấp AI
                </label>
                <div 
                  role="radiogroup" 
                  aria-label="Chọn nhà cung cấp AI"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
                >
                  {[
                    {
                      id: 'system' as AiProvider,
                      name: 'ViTudy (Hệ thống)',
                      desc: '2 ViToken / lượt thao tác chuyên sâu (nhận miễn phí khi điểm danh).',
                      icon: <Sparkles className="w-3.5 h-3.5 text-slate-600" />
                    },
                    {
                      id: 'oauth_chatgpt' as AiProvider,
                      name: 'Đăng nhập ChatGPT',
                      desc: 'Dùng tài khoản ChatGPT của bạn, không tốn ViToken.',
                      icon: <OpenAILogo className="w-3.5 h-3.5 text-slate-600" />
                    }
                  ].map(opt => {
                    const isSelected = selectedProvider === opt.id;

                    return (
                      <div
                        key={opt.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onKeyDown={(e) => handleProviderKeyDown(e, opt.id)}
                        onClick={() => handleSelectProvider(opt.id)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer flex flex-col justify-between transition-all select-none ${
                          isSelected
                            ? 'border-2 border-[#E0562D] bg-[#FFF7ED]/25 text-slate-900'
                            : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            {opt.icon}
                            <span className="font-bold text-slate-900 text-xs">{opt.name}</span>
                          </div>
                          <input
                            type="radio"
                            name="ai_provider_radio"
                            checked={isSelected}
                            onChange={() => handleSelectProvider(opt.id)}
                            className="accent-[#E0562D] cursor-pointer"
                          />
                        </div>

                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Khung Thông tin xác thực */}
              <div className="pt-5 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-900">
                    2. Thông tin xác thực kết nối
                  </label>
                  {selectedProvider === 'oauth_chatgpt' && (
                    <button
                      type="button"
                      onClick={handleStartOpenAiPkce}
                      className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <span>Quản lý trên OpenAI</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {selectedProvider === 'system' && (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Hệ thống ViTudy tích hợp sẵn, không cần tài khoản riêng. Trừ 2 ViToken / lượt thao tác chuyên sâu (tóm tắt, sinh đề, flashcard).
                  </p>
                )}

                {selectedProvider === 'oauth_chatgpt' && (
                  <div className="space-y-2.5">
                    {oauthSession ? (
                      <div className="space-y-2">
                        {/* 1 dòng thanh lịch: chấm xanh 8px, email, đổi tài khoản, đăng xuất */}
                        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="font-semibold text-slate-800 truncate">
                              {oauthSession.email || (oauthSession.accountId ? `Tài khoản #${oauthSession.accountId.slice(0, 8)}` : 'Đã kết nối ChatGPT')}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 text-xs font-medium">
                            <button
                              type="button"
                              onClick={handleStartOpenAiPkce}
                              className="text-slate-600 hover:text-slate-900 underline underline-offset-2 cursor-pointer"
                            >
                              Đổi tài khoản
                            </button>
                            <button
                              type="button"
                              onClick={handleDisconnectConfirm}
                              className="text-slate-500 hover:text-red-600 underline underline-offset-2 cursor-pointer"
                            >
                              Đăng xuất
                            </button>
                          </div>
                        </div>

                        {/* Tùy chọn dự phòng: Khi ChatGPT hết lượt */}
                        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none pt-1">
                          <input 
                            type="checkbox"
                            checked={autoFallbackToSystem}
                            onChange={(e) => setAutoFallbackToSystem(e.target.checked)}
                            className="w-3.5 h-3.5 rounded accent-[#E0562D] cursor-pointer"
                          />
                          <span>Khi ChatGPT hết lượt, tự chuyển sang ViTudy (trừ ViToken).</span>
                        </label>

                        {/* Quyền riêng tư: chữ nhỏ 12px màu xám, không nền, không icon khóa */}
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Quyền riêng tư: Câu hỏi và tài liệu gửi trực tiếp từ trình duyệt đến OpenAI. ViTudy không lưu trữ tài liệu hay phiên đăng nhập.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={handleStartOpenAiPkce}
                            className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Bước 1: Đăng nhập ChatGPT</span>
                          </button>

                          <button
                            type="button"
                            onClick={handlePasteAndConnectOneClick}
                            disabled={isExchangingOAuth}
                            className="py-2 px-3 rounded-lg bg-[#E0562D] hover:bg-[#c9451e] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                          >
                            <ClipboardPaste className="w-3.5 h-3.5" />
                            <span>{isExchangingOAuth ? 'Đang xác thực...' : 'Bước 2: Dán & Kết nối ngay'}</span>
                          </button>
                        </div>

                        {hasOpenedPkceWindow && (
                          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-[11px] text-amber-900 leading-relaxed space-y-1">
                            <div className="font-bold flex items-center gap-1 text-amber-950">
                              <span>Lưu ý quan trọng:</span>
                            </div>
                            <p>
                              Trình duyệt báo <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200 text-slate-800">Trang web này hiện không truy cập được (localhost:1455)</code> là <strong>hoàn toàn bình thường</strong>.
                            </p>
                            <p>
                              Bạn chỉ cần <strong>sao chép toàn bộ dòng địa chỉ đó</strong> trên trình duyệt, quay lại đây và bấm <strong>Bước 2: Dán & Kết nối ngay</strong>.
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Hoặc dán URL callback tại đây..."
                            value={chatGptCodeInput}
                            onChange={(e) => {
                              setChatGptCodeInput(e.target.value);
                              setTestConnectionStatus('idle');
                              setTestResultMessage(null);
                            }}
                            onPaste={(e) => {
                              const pasted = e.clipboardData?.getData('text');
                              if (pasted && (pasted.includes('code=') || pasted.includes('refresh_token') || pasted.includes('access_token'))) {
                                e.preventDefault();
                                setChatGptCodeInput(pasted.trim());
                                void handleConnectOpenAiInput(pasted.trim());
                              }
                            }}
                            className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-800 focus:bg-white font-mono shadow-2xs"
                          />
                          {chatGptCodeInput.trim() && (
                            <button
                              type="button"
                              onClick={() => handleConnectOpenAiInput(chatGptCodeInput)}
                              disabled={isExchangingOAuth}
                              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer flex-shrink-0"
                            >
                              Kết nối
                            </button>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400">
                          Bảo mật chuẩn OAuth 2.0. Tự động gia hạn đăng nhập, không tốn ViToken.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Chọn Mô Hình AI & Kiểm tra kết nối */}
              <div className="pt-5 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="ai-model-select" className="font-bold text-slate-900">
                    3. Chọn Mô hình AI
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {PROVIDER_MODELS[selectedProvider]?.length || 0} mô hình
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <select
                      id="ai-model-select"
                      value={selectedModel}
                      onChange={(e) => {
                        setSelectedModel(e.target.value);
                        setTestConnectionStatus('idle');
                        setTestResultMessage(null);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium outline-none focus:border-slate-800 cursor-pointer shadow-2xs"
                    >
                      {selectedProvider === 'oauth_chatgpt' ? (
                        CHATGPT_MODEL_GROUPS.map((group) => (
                          <optgroup key={group.group} label={group.group}>
                            {group.models.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </optgroup>
                        ))
                      ) : selectedProvider === 'system' ? (
                        <optgroup label="Mô hình hệ thống ViTudy">
                          {SYSTEM_MODEL_LIST.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </optgroup>
                      ) : (
                        (PROVIDER_MODELS[selectedProvider] || []).map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testConnectionStatus === 'testing'}
                    className="py-2 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 text-xs font-semibold transition-all border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 flex-shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#E0562D]" />
                    <span>{testConnectionStatus === 'testing' ? 'Đang đo...' : 'Kiểm tra kết nối'}</span>
                  </button>
                </div>

                {/* Tách 2 dòng: Tên model; Mô tả xám, mã model monospace không bọc chip */}
                {(() => {
                  const allModels = PROVIDER_MODELS[selectedProvider] || [];
                  const activeModelInfo = allModels.find(m => m.id === selectedModel) || allModels[0];
                  return (
                    <div className="text-xs pt-1 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{activeModelInfo?.name || selectedModel}</span>
                        <span className="font-mono text-[11px] text-slate-400">{selectedModel}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">{activeModelInfo?.desc}</p>
                    </div>
                  );
                })()}

                {/* Kết quả kiểm tra với aria-live tinh giản */}
                <div aria-live="polite">
                  {testConnectionStatus === 'success' && testResultMessage && (
                    <div className="p-2 text-xs flex items-center gap-2 text-slate-700 animate-fade-in font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>{testResultMessage}</span>
                    </div>
                  )}
                  {testConnectionStatus === 'error' && testResultMessage && (
                    <div className="p-2 text-xs flex items-center gap-2 text-red-600 animate-fade-in font-medium">
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      <span>{testResultMessage}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tùy chọn nâng cao: Khóa API cá nhân (Gemini, OpenAI) */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdvancedByok(!showAdvancedByok)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {showAdvancedByok ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>Tùy chọn nâng cao: Khóa API cá nhân (Gemini, OpenAI)</span>
                </button>

                {showAdvancedByok && (
                  <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 animate-fade-in text-xs">
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Dành cho người dùng muốn sử dụng trực tiếp API Key riêng của Google Gemini hoặc OpenAI (không tốn ViToken). Khóa lưu trên trình duyệt của bạn.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectProvider('byok_gemini')}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                          selectedProvider === 'byok_gemini'
                            ? 'bg-white border-[#E0562D] text-[#E0562D] shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Google Gemini API
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectProvider('byok_openai')}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                          selectedProvider === 'byok_openai'
                            ? 'bg-white border-[#E0562D] text-[#E0562D] shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        OpenAI API Key
                      </button>
                    </div>

                    {(selectedProvider === 'byok_gemini' || selectedProvider === 'byok_openai') && (
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[11px] font-semibold text-slate-700 block">
                          Nhập API Key {selectedProvider === 'byok_gemini' ? 'Google Gemini' : 'OpenAI'}:
                        </label>
                        <div className="relative">
                          <input
                            type={showApiKey ? 'text' : 'password'}
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            placeholder={selectedProvider === 'byok_gemini' ? 'AIzaSy...' : 'sk-proj-...'}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-800 font-mono pr-8"
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                          >
                            {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {saveSuccessMessage && (
                <div className="p-2 text-xs flex items-center gap-2 text-emerald-700 font-medium animate-fade-in">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>{saveSuccessMessage}</span>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  {!hasAiChanges && (
                    <span className="text-xs text-slate-400 font-medium">Chưa có thay đổi</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAiModalOpen(false)}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={!hasAiChanges}
                    title={!hasAiChanges ? 'Chưa có thay đổi cấu hình' : 'Lưu cài đặt kết nối'}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-[#E0562D] hover:bg-[#c9451e] disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-2xs cursor-pointer transition-all active:scale-95"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      {/* MODAL: Nạp ViToken (VietQR & Sepay) */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
      />
    </>
  );
}

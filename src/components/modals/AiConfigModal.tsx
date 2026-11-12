'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useViToken } from '@/context/ViTokenContext';
import { AiProvider } from '@/types/vitoken';
import { 
  Sparkles, 
  Cpu, 
  ExternalLink, 
  X,
  Eye,
  EyeOff,
  Zap,
  ClipboardPaste,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { testAiConnection, exchangeOpenAiCode } from '@/lib/aiClient';
import {
  startOpenAiPkceLogin,
  getOpenAiOAuthSession,
  clearOpenAiOAuthSession,
  OpenAiOAuthSession,
} from '@/lib/openaiOAuth';
import { ByokStore } from '@/lib/byokStore';

export interface ModelItem {
  id: string;
  name: string;
  desc: string;
}

export interface ModelGroup {
  group: string;
  models: ModelItem[];
}

export const CHATGPT_MODEL_GROUPS: ModelGroup[] = [
  {
    group: 'Siêu suy luận & Chuyên sâu',
    models: [
      { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra', desc: 'Mạnh nhất, phù hợp bài toán nhiều bước' },
      { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna', desc: 'Phản hồi sâu, xử lý tài liệu dài' },
      { id: 'gpt-5.6-sol', name: 'GPT-5.6 Sol', desc: 'Phân tích cấu trúc và tổng hợp' },
    ]
  },
  {
    group: 'Toàn diện & Tốc độ cao',
    models: [
      { id: 'chatgpt-4o-latest', name: 'ChatGPT-4o Latest', desc: 'Bản cập nhật thường xuyên nhất' },
      { id: 'gpt-4o', name: 'GPT-4o', desc: 'Xử lý hình ảnh và văn bản đa phương thức' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Tốc độ cao, phản hồi tức thì' },
    ]
  }
];

export const SYSTEM_MODEL_LIST: ModelItem[] = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Mặc định · Phản hồi nhanh và tiết kiệm' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Tối ưu tóm tắt và sinh câu hỏi' },
  { id: 'gpt-4o', name: 'GPT-4o', desc: 'Phân tích bài toán chuyên sâu' },
];

export const BYOK_GEMINI_MODELS: ModelItem[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Nhanh, nhẹ, miễn phí' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Suy luận đa phương thức nâng cao' },
];

export const BYOK_OPENAI_MODELS: ModelItem[] = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Nhanh & tiết kiệm chi phí' },
  { id: 'gpt-4o', name: 'GPT-4o', desc: 'Toàn diện cao cấp' },
];

export const BYOK_CLAUDE_MODELS: ModelItem[] = [
  { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', desc: 'Suy luận lai đa phương thức hàng đầu' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', desc: 'Tốc độ cực nhanh và tiết kiệm' },
];

export const PROVIDER_MODELS: Record<AiProvider, ModelItem[]> = {
  system: SYSTEM_MODEL_LIST,
  oauth_chatgpt: CHATGPT_MODEL_GROUPS.flatMap(g => g.models),
  byok_gemini: BYOK_GEMINI_MODELS,
  byok_openai: BYOK_OPENAI_MODELS,
  byok_claude: BYOK_CLAUDE_MODELS,
  oauth_gemini: []
};

function OpenAILogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.66-4.5042a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1402-2.0252zm-1.1214-9.976a4.4708 4.4708 0 0 1 2.3418-1.9727V12.02l2.02-1.1636a.0804.0804 0 0 1 .0757 0l4.8398 2.7913-5.8428 3.3685a.7948.7948 0 0 0-.3928.6813v.1514L3.633 14.398a4.504 4.504 0 0 1-1.1546-6.449zm16.8993 4.1444l-5.8428-3.3732 2.02-1.1635a.0804.0804 0 0 1 .0757 0l4.8399 2.7913v5.5826a4.4992 4.4992 0 0 1-3.6128 4.4098v-5.6657a.7948.7948 0 0 0-.3928-.6813zm2.5224-3.529a4.4755 4.4755 0 0 1 .5347 3.0136l-.142-.0852-4.783-2.7582a.7712.7712 0 0 0-.7806 0l-5.8428 3.3685V9.6698a.0804.0804 0 0 1 .0332-.0615l4.8804-2.815a4.4992 4.4992 0 0 1 6.1402 2.0252zM8.8856 12.072l2.368-1.365 2.368 1.365v2.7301l-2.368 1.365-2.368-1.365z"/>
    </svg>
  );
}

interface AiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiConfigModal({ isOpen, onClose }: AiConfigModalProps) {
  const { wallet, aiConfig, updateAiConfig } = useViToken();
  const [mounted, setMounted] = useState(false);

  const [selectedProvider, setSelectedProvider] = useState<AiProvider>(aiConfig.provider);
  const [selectedModel, setSelectedModel] = useState<string>(aiConfig.model || 'gpt-4o-mini');
  const [apiKeyInput, setApiKeyInput] = useState<string>((aiConfig as any).apiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAdvancedByok, setShowAdvancedByok] = useState(false);

  const [chatGptCodeInput, setChatGptCodeInput] = useState('');
  const [oauthSession, setOauthSession] = useState<OpenAiOAuthSession | null>(null);
  const [hasOpenedPkceWindow, setHasOpenedPkceWindow] = useState(false);
  const [isExchangingOAuth, setIsExchangingOAuth] = useState(false);
  const [autoFallbackToSystem, setAutoFallbackToSystem] = useState(true);

  const [testConnectionStatus, setTestConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResultMessage, setTestResultMessage] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedProvider(aiConfig.provider);
      setSelectedModel(aiConfig.model || 'gpt-4o-mini');
      if (aiConfig.provider === 'byok_gemini') {
        setApiKeyInput(ByokStore.get('gemini') || '');
      } else if (aiConfig.provider === 'byok_openai') {
        setApiKeyInput(ByokStore.get('openai') || '');
      } else if (aiConfig.provider === 'byok_claude') {
        setApiKeyInput(ByokStore.get('claude') || '');
      } else {
        setApiKeyInput((aiConfig as any).apiKey || '');
      }
      setOauthSession(getOpenAiOAuthSession());
      setTestConnectionStatus('idle');
      setTestResultMessage(null);
      setSaveSuccessMessage(null);
    }
  }, [isOpen, aiConfig]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const isPlusOrHigher = Boolean(
    oauthSession?.planType &&
    ['plus', 'pro', 'team', 'enterprise'].includes(oauthSession.planType.toLowerCase())
  );
  const FREE_ALLOWED_MODELS = ['gpt-5.6-terra', 'gpt-5.6-luna'];

  useEffect(() => {
    if (selectedProvider === 'oauth_chatgpt' && !isPlusOrHigher) {
      if (!FREE_ALLOWED_MODELS.includes(selectedModel)) {
        setSelectedModel('gpt-5.6-terra');
      }
    }
  }, [selectedProvider, isPlusOrHigher, selectedModel]);

  const hasAiChanges = useMemo(() => {
    if (selectedProvider !== aiConfig.provider) return true;
    if (selectedModel !== (aiConfig.model || 'gpt-4o-mini')) return true;
    if (selectedProvider === 'oauth_chatgpt' && (chatGptCodeInput.trim() !== '' || Boolean(oauthSession) !== Boolean(aiConfig.isOauthConnected))) return true;
    if (selectedProvider.startsWith('byok_') && apiKeyInput.trim() !== ((aiConfig as any).apiKey || '')) return true;
    return false;
  }, [selectedProvider, selectedModel, chatGptCodeInput, oauthSession, aiConfig, apiKeyInput]);

  const handleSelectProvider = (provider: AiProvider) => {
    setSelectedProvider(provider);
    setTestConnectionStatus('idle');
    setTestResultMessage(null);
    if (provider === 'byok_gemini') {
      setApiKeyInput(ByokStore.get('gemini') || '');
    } else if (provider === 'byok_openai') {
      setApiKeyInput(ByokStore.get('openai') || '');
    } else if (provider === 'byok_claude') {
      setApiKeyInput(ByokStore.get('claude') || '');
    }
    const models = PROVIDER_MODELS[provider] || [];
    if (models.length > 0) {
      setSelectedModel(models[0].id);
    }
  };

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
    if (selectedProvider === 'byok_gemini') {
      ByokStore.set('gemini', apiKeyInput.trim());
    } else if (selectedProvider === 'byok_openai') {
      ByokStore.set('openai', apiKeyInput.trim());
    } else if (selectedProvider === 'byok_claude') {
      ByokStore.set('claude', apiKeyInput.trim());
    }
    updateAiConfig({
      provider: selectedProvider,
      model: selectedModel,
      isOauthConnected: selectedProvider === 'oauth_chatgpt' ? Boolean(getOpenAiOAuthSession()) : false,
      apiKey: selectedProvider.startsWith('byok_') ? apiKeyInput.trim() : undefined,
    });
    setSaveSuccessMessage('Đã lưu cấu hình AI thành công.');
    setTimeout(() => {
      setSaveSuccessMessage(null);
      onClose();
    }, 1000);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      id="ai-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9990] flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-xl w-full max-w-lg p-5 sm:p-6 shadow-xl relative text-slate-900 animate-slide-up sm:animate-fade-in font-sans max-h-[92vh] flex flex-col"
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden shrink-0" />
        {/* Close Button */}
        <button
          id="close-ai-modal"
          onClick={onClose}
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
          </div>
        </div>

        {/* Balance Display */}
        <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 text-slate-500 mb-4">
          <span>Số dư ví của bạn:</span>
          <span className="font-mono font-bold text-slate-900">{wallet?.balance ?? 50} ViToken</span>
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
                  name: 'ViTAI bởi ViTudy',
                  desc: 'Tối ưu chuyên sâu cho mọi thứ.',
                  icon: <Sparkles className="w-3.5 h-3.5 text-slate-600" />
                },
                {
                  id: 'oauth_chatgpt' as AiProvider,
                  name: 'ChatGPT bởi OpenAI',
                  desc: 'Dùng của bạn, không tốn ViToken',
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

            {/* Tùy chọn: Khóa API cá nhân */}
            <div className="mt-3 pt-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAdvancedByok(!showAdvancedByok)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer transition-colors"
              >
                {showAdvancedByok ? <ChevronUp className="w-3.5 h-3.5 text-[#E0562D]" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                <span>Tùy chọn: Khóa API cá nhân</span>
              </button>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Dành cho người dùng muốn sử dụng trực tiếp API Key riêng. Khóa lưu trên trình duyệt của bạn.
              </p>

              {showAdvancedByok && (
                <div className="mt-2.5 flex flex-wrap gap-2 animate-fade-in">
                  {[
                    { id: 'byok_gemini' as AiProvider, label: 'Gemini API' },
                    { id: 'byok_openai' as AiProvider, label: 'OpenAI API' },
                    { id: 'byok_claude' as AiProvider, label: 'Claude API' },
                  ].map(btn => {
                    const isSelected = selectedProvider === btn.id;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => handleSelectProvider(btn.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                          isSelected
                            ? 'border-2 border-[#E0562D] bg-[#FFF7ED]/30 text-[#E0562D] shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>
              )}
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
                Hệ thống ViTudy tích hợp sẵn, không cần tài khoản riêng. Trừ 2 ViToken / lượt thao tác chuyên sâu.
              </p>
            )}

            {selectedProvider === 'oauth_chatgpt' && (
              <div className="space-y-2.5">
                {oauthSession ? (
                  <div className="space-y-2">
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

                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none pt-1">
                      <input 
                        type="checkbox"
                        checked={autoFallbackToSystem}
                        onChange={(e) => setAutoFallbackToSystem(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-[#E0562D] cursor-pointer"
                      />
                      <span>Tự động chuyển sang ViTAI khi hết lượt</span>
                    </label>

                    <p className="text-[11px] text-slate-400 leading-normal">
                      Phiên đăng nhập được lưu trữ trên trình duyệt của bạn.
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
                          <span>Lưu ý:</span>
                        </div>
                        <p>
                          Trình duyệt báo <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200 text-slate-800">localhost:1455 không truy cập được</code> là <strong>bình thường</strong>.
                        </p>
                        <p>
                          Hãy sao chép link trên trình duyệt đó, quay lại đây bấm <strong>Bước 2: Dán & Kết nối ngay</strong>.
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
            {selectedProvider.startsWith('byok_') && (
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-semibold text-slate-700 block">
                  Nhập API Key {selectedProvider === 'byok_gemini' ? 'Google Gemini' : selectedProvider === 'byok_claude' ? 'Anthropic Claude' : 'OpenAI'}:
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={selectedProvider === 'byok_gemini' ? 'AIzaSy...' : selectedProvider === 'byok_claude' ? 'sk-ant-api03-...' : 'sk-proj-...'}
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
                        {group.models.map((m) => {
                          const isLocked = !isPlusOrHigher && !FREE_ALLOWED_MODELS.includes(m.id);
                          return (
                            <option key={m.id} value={m.id} disabled={isLocked}>
                              {m.name} {isLocked ? ' · (Yêu cầu Plus)' : ''}
                            </option>
                          );
                        })}
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
                <span>{testConnectionStatus === 'testing' ? 'Đang đo...' : 'Kiểm tra'}</span>
              </button>
            </div>

            {/* Model Info */}
            {(() => {
              const allModels = PROVIDER_MODELS[selectedProvider] || [];
              const activeModelInfo = allModels.find(m => m.id === selectedModel) || allModels[0];
              const isLocked = selectedProvider === 'oauth_chatgpt' && !isPlusOrHigher && !FREE_ALLOWED_MODELS.includes(selectedModel);

              return (
                <div className="text-xs pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{activeModelInfo?.name || selectedModel}</span>
                      {isLocked && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          Yêu cầu Plus
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">{selectedModel}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">{activeModelInfo?.desc}</p>
                </div>
              );
            })()}

            {/* Test Connection Results */}
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
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={!hasAiChanges}
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
  );
}

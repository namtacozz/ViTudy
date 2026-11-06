'use client';

import React, { useState } from 'react';
import { useViToken } from '@/context/ViTokenContext';
import { 
  Coins, 
  Flame, 
  Cpu, 
  History, 
  Key, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X
} from 'lucide-react';

export function TopRightWallet() {
  const { wallet, aiConfig, claimDailyStreak, updateAiConfig } = useViToken();

  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [dailyClaimResult, setDailyClaimResult] = useState<string | null>(null);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Form states for AI configuration
  const [selectedProvider, setSelectedProvider] = useState(aiConfig.provider);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [chatGptCodeInput, setChatGptCodeInput] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const handleClaim = () => {
    const res = claimDailyStreak();
    setDailyClaimResult(res.message);
  };

  const handleSaveAiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateAiConfig({
      provider: selectedProvider,
      hasCustomKey: apiKeyInput.length > 0 || aiConfig.hasCustomKey,
      isOauthConnected: chatGptCodeInput.length > 0 || aiConfig.isOauthConnected
    });
    setSaveSuccessMessage('Đã lưu cấu hình AI thành công!');
    setTimeout(() => {
      setSaveSuccessMessage(null);
      setIsAiModalOpen(false);
    }, 1200);
  };

  const providerLabelMap: Record<string, string> = {
    system: 'Hệ thống (ViToken)',
    byok_openai: 'OpenAI BYOK',
    byok_gemini: 'Gemini BYOK',
    oauth_chatgpt: 'ChatGPT Plus OAuth',
    oauth_gemini: 'Google Gemini OAuth'
  };

  return (
    <div className="absolute top-4 right-4 z-40 flex items-center gap-2 pointer-events-auto">
      {/* Daily Streak Badge */}
      <button
        onClick={() => {
          setDailyClaimResult(null);
          setIsDailyModalOpen(true);
        }}
        className="flex items-center gap-1.5 bg-slate-950/80 border border-orange-500/40 rounded-xl px-3 py-2 shadow-lg backdrop-blur-md text-orange-400 hover:text-orange-300 hover:border-orange-400 transition-all group"
      >
        <Flame className="w-4 h-4 text-orange-500 animate-bounce group-hover:scale-110" />
        <span className="text-xs font-bold font-mono">
          Streak {wallet.streakDays}d
        </span>
      </button>

      {/* ViToken Balance Pill */}
      <button
        onClick={() => setIsHistoryModalOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-amber-950/80 to-slate-950/90 border border-amber-500/50 rounded-xl px-3 py-2 shadow-vitoken-glow backdrop-blur-md hover:border-amber-400 transition-all group"
        title="Bấm để xem lịch sử biến động ViToken"
      >
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-[11px] shadow-sm">
          V
        </div>
        <div className="flex flex-col items-start leading-none">
          <div className="flex items-center gap-1">
            <span className="text-xs font-black text-amber-300 font-mono">
              {wallet.balance}
            </span>
            <span className="text-[10px] text-amber-500/90 font-semibold">
              ViToken
            </span>
          </div>
        </div>
      </button>

      {/* AI Provider & Model Config Pill */}
      <button
        onClick={() => setIsAiModalOpen(true)}
        className="flex items-center gap-1.5 bg-slate-950/80 border border-sky-500/40 rounded-xl px-3 py-2 shadow-hud-glow backdrop-blur-md text-slate-200 hover:text-sky-300 hover:border-sky-400 transition-all"
        title="Cấu hình Nhà Cung Cấp AI & Mô Hình"
      >
        <Cpu className="w-3.5 h-3.5 text-sky-400" />
        <div className="flex flex-col items-start text-left leading-tight">
          <span className="text-[10px] font-mono text-sky-400 uppercase">
            {aiConfig.model}
          </span>
          <span className="text-[9px] text-slate-400 truncate max-w-[100px]">
            {providerLabelMap[aiConfig.provider]}
          </span>
        </div>
      </button>

      {/* MODAL: Điểm danh nhận ViToken (Daily Streak) */}
      {isDailyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setIsDailyModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 text-amber-400">
              <Flame className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Điểm Danh Nhận ViToken
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Duy trì chuỗi ngày học tập liên tiếp để nhận thưởng luỹ tiến từ +2 đến +10 ViToken mỗi ngày!
            </p>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 mb-4">
              <div className="text-[11px] text-slate-400">Chuỗi ngày hiện tại</div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {wallet.streakDays} NGÀY LIÊN TIẾP
              </div>
            </div>

            {dailyClaimResult ? (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs mb-3">
                {dailyClaimResult}
              </div>
            ) : (
              <button
                onClick={handleClaim}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Điểm Danh Ngay Hôm Nay</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Lịch sử ví ViToken */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsHistoryModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Lịch Sử Biến Động ViToken</h3>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {wallet.history.map(tx => (
                <div 
                  key={tx.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-medium text-slate-200">{tx.description}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(tx.timestamp).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <span className={`font-mono font-bold ${tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} V
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cấu hình AI Provider (Hệ thống, BYOK, ChatGPT OAuth PKCE) */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAiModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Cấu Hình Kết Nối AI & Provider</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Chọn phương thức cung cấp trí tuệ nhân tạo. Dùng API Key hoặc OAuth cá nhân sẽ <strong className="text-emerald-400">hoàn toàn miễn phí ViToken</strong> khi gọi model!
            </p>

            <form onSubmit={handleSaveAiConfig} className="space-y-4">
              {/* Provider Radio Options */}
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: 'system',
                    name: 'Hệ thống ViTudy (Tiêu hao ViToken)',
                    desc: 'Cung cấp sẵn GPT-4o-mini, GPT-4o, Gemini 2.5 Flash minh bạch giá.'
                  },
                  {
                    id: 'byok_openai',
                    name: 'OpenAI BYOK (Nhập API Key cá nhân)',
                    desc: 'Mã hoá AES-256 an toàn, không tốn ViToken khi gọi AI.'
                  },
                  {
                    id: 'oauth_chatgpt',
                    name: 'ChatGPT Plus/Team OAuth (Codex PKCE)',
                    desc: 'Dùng trực tiếp hạn mức thuê bao ChatGPT Plus cá nhân (localhost:1455).'
                  },
                  {
                    id: 'byok_gemini',
                    name: 'Google Gemini (Google AI Studio Key)',
                    desc: 'Miễn phí gọi model với quota cá nhân từ Google.'
                  }
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 transition-all ${
                      selectedProvider === opt.id
                        ? 'bg-cyan-500/15 border-cyan-500/60 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ai_provider"
                      value={opt.id}
                      checked={selectedProvider === opt.id}
                      onChange={() => setSelectedProvider(opt.id as any)}
                      className="mt-0.5 accent-cyan-400"
                    />
                    <div>
                      <div className="font-bold text-slate-200">{opt.name}</div>
                      <div className="text-[11px] text-slate-400">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Input for BYOK */}
              {selectedProvider.startsWith('byok') && (
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="text-[11px] text-slate-300 block font-medium">
                    Nhập API Key ({selectedProvider === 'byok_openai' ? 'OpenAI: sk-...' : 'Gemini: AIza...'})
                  </label>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              )}

              {/* Input for ChatGPT Codex OAuth PKCE */}
              {selectedProvider === 'oauth_chatgpt' && (
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-medium">Uỷ quyền ChatGPT Plus (Codex PKCE)</span>
                    <a
                      href="https://chatgpt.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-0.5 text-[10px]"
                    >
                      <span>Mở ChatGPT</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="text"
                    placeholder="Dán URL callback localhost:1455/?code=... vào đây"
                    value={chatGptCodeInput}
                    onChange={(e) => setChatGptCodeInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                  />
                  <div className="text-[10px] text-slate-500">
                    * Next.js Backend Proxy sẽ đính kèm header <code className="text-cyan-400">originator: codex_cli_rs</code> để gọi thẳng vào <code className="text-slate-400">chatgpt.com/backend-api/codex/responses</code>.
                  </div>
                </div>
              )}

              {saveSuccessMessage && (
                <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saveSuccessMessage}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md"
                >
                  Lưu Cấu Hình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

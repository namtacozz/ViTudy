'use client';

import React, { useState } from 'react';
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
  Store
} from 'lucide-react';
import { MarketModal } from '../modals/MarketModal';

export function TopRightWallet() {
  const { wallet, aiConfig, updateAiConfig, claimDailyStreak } = useViToken();

  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  // Form states for AI config
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>(aiConfig.provider);
  const [apiKeyInput, setApiKeyInput] = useState((aiConfig as any).apiKey || '');
  const [chatGptCodeInput, setChatGptCodeInput] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const [dailyClaimResult, setDailyClaimResult] = useState<string | null>(null);

  const handleClaim = () => {
    const res = claimDailyStreak();
    if (res.earned > 0) {
      setDailyClaimResult(`Bạn đã nhận +${res.earned} ViToken cho ngày hôm nay.`);
    } else {
      setDailyClaimResult(res.message || 'Hôm nay bạn đã nhận thưởng rồi. Hãy quay lại vào ngày mai.');
    }
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
        ? 'gpt-4o-codex' 
        : 'gemini-2.5-flash'
    });
    setSaveSuccessMessage('Đã lưu cấu hình AI thành công.');
    setTimeout(() => {
      setSaveSuccessMessage(null);
      setIsAiModalOpen(false);
    }, 1200);
  };

  const providerLabelMap: Record<string, string> = {
    system: 'Hệ thống',
    byok_openai: 'OpenAI cá nhân',
    oauth_chatgpt: 'ChatGPT Plus',
    byok_gemini: 'Google Gemini',
    oauth_gemini: 'Google Gemini OAuth'
  };

  const WEEK_DAYS = [
    { key: 'mon', label: 'T2', tokens: 5 },
    { key: 'tue', label: 'T3', tokens: 5 },
    { key: 'wed', label: 'T4', tokens: 5 },
    { key: 'thu', label: 'T5', tokens: 5 },
    { key: 'fri', label: 'T6', tokens: 5 },
    { key: 'sat', label: 'T7', tokens: 5 },
    { key: 'sun', label: 'CN', tokens: 10, isDouble: true },
  ];

  const currentDayOfWeek = (new Date().getDay() + 6) % 7; // 0 = T2, 6 = CN
  const todayDateStr = new Date().toISOString().split('T')[0];
  const isTodayClaimed = wallet.lastClaimDate === todayDateStr;

  return (
    <>
      <div className="absolute top-4 right-4 z-40 flex items-center bg-white/95 border border-slate-300 rounded-2xl p-1.5 shadow-sm backdrop-blur-md pointer-events-auto select-none">
        {/* Daily Streak Button */}
        <button
          onClick={() => {
            setDailyClaimResult(null);
            setIsDailyModalOpen(true);
          }}
          title={`Chuỗi học tập: ${wallet.streakDays} ngày liên tiếp (Bấm để nhận thưởng điểm danh)`}
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
          title="Xem lịch sử số dư credit"
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
          title={`Cài đặt mô hình AI (Hiện tại: ${aiConfig.model} - ${providerLabelMap[aiConfig.provider]})`}
        >
          <Bot className="w-5 h-5 text-slate-900 stroke-[2.4]" />
        </button>
      </div>

      {/* MODAL: Chợ Tài Liệu (Rendered outside the backdrop-blur pill) */}
      <MarketModal
        isOpen={isMarketOpen}
        onClose={() => setIsMarketOpen(false)}
      />

      {/* MODAL: Điểm danh nhận ViToken */}
      {isDailyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-center text-slate-900 animate-fade-in font-sans">
            <button
              onClick={() => setIsDailyModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-3">
              <Flame className="w-7 h-7 text-[#E0562D] fill-[#E0562D]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Điểm danh nhận ViToken
            </h3>
            <p className="text-xs text-slate-500 mb-3.5 leading-relaxed">
              Nhận cố định 5 ViToken mỗi ngày, riêng Chủ Nhật x2 nhận 10 ViToken.
            </p>

            {/* Thanh trực quan 7 ô từ Thứ 2 đến Chủ nhật */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {WEEK_DAYS.map((day, idx) => {
                const isToday = idx === currentDayOfWeek;
                const isPast = idx < currentDayOfWeek;
                const isClaimedToday = isToday && isTodayClaimed;
                const isSunday = day.key === 'sun';
                const isPastClaimed = isPast && wallet.streakDays >= (currentDayOfWeek - idx);
                const isClaimed = isClaimedToday || isPastClaimed;

                return (
                  <div key={day.key} className="flex flex-col items-center">
                    {/* Khung ô thu gọn vào đúng số +5 hoặc +10 (Riêng CN nền CamViT chữ trắng) */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border shadow-2xs select-none ${
                        isClaimed
                          ? 'bg-emerald-500 border-emerald-600 text-white font-bold'
                          : isSunday
                          ? 'bg-[#E0562D] border-[#c9451e] text-white font-black shadow-xs'
                          : isToday
                          ? 'bg-[#FFF7ED] border-[#E0562D] text-[#9A3412] font-black ring-1 ring-[#E0562D]'
                          : isPast
                          ? 'bg-slate-100 border-slate-200 text-slate-600'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      {isClaimed ? (
                        <span className="text-xs font-black">✓</span>
                      ) : (
                        <span className="text-xs font-black font-mono">
                          +{day.tokens}
                        </span>
                      )}
                    </div>

                    {/* T2, T3... nằm dưới ô và nằm ngoài khung ô */}
                    <span
                      className={`text-[11px] font-bold mt-1.5 select-none ${
                        isToday ? 'text-[#E0562D]' : 'text-slate-500'
                      }`}
                    >
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Chuỗi ngày học liên tục: 1 dòng duy nhất nằm ngay dưới thanh trực quan 7 ô */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 mb-4 text-center">
              <span className="text-xs font-bold text-slate-800 font-mono">
                Chuỗi {wallet.streakDays} ngày
              </span>
            </div>

            {dailyClaimResult ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs mb-3 font-semibold">
                {dailyClaimResult}
              </div>
            ) : isTodayClaimed ? (
              <button
                disabled
                className="w-full py-2.5 bg-slate-100 text-slate-400 border border-slate-200 font-bold rounded-xl text-xs cursor-default"
              >
                Đã nhận ViToken hôm nay
              </button>
            ) : (
              <button
                onClick={handleClaim}
                className="w-full py-2.5 bg-[#E0562D] hover:bg-[#c9451e] text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Nhận ViToken
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Lịch sử ViToken */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-900 animate-fade-in">
            <button
              onClick={() => setIsHistoryModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-slate-800" />
              <h3 className="text-sm font-bold text-slate-900">Lịch sử ViToken</h3>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {wallet.history.map(tx => (
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
                  <span className={`font-mono font-bold ${tx.amount >= 0 ? 'text-slate-900' : 'text-slate-500'}`}>
                    {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} V
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cài đặt kết nối AI */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-900 animate-fade-in">
            <button
              onClick={() => setIsAiModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-4 h-4 text-slate-800" />
              <h3 className="text-sm font-bold text-slate-900">Cài đặt kết nối AI</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Chọn dịch vụ AI phù hợp. Dùng khóa API cá nhân sẽ không trừ ViToken.
            </p>

            <form onSubmit={handleSaveAiConfig} className="space-y-3.5">
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: 'system',
                    name: 'Hệ thống ViTudy',
                    desc: 'Dùng GPT-4o-mini tích hợp sẵn, trừ ViToken theo lượt dùng.'
                  },
                  {
                    id: 'byok_openai',
                    name: 'Khóa OpenAI cá nhân (BYOK)',
                    desc: 'Nhập API Key OpenAI của bạn, không trừ ViToken.'
                  },
                  {
                    id: 'oauth_chatgpt',
                    name: 'Tài khoản ChatGPT Plus',
                    desc: 'Dùng tài khoản ChatGPT Plus qua ủy quyền Codex PKCE.'
                  },
                  {
                    id: 'byok_gemini',
                    name: 'Khóa Google Gemini',
                    desc: 'Dùng API Key Google AI Studio cá nhân, miễn phí theo hạn mức Google.'
                  }
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 transition-all ${
                      selectedProvider === opt.id
                        ? 'bg-slate-100 border-slate-800 text-slate-900 font-medium'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ai_provider"
                      value={opt.id}
                      checked={selectedProvider === opt.id}
                      onChange={() => setSelectedProvider(opt.id as any)}
                      className="mt-0.5 accent-slate-900"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">{opt.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {selectedProvider.startsWith('byok') && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <label className="text-xs text-slate-700 block font-medium">
                    Nhập API Key ({selectedProvider === 'byok_openai' ? 'OpenAI: sk-...' : 'Gemini: AIza...'})
                  </label>
                  <input
                    type="password"
                    placeholder="Dán API Key vào đây..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-slate-800 font-mono"
                  />
                </div>
              )}

              {selectedProvider === 'oauth_chatgpt' && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium">Ủy quyền ChatGPT Plus</span>
                    <a
                      href="https://chatgpt.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-900 hover:underline flex items-center gap-0.5 text-[11px] font-semibold"
                    >
                      <span>Mở ChatGPT</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="text"
                    placeholder="Dán mã callback vào đây..."
                    value={chatGptCodeInput}
                    onChange={(e) => setChatGptCodeInput(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-slate-800 font-mono"
                  />
                </div>
              )}

              {saveSuccessMessage && (
                <div className="p-2 bg-slate-100 border border-slate-300 rounded-xl text-slate-800 text-xs flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-slate-700" />
                  <span>{saveSuccessMessage}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-black text-white shadow-xs"
                >
                  Lưu cấu hình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

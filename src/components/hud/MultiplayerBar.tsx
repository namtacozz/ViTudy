'use client';

import React, { useState } from 'react';
import { useStudySpace } from '@/context/StudySpaceContext';
import { Users, Radio, Sparkles, Smile, Share2, Copy, Check } from 'lucide-react';

interface PeerUser {
  id: string;
  name: string;
  avatarColor: string;
  status: string;
}

export function MultiplayerBar() {
  const { activeSpace } = useStudySpace();
  const [reactions, setReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Simulated peer members on the desk
  const peers: PeerUser[] = [
    { id: 'u1', name: 'Bạn (Chủ Bàn)', avatarColor: '#06b6d4', status: 'Đang thao tác' },
    { id: 'u2', name: 'Lê Hoàng', avatarColor: '#10b981', status: 'Đang đọc Trang 3' },
    { id: 'u3', name: 'Minh Thư', avatarColor: '#f59e0b', status: 'Đang ôn trắc nghiệm' }
  ];

  const triggerReaction = (emoji: string) => {
    const newId = `reaction-${Date.now()}`;
    const xPos = Math.random() * 80 - 40;
    setReactions(prev => [...prev, { id: newId, emoji, x: xPos }]);

    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newId));
    }, 2000);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <>
      {/* Floating Multiplayer & Reaction Pill at Top Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700/80 rounded-full px-3 py-1.5 shadow-hud-glow backdrop-blur-md">
          {/* Peer Avatars */}
          <div className="flex items-center -space-x-1.5 pr-2 border-r border-slate-800">
            {peers.map(p => (
              <div
                key={p.id}
                title={`${p.name} - ${p.status}`}
                style={{ backgroundColor: p.avatarColor }}
                className="w-6 h-6 rounded-full border border-slate-950 flex items-center justify-center text-[10px] font-bold text-slate-950 shadow-sm cursor-pointer hover:scale-110 transition-transform"
              >
                {p.name.charAt(0)}
              </div>
            ))}
          </div>

          {/* Quick Reaction Emoji Buttons */}
          <div className="flex items-center gap-0.5">
            {['👏', '💡', '🔥', '🎯', '❓'].map(emoji => (
              <button
                key={emoji}
                onClick={() => triggerReaction(emoji)}
                className="p-1 hover:bg-slate-800 rounded-full text-xs hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="w-[1px] h-3 bg-slate-800 mx-0.5" />

          {/* Share Desk Button */}
          <button
            title="Mời bạn bè cùng học (Multiplayer)"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 px-2 py-0.5 rounded-full hover:bg-cyan-500/10 transition-colors"
          >
            <Share2 className="w-3 h-3" />
            <span className="hidden sm:inline">Mời Bạn</span>
          </button>
        </div>

        {/* Floating Animated Reaction Bubbles */}
        <div className="relative">
          {reactions.map(r => (
            <div
              key={r.id}
              style={{ transform: `translateX(${r.x}px)` }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 text-2xl animate-float-up pointer-events-none select-none"
            >
              {r.emoji}
            </div>
          ))}
        </div>
      </div>

      {/* Share Desk Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3 text-cyan-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Học Nhóm Thời Gian Thực
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Gửi liên kết này cho bạn bè để cùng vào bàn học, lật sách chung, thảo luận và dùng Inteline.
            </p>

            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2 mb-4 text-xs font-mono text-slate-300">
              <input
                type="text"
                readOnly
                value={typeof window !== 'undefined' ? window.location.href : 'https://vitudy.com/space'}
                className="w-full bg-transparent outline-none truncate"
              />
              <button
                onClick={handleCopyShareLink}
                className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 flex-shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Đã Chép' : 'Sao Chép'}</span>
              </button>
            </div>

            <button
              onClick={() => setIsShareModalOpen(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}

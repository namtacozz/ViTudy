'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Plus, 
  Flame, 
  CheckCircle2, 
  Target, 
  LogIn, 
  Star,
  User,
  Sparkles,
  LogOut,
  Store,
  Home,
  BookOpen,
  CalendarCheck,
  HelpCircle,
  LayoutGrid,
  List,
  MoreHorizontal,
  Copy,
  Pencil,
  Trash2,
  ArrowRight,
  Layers,
  Clock,
  MousePointer2,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useViToken } from '@/context/ViTokenContext';
import { useStudySpace } from '@/context/StudySpaceContext';
import { usePomodoroContext } from '@/context/PomodoroContext';
import { TopUpModal } from '@/components/payment/TopUpModal';
import { MarketModal } from '@/components/modals/MarketModal';
import { AiConfigModal } from '@/components/modals/AiConfigModal';
import { getAssetPath } from '@/lib/assets';
import { StudySpace } from '@/types/studyspace';
import { formatRelativeTimeVN } from '@/lib/dateVN';
import { EmptyState } from '@/components/common/EmptyState';

interface HomePageProps {
  onEnterDesk: (spaceId?: string) => void;
  onCreateSpace?: (templateType?: 'blank' | 'midterm' | 'curriculum_exam' | 'group_study') => void;
}

export function HomePage({ onEnterDesk, onCreateSpace }: HomePageProps) {
  const { user, profile, status, signOut } = useAuth();
  const { wallet, claimDailyStreak } = useViToken();
  const { 
    spaces, 
    switchSpace, 
    createSpaceFromTemplate, 
    toggleStarSpace,
    deleteSpace,
    renameSpace,
    duplicateSpace
  } = useStudySpace();
  const { startSession: startPomodoroSession } = usePomodoroContext();
  const router = useRouter();

  const balance = wallet?.balance ?? 50;
  const streakDays = wallet?.streakDays ?? 1;

  const isAuthenticated = status === 'authenticated';
  const userName = profile?.display_name || user?.user_metadata?.full_name || user?.email || 'Bạn';

  const getShortGreetingName = (fullName: string) => {
    if (typeof window !== 'undefined') {
      const storedNick = localStorage.getItem('vitudy_user_nickname');
      if (storedNick && storedNick.trim()) return storedNick.trim();
    }
    if (!fullName) return 'Bạn';
    const trimmed = fullName.trim();
    if (trimmed.includes('@')) return trimmed.split('@')[0];
    const words = trimmed.split(/\s+/);
    return words[0] || 'Bạn';
  };
  const shortName = isAuthenticated ? getShortGreetingName(userName) : 'Bạn';

  // Streak status
  const todayStr = new Date().toISOString().split('T')[0];
  const isClaimedToday = wallet?.lastClaimDate === todayStr;
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);

  const [searchFilter, setSearchFilter] = useState('');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [isAiConfigOpen, setIsAiConfigOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showAllSpaces, setShowAllSpaces] = useState(false);
  const [activeNav, setActiveNav] = useState<'home' | 'my_desks' | 'starred'>('home');
  const [ownershipTab, setOwnershipTab] = useState<'mine' | 'shared'>('mine');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [menuOpenSpaceId, setMenuOpenSpaceId] = useState<string | null>(null);
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown and row menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsProfileDropdownOpen(false);
      }
      if (!target.closest('[data-row-menu="true"]')) {
        setMenuOpenSpaceId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Random motivational quote for daily cockpit
  const MOTIVATIONAL_QUOTES = useMemo(() => [
    (name: string) => `Ôn bài thôi, ${name}`,
    (name: string) => `${name} à, đến lúc học rồi!!!`,
    (name: string) => `Một ngày đẹp trời để học hành, ${name}`,
    (name: string) => `Sẵn sàng rồi chứ, ${name}`,
    (name: string) => `Vào bàn học ngay thôi, ${name}`,
    (name: string) => `Tập trung, chăm chỉ, phấn đấu, cố lên ${name}`,
    (name: string) => `Tương lai tươi sáng phía xa, đang chờ ${name} đó!`,
    (name: string) => `Chúc học tốt, ${name} ~ Vịt`,
    (name: string) => `Ngần ngại gì mà không bắt đầu cơ chứ đúng không ${name}.`,
  ], []);

  const randomQuote = useMemo(() => {
    const fn = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    return fn(shortName);
  }, [shortName, MOTIVATIONAL_QUOTES]);

  // Handle streak claim
  const handleClaimStreak = () => {
    if (claimDailyStreak) {
      const res = claimDailyStreak();
      if (res.message) {
        setClaimFeedback(res.message);
        setTimeout(() => setClaimFeedback(null), 3000);
      }
    }
  };

  // Handle template selection
  const handleSelectTemplate = (templateType: 'blank' | 'midterm' | 'curriculum_exam' | 'group_study') => {
    if (createSpaceFromTemplate) {
      const newSpaceId = createSpaceFromTemplate(templateType);
      onEnterDesk(newSpaceId);
    } else {
      onEnterDesk();
    }
  };

  // Handle opening a space from recent table
  const handleOpenSpace = (spaceId: string) => {
    switchSpace(spaceId);
    onEnterDesk(spaceId);
  };

  // Helper tính số tài liệu
  const getSpaceSummary = (space: StudySpace) => {
    if (space.items && space.items.length > 0) {
      const books = space.items.filter(i => i.type === 'book').length;
      const papers = space.items.filter(i => i.type === 'paper').length;
      const notes = space.items.filter(i => i.type === 'sticky_note').length;
      
      const parts: string[] = [];
      if (books > 0) parts.push(`${books} sách`);
      if (papers > 0) parts.push(`${papers} tờ`);
      if (notes > 0) parts.push(`${notes} ghi chú`);
      if (parts.length > 0) return parts.join(' · ');
    }
    return 'Chưa có tài liệu';
  };

  const getRecentTimeString = (space: StudySpace) => {
    return formatRelativeTimeVN(space.lastOpenedAt || space.updatedAt || space.createdAt);
  };

  // Hiển thị tất cả bàn học của người dùng (kể cả bàn trống mới tạo), sắp xếp theo lần mở/cập nhật gần nhất
  const validSpaces = useMemo(() => {
    const legacyGhostNames = new Set(['Ôn thi giữa kỳ', 'Giáo trình + đề thi', 'Học nhóm']);
    return [...spaces]
      .filter((s) => (s.items && s.items.length > 0) || !legacyGhostNames.has(s.name.trim()))
      .sort((a, b) => {
        const ta = new Date(a.lastOpenedAt || a.updatedAt || a.createdAt || 0).getTime();
        const tb = new Date(b.lastOpenedAt || b.updatedAt || b.createdAt || 0).getTime();
        return tb - ta;
      });
  }, [spaces]);

  const filteredSpaces = validSpaces.filter((s) => {
    if (activeNav === 'starred' && !s.starred) return false;
    if (ownershipTab === 'shared' && !s.isShared) {
      // Demo: if no shared spaces exist, empty list
      return false;
    }
    if (!searchFilter.trim()) return true;
    const query = searchFilter.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(query) ||
      (s.description && s.description.toLowerCase().includes(query)) ||
      (s.subject && s.subject.toLowerCase().includes(query))
    );
  });

  const displayedSpaces = showAllSpaces ? filteredSpaces : filteredSpaces.slice(0, 6);
  const latestSpace = validSpaces[0] || null;
  const starredSpaces = useMemo(() => validSpaces.filter((s) => s.starred), [validSpaces]);

  const handleSignOut = async () => {
    setIsProfileDropdownOpen(false);
    await signOut();
    router.refresh();
  };

  const handleStartRename = (space: StudySpace, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSpaceId(space.id);
    setEditingName(space.name.replace(/\(Demo\)/i, '').trim());
    setMenuOpenSpaceId(null);
  };

  const handleSaveRename = (spaceId: string) => {
    if (renameSpace && editingName.trim()) {
      renameSpace(spaceId, editingName.trim());
    }
    setEditingSpaceId(null);
  };

  const handleDuplicate = (spaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (duplicateSpace) {
      duplicateSpace(spaceId);
    }
    setMenuOpenSpaceId(null);
  };

  const handleDelete = (spaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteSpace) {
      if (window.confirm('Bạn có chắc chắn muốn xóa bàn học này?')) {
        deleteSpace(spaceId);
      }
    }
    setMenuOpenSpaceId(null);
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-[#faf8f5] text-stone-900 flex font-sans selection:bg-orange-100 selection:text-[#E0562D]">
      {/* ================= LEFT SIDEBAR (Notion/Miro Style - Desktop Only) ================= */}
      <aside className="hidden md:flex w-60 md:w-64 flex-shrink-0 border-r border-[#ece7e1] bg-[#faf8f5] p-4 flex-col justify-between h-screen overflow-y-auto no-scrollbar select-none">
        <div className="flex flex-col">
          {/* Logo Brand: Duy nhất 1 logo ViTudy trên thanh bên */}
          <div className="flex items-center gap-2.5 mb-4 px-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getAssetPath('/icons/vitudy.png')}
              alt="ViTudy"
              width={28}
              height={28}
              className="w-7 h-7 rounded-lg object-contain shadow-2xs flex-shrink-0"
              style={{ width: '28px', height: '28px', maxWidth: '28px', maxHeight: '28px' }}
            />
            <span className="text-lg font-black tracking-tight text-[#E0562D] leading-none">
              ViTudy
            </span>
          </div>

          {/* Search Input with Ctrl+K Hint */}
          <div className="relative mb-3.5">
            <div className="flex items-center gap-2 bg-[#f3eee8] border border-stone-200/90 rounded-xl px-2.5 py-1.5 text-xs text-stone-800 focus-within:border-stone-400 focus-within:bg-white transition-all shadow-2xs">
              <Search className="w-3.5 h-3.5 text-stone-500 flex-shrink-0 stroke-[2.2]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Tìm bàn học, tài liệu..."
                className="w-full bg-transparent placeholder:text-stone-400 text-stone-800 focus:outline-none text-xs"
              />
              <kbd className="hidden sm:inline-block text-[9.5px] text-stone-400 bg-stone-200/80 px-1 py-0.5 rounded font-mono">
                Ctrl K
              </kbd>
            </div>
          </div>

          {/* Navigation Links with Slim Clean Icons */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveNav('home')}
              className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 ${
                activeNav === 'home'
                  ? 'bg-[#eee8df] text-stone-900 font-bold shadow-2xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-[#f3eee7]'
              }`}
            >
              <Home className={`w-4 h-4 ${activeNav === 'home' ? 'text-[#E0562D]' : 'text-stone-500'}`} />
              <span>Trang chủ</span>
            </button>

            <button
              onClick={() => {
                setActiveNav('my_desks');
                onEnterDesk(latestSpace?.id);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 ${
                activeNav === 'my_desks'
                  ? 'bg-[#eee8df] text-stone-900 font-bold shadow-2xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-[#f3eee7]'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${activeNav === 'my_desks' ? 'text-[#E0562D]' : 'text-stone-500'}`} />
              <span>Bàn học của tôi</span>
            </button>

            <button
              onClick={() => setActiveNav('starred')}
              className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 ${
                activeNav === 'starred'
                  ? 'bg-[#eee8df] text-stone-900 font-bold shadow-2xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-[#f3eee7]'
              }`}
            >
              <Star className={`w-4 h-4 ${activeNav === 'starred' ? 'text-amber-500 fill-amber-400' : 'text-stone-500'}`} />
              <span>Đã gắn dấu sao</span>
            </button>

            <button
              onClick={() => setIsMarketOpen(true)}
              className="w-full text-left px-3 py-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-[#f3eee7] transition-all cursor-pointer flex items-center gap-2.5"
            >
              <Store className="w-4 h-4 text-stone-500" />
              <span>Chợ tài liệu</span>
            </button>

            <Link
              href="/dashboard"
              className="w-full px-3 py-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-[#f3eee7] transition-all flex items-center gap-2.5"
            >
              <CalendarCheck className="w-4 h-4 text-stone-500" />
              <span>Nhật ký học</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Bottom: Sleek Balance Chip & Help Link */}
        <div className="pt-3 border-t border-stone-200/70 space-y-2">
          {/* Compact Balance Chip */}
          <div className="bg-[#f5efe6] border border-[#e8dfd3] rounded-xl px-2.5 py-1.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={getAssetPath('/icons/vitoken.svg')} 
                alt="ViToken" 
                width={15}
                height={15}
                className="w-3.5 h-3.5 object-contain flex-shrink-0" 
                style={{ width: '15px', height: '15px', maxWidth: '15px', maxHeight: '15px' }}
              />
              <span className="text-xs font-bold text-stone-900 font-sans">
                {(typeof balance === 'number' ? balance : 50).toLocaleString('vi-VN')} ViToken
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsTopUpOpen(true)}
              className="px-2 py-0.5 bg-[#E0562D] hover:bg-[#c9451e] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer active:scale-95"
            >
              + Nạp
            </button>
          </div>

          {/* Help & About Footer Link */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 px-1 pt-1">
            <button
              type="button"
              onClick={() => setIsMarketOpen(true)}
              className="flex items-center gap-1 hover:text-stone-800 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
              <span>Trợ giúp & Tài liệu</span>
            </button>
            <span className="text-[10px] text-stone-400 font-mono">v1.2.0</span>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE DRAWER BACKDROP & PANEL ================= */}
      {isMobileDrawerOpen && (
        <div 
          onClick={() => setIsMobileDrawerOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 md:hidden flex"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-72 max-w-[85vw] bg-[#faf8f5] h-full p-4 flex flex-col justify-between shadow-2xl animate-fade-in select-none"
          >
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getAssetPath('/icons/vitudy.png')}
                    alt="ViTudy"
                    width={26}
                    height={26}
                    className="w-6 h-6 rounded-md object-contain"
                  />
                  <span className="text-base font-black tracking-tight text-[#E0562D]">ViTudy</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-stone-500 hover:bg-stone-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation in Drawer */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveNav('home');
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    activeNav === 'home' ? 'bg-[#f3eee8] text-stone-900 font-bold' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Home className="w-4 h-4 text-[#E0562D]" />
                  <span>Trang chủ</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveNav('my_desks');
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    activeNav === 'my_desks' ? 'bg-[#f3eee8] text-stone-900 font-bold' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-stone-600" />
                  <span>Tất cả bàn học ({spaces.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveNav('starred');
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    activeNav === 'starred' ? 'bg-[#f3eee8] text-stone-900 font-bold' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Đã gắn dấu sao ({starredSpaces.length})</span>
                </button>
              </div>

              {/* Chợ tài liệu button in Drawer */}
              <div className="mt-4 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsMarketOpen(true);
                    setIsMobileDrawerOpen(false);
                  }}
                  className="w-full bg-[#0f172a] hover:bg-slate-800 text-white rounded-xl p-3 flex items-center justify-between text-xs font-bold cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#E0562D]" />
                    <span>Chợ tài liệu</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom info in Drawer */}
            <div className="pt-3 border-t border-stone-200 text-xs">
              <div className="flex items-center justify-between text-stone-600 mb-2">
                <span>Số dư:</span>
                <span className="font-bold text-stone-900">{balance.toLocaleString('vi-VN')} ViToken</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTopUpOpen(true);
                  setIsMobileDrawerOpen(false);
                }}
                className="w-full py-2 bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Nạp ViToken</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT (Fixed Viewport, No Page Scroll) ================= */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col max-w-6xl mx-auto p-3 sm:p-4 md:p-6 w-full pb-16 md:pb-6">
        {/* Mobile Header Bar (< md) */}
        <div className="flex md:hidden items-center justify-between py-1 mb-2 border-b border-[#ece7e1] flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
              title="Mở danh bạ bàn học"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getAssetPath('/icons/vitudy.png')}
                alt="ViTudy"
                width={22}
                height={22}
                className="w-5.5 h-5.5 rounded-md object-contain"
              />
              <span className="text-base font-black tracking-tight text-[#E0562D]">ViTudy</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTopUpOpen(true)}
              className="flex items-center gap-1 bg-[#FFF7ED] border border-[#FFEDD5] px-2 py-0.5 rounded-full text-xs font-mono font-bold text-[#B8431A]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getAssetPath('/icons/vitoken.svg')}
                alt="V"
                width={13}
                height={13}
                className="w-3 h-3 object-contain"
              />
              <span>{balance}</span>
            </button>
          </div>
        </div>

        {/* Desktop Top Header Bar: Clean Single Header */}
        <header className="hidden md:flex py-1.5 mb-2.5 border-b border-[#ece7e1] items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider font-mono">
              Không gian học tập cá nhân
            </span>
          </div>

          {/* Right Actions: Daily Goal (Duolingo Style) + Streak + Miro Avatar Dropdown */}
          <div className="flex items-center gap-2.5">
            {/* 1. Daily Goal Widget (Duolingo Style) */}
            <div 
              onClick={() => {
                startPomodoroSession(25);
                onEnterDesk(latestSpace?.id);
              }}
              title="Mục tiêu hôm nay: 1/4 phiên 25 phút. Nhấp để bắt đầu học ngay."
              className="hidden sm:flex items-center gap-2 bg-white border border-stone-200/90 hover:border-[#E0562D] px-2.5 py-1 rounded-full shadow-2xs transition-all cursor-pointer group active:scale-98 select-none"
            >
              <Target className="w-3.5 h-3.5 text-[#B8431A]" />
              <span className="text-xs font-semibold text-stone-700">
                Mục tiêu: <strong className="text-stone-900 font-bold">1/4</strong>
              </span>
              <div className="w-10 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#E0562D] rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            {/* 2. Streak Badge */}
            <button
              type="button"
              onClick={handleClaimStreak}
              title={isClaimedToday ? "Đã điểm danh nhận ViToken hôm nay" : "Nhấp để điểm danh nhận +2 ViToken"}
              className={`px-3 py-1 rounded-full text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-98 select-none ${
                isClaimedToday 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-white border border-stone-200/90 text-stone-800 hover:border-[#E0562D]'
              }`}
            >
              {isClaimedToday ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.4]" />
              ) : (
                <Flame className="w-3.5 h-3.5 text-[#E0562D] fill-[#E0562D]" />
              )}
              <span>Chuỗi {streakDays || 1} ngày · {isClaimedToday ? 'Đã điểm danh' : 'Điểm danh'}</span>
            </button>

            {/* 3. Profile Avatar with Miro-style Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  title={`Tài khoản (${userName})`}
                  aria-label="Menu tài khoản"
                  className="w-8 h-8 rounded-full border border-stone-300 hover:border-[#E0562D] bg-white shadow-2xs overflow-hidden flex items-center justify-center transition-all cursor-pointer active:scale-95"
                >
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar_url}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#FFF7ED] text-[#B8431A] font-bold text-xs flex items-center justify-center select-none">
                      {shortName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Miro-style Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-10 z-50 w-60 bg-white rounded-2xl border border-stone-200 shadow-xl p-2 font-sans animate-fade-in text-xs select-none">
                    <div className="flex items-center gap-2.5 p-2 border-b border-stone-100 mb-1">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#FFF7ED] text-[#B8431A] flex items-center justify-center font-bold text-xs flex-shrink-0 border border-stone-200">
                        {profile?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          shortName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-stone-900 truncate">
                          {profile?.display_name || userName || 'Học viên'}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <Link
                        href="/profile?from=home"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-50 font-medium transition-colors"
                      >
                        <User className="w-4 h-4 text-stone-500" />
                        <span>Hồ sơ cá nhân</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setIsAiConfigOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-50 font-medium transition-colors text-left cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-[#E0562D]" />
                        <span>Cài đặt kết nối AI</span>
                      </button>

                      <div className="border-t border-stone-100 my-1" />

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                title="Đăng nhập tài khoản"
                className="px-3 py-1 bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 stroke-[2.4]" />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </header>

        {/* Feedback alert */}
        {claimFeedback && (
          <div className="mb-2 p-2 rounded-xl bg-orange-50 border border-orange-200 text-xs font-semibold text-[#B8431A] flex items-center justify-between animate-fade-in shadow-xs flex-shrink-0">
            <span>{claimFeedback}</span>
            <button onClick={() => setClaimFeedback(null)} className="text-stone-400 hover:text-stone-600 font-bold px-1.5">✕</button>
          </div>
        )}

        {/* Top Cockpit Section: [Quote] [Thẻ tiếp tục học] [Tạo bàn trống mới] */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3 flex-shrink-0">
          {/* Card 1: Câu quote random tạo động lực (Bên trái) */}
          <div className="md:col-span-5 bg-gradient-to-br from-white via-orange-50/25 to-amber-50/35 border border-stone-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#E0562D]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8431A]">Động lực mỗi ngày</span>
              </div>
              <h1 className="text-base md:text-lg font-serif font-semibold text-stone-900 leading-snug tracking-tight">
                “{randomQuote}”
              </h1>
            </div>
            <div className="text-[11px] text-stone-600 mt-3 flex items-center justify-between pt-2 border-t border-stone-100">
              <span>Không gian học tập ViTudy</span>
              <span className="text-stone-500 font-medium">Sẵn sàng bứt phá</span>
            </div>
          </div>

          {/* Card 2: Tiếp tục bàn học mới đây nhất (Bên phải - Thẻ 1) */}
          <div className="md:col-span-4 bg-white border border-stone-200/90 hover:border-[#E0562D]/60 rounded-2xl p-4 shadow-2xs flex flex-col justify-between transition-all">
            {latestSpace ? (
              <>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8431A] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/60">
                      Tiếp tục học
                    </span>
                    <span className="text-[10px] text-stone-600">
                      {getRecentTimeString(latestSpace)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 truncate mt-1">
                    {latestSpace.name.replace(/\(Demo\)/i, '').trim()}
                  </h3>
                  <p className="text-[11px] text-stone-600 mt-1 truncate">
                    {getSpaceSummary(latestSpace)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenSpace(latestSpace.id)}
                  className="w-full mt-3 px-3 py-2 bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>Vào bàn học</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                      Bàn học gần đây
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-stone-700 mt-1">
                    Chưa có bàn học gần đây
                  </h3>
                  <p className="text-[11px] text-stone-600 mt-1">
                    Bàn học bạn mở sẽ tự động xuất hiện tại đây
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectTemplate('blank')}
                  className="w-full mt-3 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>Mở bàn học đầu tiên</span>
                </button>
              </>
            )}
          </div>

          {/* Card 3: Bàn học trống (Bên phải - Thẻ 2) */}
          <div
            onClick={() => handleSelectTemplate('blank')}
            className="md:col-span-3 bg-white border border-dashed border-stone-300 hover:border-[#E0562D] hover:bg-orange-50/20 rounded-2xl p-4 shadow-2xs flex flex-col justify-between transition-all cursor-pointer group"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#E0562D] group-hover:scale-105 transition-transform">
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 group-hover:text-[#B8431A] mt-2.5">
                Bàn học trống
              </h3>
              <p className="text-[11px] text-stone-600 mt-1">
                Không gian mở tự do kéo thả tài liệu
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs font-bold text-[#E0562D] group-hover:underline">
              <span>Tạo bàn mới</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Section 3: Recent Desks Table with Tabs & View Toggle (Fixed Inner Scroll) */}
        <section className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Controls Bar: Tabs [Của tôi | Được chia sẻ] + View Mode [List | Grid] + Show All */}
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-xs md:text-sm font-bold text-stone-900">Mở lại gần đây</h2>
              {/* Ownership Tabs */}
              <div className="flex items-center bg-stone-200/80 p-0.5 rounded-lg text-xs font-semibold text-stone-700">
                <button
                  type="button"
                  onClick={() => setOwnershipTab('mine')}
                  className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                    ownershipTab === 'mine'
                      ? 'bg-white text-stone-900 font-bold shadow-2xs'
                      : 'hover:text-stone-900'
                  }`}
                >
                  Của tôi
                </button>
                <button
                  type="button"
                  onClick={() => setOwnershipTab('shared')}
                  className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                    ownershipTab === 'shared'
                      ? 'bg-white text-stone-900 font-bold shadow-2xs'
                      : 'hover:text-stone-900'
                  }`}
                >
                  Được chia sẻ
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center bg-stone-200/80 p-0.5 rounded-lg text-xs text-stone-700">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title="Chế độ danh sách"
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    viewMode === 'list' ? 'bg-white text-[#E0562D] shadow-2xs' : 'hover:text-stone-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Chế độ lưới"
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-[#E0562D] shadow-2xs' : 'hover:text-stone-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>

              {filteredSpaces.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllSpaces(!showAllSpaces)}
                  className="text-xs font-bold text-[#B8431A] hover:text-[#9A3412] hover:underline cursor-pointer ml-1"
                >
                  {showAllSpaces ? 'Thu gọn' : 'Xem tất cả'}
                </button>
              )}
            </div>
          </div>

          {/* Table Container với vùng cuộn độc lập */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-white border border-stone-200/90 rounded-2xl p-2.5 shadow-2xs">
            {viewMode === 'list' ? (
              <>
                {/* Table Header */}
                <div className="grid grid-cols-12 text-xs font-semibold text-stone-600 pb-2 border-b border-stone-200 px-3 flex-shrink-0">
                  <div className="col-span-6">Tên bàn học</div>
                  <div className="col-span-3 text-left">Tài liệu & ghi chú</div>
                  <div className="col-span-3 text-right pr-2">Mở lần cuối</div>
                </div>

                {/* Table Rows - Cuộn độc lập không ảnh hưởng trang */}
                <div className="flex-1 overflow-y-auto divide-y divide-stone-100 pr-1 no-scrollbar">
                  {displayedSpaces.length === 0 ? (
                    <div className="py-8">
                      <EmptyState
                        title={
                          activeNav === 'starred'
                            ? 'Chưa có bàn học nào được gắn dấu sao'
                            : searchFilter
                            ? 'Không tìm thấy bàn học phù hợp'
                            : 'Chưa có bàn học nào'
                        }
                        description={
                          activeNav === 'starred'
                            ? 'Nhấp vào biểu tượng ngôi sao ở bàn học để ghim.'
                            : searchFilter
                            ? 'Hãy thử tìm kiếm với từ khóa khác.'
                            : 'Tạo bàn học đầu tiên để bắt đầu học tập và sắp xếp tài liệu.'
                        }
                        action={
                          activeNav === 'starred'
                            ? { label: 'Xem tất cả bàn học', onClick: () => setActiveNav('my_desks') }
                            : searchFilter
                            ? undefined
                            : { label: 'Tạo bàn học trống', onClick: () => handleSelectTemplate('blank') }
                        }
                      />
                    </div>
                  ) : (
                    displayedSpaces.map((space, idx) => {
                      const cleanSpaceName = space.name.replace(/\(Demo\)/i, '').trim();
                      const isDemo = space.name.includes('(Demo)');
                      const isEditing = editingSpaceId === space.id;

                      return (
                        <div
                          key={space.id}
                          onClick={() => !isEditing && handleOpenSpace(space.id)}
                          className="grid grid-cols-12 items-center py-2 px-3 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer group relative"
                        >
                          {/* Name & Subtitle */}
                          <div className="col-span-6 pr-3 flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStarSpace?.(space.id);
                              }}
                              title={space.starred ? 'Bỏ gắn dấu sao' : 'Gắn dấu sao'}
                              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                space.starred 
                                  ? 'text-amber-500 hover:text-amber-600' 
                                  : 'text-stone-300 hover:text-stone-500 opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${space.starred ? 'fill-amber-400' : ''}`} />
                            </button>

                            {/* Thumbnail nhỏ 40x28px */}
                            <div className="w-10 h-7 rounded-lg bg-[#f1ede6] border border-stone-300/80 flex-shrink-0 flex items-center justify-center overflow-hidden">
                              {idx % 2 === 0 ? (
                                <div className="w-5 h-3.5 rounded-xs border border-[#5c3920] bg-white flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 rounded-2xs bg-[#fef08a]" />
                                </div>
                              ) : (
                                <div className="flex gap-0.5">
                                  <div className="w-2.5 h-4 rounded-xs bg-white border border-stone-300" />
                                  <div className="w-2.5 h-4 rounded-xs bg-white border border-stone-300" />
                                </div>
                              )}
                            </div>

                            {/* Text info & Inline Rename */}
                            <div className="min-w-0 flex-1">
                              {isEditing ? (
                                <input
                                  autoFocus
                                  type="text"
                                  value={editingName}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  onBlur={() => handleSaveRename(space.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveRename(space.id);
                                    if (e.key === 'Escape') setEditingSpaceId(null);
                                  }}
                                  className="w-full text-xs font-bold text-stone-900 bg-white border border-stone-300 rounded px-1.5 py-0.5 outline-none focus:border-[#E0562D]"
                                />
                              ) : (
                                <>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-stone-900 group-hover:text-[#B8431A] transition-colors truncate">
                                      {cleanSpaceName}
                                    </span>
                                    {isDemo && (
                                      <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded shrink-0">
                                        Mẫu
                                      </span>
                                    )}
                                  </div>
                                  {space.description && (
                                    <div className="text-[11px] text-stone-500 truncate">
                                      {space.description}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Summary */}
                          <div className="col-span-3 text-xs text-stone-600 font-medium truncate">
                            {getSpaceSummary(space)}
                          </div>

                          {/* Last Opened Time & Hover Action Menu "⋯" */}
                          <div className="col-span-3 text-xs text-stone-500 text-right pr-2 flex items-center justify-end gap-2">
                            <span>{getRecentTimeString(space)}</span>
                            
                            {/* "⋯" Menu Button */}
                            <div className="relative" data-row-menu="true">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenSpaceId(menuOpenSpaceId === space.id ? null : space.id);
                                }}
                                title="Tùy chọn bàn học"
                                className="w-6 h-6 rounded-md hover:bg-stone-200 text-stone-400 hover:text-stone-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>

                              {/* Row Action Popover */}
                              {menuOpenSpaceId === space.id && (
                                <div 
                                  className="absolute right-0 top-7 z-30 w-36 bg-white rounded-xl border border-stone-200 shadow-xl p-1 text-xs text-stone-700 animate-fade-in font-sans text-left"
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => handleStartRename(space, e)}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-stone-500" />
                                    <span>Đổi tên</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDuplicate(space.id, e)}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                                    <span>Nhân bản</span>
                                  </button>
                                  <div className="border-t border-stone-100 my-0.5" />
                                  <button
                                    type="button"
                                    onClick={(e) => handleDelete(space.id, e)}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 font-semibold transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Xóa</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              /* Grid View Mode */
              <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 sm:grid-cols-3 gap-3 no-scrollbar">
                {displayedSpaces.map((space) => {
                  const cleanSpaceName = space.name.replace(/\(Demo\)/i, '').trim();
                  const isDemo = space.name.includes('(Demo)');

                  return (
                    <div
                      key={space.id}
                      onClick={() => handleOpenSpace(space.id)}
                      className="bg-stone-50/70 border border-stone-200 rounded-xl p-3 flex flex-col justify-between hover:border-[#E0562D] hover:bg-white hover:shadow-2xs transition-all cursor-pointer group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-stone-500 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {getRecentTimeString(space)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStarSpace?.(space.id);
                            }}
                            className="text-stone-400 hover:text-amber-500 cursor-pointer"
                          >
                            <Star className={`w-3.5 h-3.5 ${space.starred ? 'text-amber-500 fill-amber-400' : ''}`} />
                          </button>
                        </div>
                        <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#E0562D] truncate">
                          {cleanSpaceName}
                        </h4>
                        {isDemo && (
                          <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded shrink-0 inline-block mt-0.5">
                            Mẫu
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-3 pt-2 border-t border-stone-200/80 truncate">
                        {getSpaceSummary(space)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ================= MOBILE BOTTOM NAVIGATION BAR (4 Tabs: Trang chủ, Bàn học, Chợ, Hồ sơ) ================= */}
      <nav 
        aria-label="Điều hướng di động"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 py-1.5 px-4 flex items-center justify-around shadow-lg select-none"
      >
        {/* Tab 1: Trang chủ */}
        <button
          type="button"
          onClick={() => setActiveNav('home')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
            activeNav === 'home' ? 'text-[#E0562D]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Trang chủ</span>
        </button>

        {/* Tab 2: Bàn học */}
        <button
          type="button"
          onClick={() => onEnterDesk(latestSpace?.id)}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold text-stone-500 hover:text-stone-800 cursor-pointer transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Bàn học</span>
        </button>

        {/* Tab 3: Chợ tài liệu */}
        <button
          type="button"
          onClick={() => setIsMarketOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold text-stone-500 hover:text-stone-800 cursor-pointer transition-colors"
        >
          <Store className="w-4 h-4" />
          <span>Chợ</span>
        </button>

        {/* Tab 4: Hồ sơ */}
        <button
          type="button"
          onClick={() => router.push('/profile')}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold text-stone-500 hover:text-stone-800 cursor-pointer transition-colors"
        >
          <User className="w-4 h-4" />
          <span>Hồ sơ</span>
        </button>
      </nav>

      {/* ================= MODALS ================= */}
      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
      <MarketModal isOpen={isMarketOpen} onClose={() => setIsMarketOpen(false)} onEnterDesk={onEnterDesk} />
      <AiConfigModal isOpen={isAiConfigOpen} onClose={() => setIsAiConfigOpen(false)} />
    </div>
  );
}

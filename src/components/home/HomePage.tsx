'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Sparkles,
  Layers,
  ArrowRight,
  User as UserIcon,
  Flame,
  Info
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useViToken } from '@/context/ViTokenContext';
import { useStudySpace } from '@/context/StudySpaceContext';
import { TopUpModal } from '@/components/payment/TopUpModal';
import { getAssetPath } from '@/lib/assets';

interface HomePageProps {
  onEnterDesk: (spaceId?: string) => void;
  onCreateSpace?: (templateType?: 'blank' | 'midterm' | 'curriculum_exam' | 'group_study') => void;
}

export function HomePage({ onEnterDesk, onCreateSpace }: HomePageProps) {
  const { user, profile, status } = useAuth();
  const { wallet, claimDailyStreak } = useViToken();
  const { spaces, switchSpace, createSpaceFromTemplate } = useStudySpace();
  const router = useRouter();

  const balance = wallet?.balance ?? 50;
  const streakDays = wallet?.streakDays ?? 1;

  const [searchFilter, setSearchFilter] = useState('');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [showAllSpaces, setShowAllSpaces] = useState(false);
  const [activeNav, setActiveNav] = useState<'home' | 'my_desks' | 'starred'>('home');

  // Username display: profile display name -> user email prefix -> 'namtacozz' as default/demo
  const userName = profile?.display_name || user?.email?.split('@')[0] || 'namtacozz';

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

  // Filter spaces based on search
  const filteredSpaces = spaces.filter((s) => {
    if (!searchFilter.trim()) return true;
    const query = searchFilter.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(query) ||
      (s.description && s.description.toLowerCase().includes(query)) ||
      (s.subject && s.subject.toLowerCase().includes(query))
    );
  });

  const displayedSpaces = showAllSpaces ? filteredSpaces : filteredSpaces.slice(0, 5);

  return (
    <div className="w-full min-h-screen bg-[#faf8f5] text-stone-900 flex font-sans selection:bg-orange-100 selection:text-[#E0562D]">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="w-64 flex-shrink-0 border-r border-[#ece7e1] bg-[#faf8f5] p-5 flex flex-col justify-between min-h-screen sticky top-0 h-screen overflow-y-auto no-scrollbar">
        <div className="flex flex-col">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 mb-5 select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getAssetPath('/icons/vitudy.svg')}
              alt="ViTudy"
              className="w-8 h-8 rounded-xl object-contain shadow-xs flex-shrink-0"
            />
            <span className="text-base font-bold tracking-tight text-stone-900">ViTudy</span>
          </div>

          {/* Search Input */}
          <div className="relative mb-5">
            <div className="flex items-center gap-2 bg-[#f3eee8] border border-stone-200/80 rounded-xl px-3 py-2 text-xs text-stone-700 focus-within:border-stone-400 focus-within:bg-white transition-all">
              <Search className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 stroke-[2.2]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Tìm bàn học, tài liệu..."
                className="w-full bg-transparent placeholder:text-stone-400 focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveNav('home')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-between ${
                activeNav === 'home'
                  ? 'bg-[#eee8df] text-stone-900 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#f3eee7]'
              }`}
            >
              <span>Trang chủ</span>
            </button>

            <button
              onClick={() => {
                setActiveNav('my_desks');
                onEnterDesk();
              }}
              className={`w-full text-left px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-between ${
                activeNav === 'my_desks'
                  ? 'bg-[#eee8df] text-stone-900 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#f3eee7]'
              }`}
            >
              <span>Bàn học của tôi</span>
            </button>

            <button
              onClick={() => setActiveNav('starred')}
              className={`w-full text-left px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-between ${
                activeNav === 'starred'
                  ? 'bg-[#eee8df] text-stone-900 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#f3eee7]'
              }`}
            >
              <span>Đã gắn dấu sao</span>
            </button>

            <Link
              href="/market"
              className="w-full block px-3.5 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-[#f3eee7] transition-colors"
            >
              Chợ tài liệu
            </Link>

            <Link
              href="/dashboard"
              className="w-full block px-3.5 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-[#f3eee7] transition-colors"
            >
              Nhật ký học
            </Link>

            <Link
              href="/faq"
              className="w-full block px-3.5 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-[#f3eee7] transition-colors"
            >
              Hỏi đáp
            </Link>

            <Link
              href="/about"
              className="w-full block px-3.5 py-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-[#f3eee7] transition-colors"
            >
              Giới thiệu & Kỹ thuật
            </Link>
          </nav>
        </div>

        {/* Bottom Sidebar Card: Số dư ViToken */}
        <div className="pt-4">
          <div className="bg-[#f4efe8] border border-[#e8e1d7] rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-stone-500 block">Số dư</span>
            <div className="mt-1 flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getAssetPath('/icons/vitoken.png')} alt="ViToken" className="w-6 h-6 object-contain flex-shrink-0" />
              <span className="text-2xl font-black text-stone-900 tracking-tight font-mono">
                {typeof balance === 'number' ? balance : 50}
              </span>
              <span className="text-xs text-stone-500 font-medium">ViToken</span>
            </div>
            <button
              type="button"
              onClick={() => setIsTopUpOpen(true)}
              className="w-full mt-3 py-2.5 bg-[#E0562D] hover:bg-[#c9451e] text-white font-bold text-xs rounded-xl shadow-xs transition-colors text-center cursor-pointer active:scale-98"
            >
              Nạp ViToken
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-6 md:p-10 flex flex-col max-w-6xl mx-auto overflow-y-auto">
        {/* Top Right Header Pills */}
        <div className="flex items-center justify-end gap-2.5 mb-2">
          {/* Streak Badge */}
          <button
            type="button"
            onClick={() => claimDailyStreak?.()}
            title="Nhấp để điểm danh chuỗi học tập"
            className="px-3.5 py-1.5 rounded-full bg-white border border-stone-200/90 text-xs font-semibold text-stone-700 shadow-2xs hover:border-[#E0562D] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-[#E0562D] fill-[#E0562D]" />
            <span>Chuỗi {streakDays || 1} ngày · Điểm danh</span>
          </button>

          {/* User profile / login pill */}
          {status === 'authenticated' && user ? (
            <Link
              href="/profile"
              className="px-3.5 py-1.5 rounded-full bg-white border border-stone-200/90 text-xs font-semibold text-stone-700 shadow-2xs hover:border-[#E0562D] transition-colors inline-flex items-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5 text-stone-400" />
              <span>{userName}</span>
            </Link>
          ) : (
            <Link
              href="/auth"
              className="px-3.5 py-1.5 rounded-full bg-white border border-stone-200/90 text-xs font-semibold text-stone-700 shadow-2xs hover:border-[#E0562D] transition-colors"
            >
              <span>{userName}</span>
            </Link>
          )}
        </div>

        {/* Center Headline */}
        <div className="text-center my-6 md:my-10">
          <h1 className="text-3xl md:text-5xl font-serif text-stone-900 tracking-tight">
            Ôn bài thôi, <span className="text-[#E0562D] font-serif font-normal">{userName}</span>
          </h1>
        </div>

        {/* ================= SECTION 1: Bắt đầu bàn học mới ================= */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm md:text-base font-bold text-stone-900">Bắt đầu bàn học mới</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Chọn một mẫu, hoặc mở bàn trống rồi thả tài liệu vào.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSelectTemplate('blank')}
              className="bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.4]" />
              <span>Tạo bàn học</span>
            </button>
          </div>

          {/* 4 Template Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Bàn học trống */}
            <div
              onClick={() => handleSelectTemplate('blank')}
              className="bg-white border border-stone-200/90 rounded-2xl p-3 flex flex-col hover:border-[#E0562D] hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="aspect-[16/10] w-full rounded-xl border border-dashed border-stone-300 flex items-center justify-center bg-stone-50/60 group-hover:border-[#E0562D]/60 transition-colors">
                <Plus className="w-6 h-6 text-stone-400 group-hover:text-[#E0562D] stroke-[1.8] transition-colors" />
              </div>
              <span className="mt-3 text-xs font-bold text-stone-900 group-hover:text-[#E0562D] transition-colors">
                Bàn học trống
              </span>
            </div>

            {/* Card 2: Ôn thi giữa kỳ */}
            <div
              onClick={() => handleSelectTemplate('midterm')}
              className="bg-white border border-stone-200/90 rounded-2xl p-3 flex flex-col hover:border-[#E0562D] hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="aspect-[16/10] w-full rounded-xl bg-[#eef1f5] p-3 flex items-center justify-center gap-3 relative overflow-hidden group-hover:bg-[#e8ebf0] transition-colors">
                {/* Mini brown book preview */}
                <div className="w-20 h-13 rounded-xs border-2 border-[#5c3920] bg-white shadow-2xs flex overflow-hidden">
                  <div className="w-1/2 border-r border-stone-200 p-1 flex flex-col gap-0.5">
                    <div className="w-6 h-0.5 bg-stone-300 rounded-full" />
                    <div className="w-4 h-0.5 bg-stone-200 rounded-full" />
                  </div>
                  <div className="w-1/2 p-1 flex flex-col gap-0.5">
                    <div className="w-5 h-0.5 bg-stone-300 rounded-full" />
                    <div className="w-6 h-0.5 bg-stone-200 rounded-full" />
                  </div>
                </div>
                {/* Yellow sticky note */}
                <div className="w-7 h-9 rounded-2xs bg-[#fef08a] shadow-xs p-0.5 flex flex-col gap-0.5">
                  <div className="w-4 h-0.5 bg-amber-300/80 rounded-full mt-1" />
                  <div className="w-3 h-0.5 bg-amber-300/60 rounded-full" />
                </div>
              </div>
              <span className="mt-3 text-xs font-bold text-stone-900 group-hover:text-[#E0562D] transition-colors">
                Ôn thi giữa kỳ
              </span>
            </div>

            {/* Card 3: Giáo trình + đề thi */}
            <div
              onClick={() => handleSelectTemplate('curriculum_exam')}
              className="bg-white border border-stone-200/90 rounded-2xl p-3 flex flex-col hover:border-[#E0562D] hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="aspect-[16/10] w-full rounded-xl bg-[#eef1f5] p-3 flex items-center justify-center gap-2 relative overflow-hidden group-hover:bg-[#e8ebf0] transition-colors">
                {/* 2 White portrait sheets */}
                <div className="w-11 h-15 rounded-xs bg-white border border-stone-300/80 shadow-2xs p-1 flex flex-col gap-0.5">
                  <div className="w-6 h-0.5 bg-emerald-400 rounded-full" />
                  <div className="w-8 h-0.5 bg-stone-200 rounded-full mt-0.5" />
                  <div className="w-7 h-0.5 bg-stone-200 rounded-full" />
                </div>
                <div className="w-11 h-15 rounded-xs bg-white border border-stone-300/80 shadow-2xs p-1 flex flex-col gap-0.5 relative">
                  <div className="w-6 h-0.5 bg-blue-400 rounded-full" />
                  <div className="w-8 h-0.5 bg-stone-200 rounded-full mt-0.5" />
                  <div className="w-7 h-0.5 bg-stone-200 rounded-full" />
                  {/* Small overlapping note */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-7 rounded-2xs bg-[#fef08a] shadow-xs" />
                </div>
              </div>
              <span className="mt-3 text-xs font-bold text-stone-900 group-hover:text-[#E0562D] transition-colors">
                Giáo trình + đề thi
              </span>
            </div>

            {/* Card 4: Học nhóm */}
            <div
              onClick={() => handleSelectTemplate('group_study')}
              className="bg-white border border-stone-200/90 rounded-2xl p-3 flex flex-col hover:border-[#E0562D] hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="aspect-[16/10] w-full rounded-xl bg-[#eef1f5] p-3 flex items-center justify-center gap-3 relative overflow-hidden group-hover:bg-[#e8ebf0] transition-colors">
                {/* Brown notebook */}
                <div className="w-18 h-13 rounded-xs bg-[#5c3920] shadow-xs relative flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#E0562D] border-2 border-white shadow-xs" />
                </div>
                {/* Peer avatar dot */}
                <div className="w-3.5 h-3.5 rounded-full bg-[#10b981] border-2 border-white shadow-xs -ml-1" />
              </div>
              <span className="mt-3 text-xs font-bold text-stone-900 group-hover:text-[#E0562D] transition-colors">
                Học nhóm
              </span>
            </div>
          </div>
        </section>

        {/* ================= SECTION 2: Mở lại gần đây ================= */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm md:text-base font-bold text-stone-900">Mở lại gần đây</h2>
            {spaces.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllSpaces(!showAllSpaces)}
                className="text-xs font-bold text-[#E0562D] hover:underline cursor-pointer"
              >
                {showAllSpaces ? 'Thu gọn' : 'Xem tất cả'}
              </button>
            )}
          </div>

          {/* Table Container */}
          <div className="w-full">
            {/* Table Header */}
            <div className="grid grid-cols-12 text-[11px] font-semibold text-stone-400 pb-2 border-b border-stone-200/80 px-2">
              <div className="col-span-6">Tên</div>
              <div className="col-span-3 text-left">Mở lần cuối</div>
              <div className="col-span-3 text-left">Chủ sở hữu</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-stone-100">
              {displayedSpaces.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400 italic">
                  Chưa có bàn học nào phù hợp với tìm kiếm
                </div>
              ) : (
                displayedSpaces.map((space) => {
                  return (
                    <div
                      key={space.id}
                      onClick={() => handleOpenSpace(space.id)}
                      className="grid grid-cols-12 items-center py-3 px-2 rounded-xl hover:bg-stone-100/70 transition-colors cursor-pointer group"
                    >
                      {/* Name & Subtitle */}
                      <div className="col-span-6 pr-3">
                        <div className="text-xs font-bold text-stone-900 group-hover:text-[#E0562D] transition-colors truncate">
                          {space.name}
                        </div>
                        {space.description && (
                          <div className="text-[11px] text-stone-400 truncate mt-0.5">
                            {space.description}
                          </div>
                        )}
                      </div>

                      {/* Last Opened */}
                      <div className="col-span-3 text-xs text-stone-500">
                        Hôm nay
                      </div>

                      {/* Owner */}
                      <div className="col-span-3 text-xs text-stone-500">
                        Bạn
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* ================= SECTION 3: Chợ tài liệu (Dải nhỏ ở đáy) ================= */}
        <section className="mt-auto pt-4">
          <div className="bg-white border border-stone-200/90 rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Chợ tài liệu</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Sách, tờ tóm tắt và đề thi do sinh viên khác chia sẻ.
              </p>
            </div>
            <Link
              href="/market"
              className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 hover:bg-stone-50 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Xem chợ tài liệu</span>
            </Link>
          </div>
        </section>
      </main>

      {/* ================= MODAL: Nạp ViToken qua VietQR ================= */}
      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
    </div>
  );
}

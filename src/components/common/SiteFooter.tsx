'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Shield, HelpCircle, FileText, Mail, Heart } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-700 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo và giới thiệu ngắn */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#E0562D] text-white flex items-center justify-center font-black shadow-2xs">
            <BookOpen className="w-4 h-4 stroke-[2.4]" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight">ViTudy</div>
            <p className="text-xs text-slate-600">Bàn học trực quan hỗ trợ ôn thi</p>
          </div>
        </div>

        {/* Các liên kết điều hướng và hỗ trợ */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-700">
          <Link href="/terms" className="hover:text-[#E0562D] transition-colors flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Điều khoản sử dụng</span>
          </Link>
          <Link href="/privacy" className="hover:text-[#E0562D] transition-colors flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span>Chính sách quyền riêng tư</span>
          </Link>
          <Link href="/faq" className="hover:text-[#E0562D] transition-colors flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Câu hỏi thường gặp</span>
          </Link>
          <a
            href="mailto:support@vitudy.edu.vn"
            className="hover:text-[#E0562D] transition-colors flex items-center gap-1.5 text-slate-700"
          >
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>Hỗ trợ: support@vitudy.edu.vn</span>
          </a>
        </div>

        {/* Thông tin bản quyền & đồ án học thuật - chuẩn tương phản WCAG AA */}
        <div className="text-xs text-slate-600 text-center md:text-right font-medium">
          <p>© 2026 ViTudy Project. Đồ án Báo cáo Học thuật.</p>
          <p className="mt-1 text-[11px] text-slate-500 flex items-center justify-center md:justify-end gap-1">
            <span>Thiết kế cho sinh viên Việt Nam</span>
            <Heart className="w-3 h-3 text-[#E0562D] fill-[#E0562D]" />
          </p>
        </div>
      </div>
    </footer>
  );
}

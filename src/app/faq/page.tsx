'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { SiteFooter } from '@/components/common/SiteFooter';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_LIST: FaqItem[] = [
  {
    category: 'Bàn học',
    question: 'Bàn học ViTudy dùng như thế nào?',
    answer: 'Thay vì xem tài liệu từng tab, bạn mở sách giáo trình, đề thi và mẩu giấy ghi chú trên cùng một màn hình. Bạn có thể dùng bút dạ quang để gạch chân chữ, và nét vẽ sẽ bám theo trang sách khi bạn kéo di chuyển.',
  },
  {
    category: 'Bàn học',
    question: 'Di chuyển và phóng to thu nhỏ bàn học bằng cách nào?',
    answer: 'Lăn con lăn chuột để phóng to hoặc thu nhỏ. Giữ chuột trái trên mặt bàn để kéo di chuyển, hoặc dùng các phím W, A, S, D trên bàn phím. Bạn cũng có thể bấm phím M để mở bản đồ thu nhỏ.',
  },
  {
    category: 'Ôn tập',
    question: 'Lịch ôn flashcard được tính như thế nào?',
    answer: 'Sau khi trả lời một thẻ ghi nhớ, bạn chọn một trong bốn mức: Quên, Khó, Vừa, hoặc Dễ. Dựa vào đó, hệ thống sẽ xếp lịch nhắc bạn ôn lại thẻ vào ngày mai, sau vài ngày hoặc lâu hơn, giúp bạn không tốn thời gian ôn những câu đã nhớ kỹ.',
  },
  {
    category: 'Ôn tập',
    question: 'Bôi đen chữ để hỏi bài hoạt động ra sao?',
    answer: 'Khi đọc đến câu văn hay công thức toán chưa hiểu, bạn dùng chuột bôi đen đoạn đó. Một khung nhỏ sẽ hiện lên cho phép bạn xem giải thích ngắn gọn, tạo câu hỏi trắc nghiệm hoặc dán nội dung tóm tắt sang một mẩu giấy ghi chú.',
  },
  {
    category: 'Tài khoản & Điểm',
    question: 'ViToken dùng để làm gì và nạp như thế nào?',
    answer: 'ViToken là điểm dùng để đặt câu hỏi cho AI và tải tài liệu trên Chợ. Bạn bấm nút dấu cộng trên thanh Ví, chọn gói nạp rồi quét mã VietQR bằng app ngân hàng. Hệ thống sẽ tự cộng điểm vào tài khoản sau vài giây.',
  },
  {
    category: 'Tài khoản & Điểm',
    question: 'Dùng khóa API riêng của cá nhân được không?',
    answer: 'Có. Bạn có thể dùng khóa API Gemini hoặc OpenAI của mình để không tốn ViToken. Bấm vào biểu tượng robot ở thanh trên cùng bên phải, dán khóa vào rồi lưu lại. Khóa này chỉ lưu trên trình duyệt của máy bạn.',
  },
  {
    category: 'Học nhóm',
    question: 'Học chung với bạn bè như thế nào?',
    answer: 'Bấm nút Chia sẻ ở góc dưới bên trái để lấy đường dẫn phòng học rồi gửi cho bạn bè. Khi vào chung phòng, mọi người sẽ thấy con trỏ chuột của nhau khi cùng giải bài tập.',
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full min-h-screen bg-white text-slate-800 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#E0562D] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại bàn học</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#E0562D] text-white flex items-center justify-center font-bold text-xs">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm text-slate-900">Hỏi đáp ViTudy</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-4 border border-slate-200">
          <HelpCircle className="w-3.5 h-3.5 text-[#E0562D]" />
          <span>Giải đáp thắc mắc</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif text-slate-900 tracking-tight mb-2">
          Câu hỏi thường gặp
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-8">
          Cách sử dụng bàn học, lịch ôn thẻ ghi nhớ, nạp điểm và làm việc nhóm.
        </p>

        <div className="space-y-3">
          {FAQ_LIST.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E0562D]">
                      {item.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {item.question}
                    </h3>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center bg-slate-100 text-slate-600 transition-transform flex-shrink-0 ${
                      isOpen ? 'rotate-180 bg-orange-100 text-[#E0562D]' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 stroke-[2.4]" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Help Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <h4 className="text-sm font-bold text-slate-900 mb-1">Bạn muốn hỏi thêm điều gì khác?</h4>
          <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
            Xem thêm mã nguồn và thông tin đóng góp cho dự án trên GitHub.
          </p>
          <a
            href="https://github.com/namtacozz/ViTudy"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-2xs"
          >
            <span>Mã nguồn trên GitHub</span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}

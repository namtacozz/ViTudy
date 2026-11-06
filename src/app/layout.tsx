import type { Metadata } from 'next';
import './globals.css';
import { ViTokenProvider } from '@/context/ViTokenContext';
import { StudySpaceProvider } from '@/context/StudySpaceContext';

export const metadata: Metadata = {
  title: 'ViTudy — Không Gian Học Thức Tích Hợp AI',
  description: 'Nền tảng bàn học 2.5D tương tác, ôn tập thông minh Non-AI & AI, chợ tri thức KnowInherit và đơn vị tiền tệ ViToken.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <body 
        suppressHydrationWarning
        className="bg-slate-950 text-slate-100 antialiased overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200"
      >
        <ViTokenProvider>
          <StudySpaceProvider>
            {children}
          </StudySpaceProvider>
        </ViTokenProvider>
      </body>
    </html>
  );
}

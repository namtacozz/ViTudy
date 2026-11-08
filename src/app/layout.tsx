import type { Metadata } from 'next';
import { Open_Sans, Patrick_Hand } from 'next/font/google';
import './globals.css';
import { ViTokenProvider } from '@/context/ViTokenContext';
import { StudySpaceProvider } from '@/context/StudySpaceContext';

const openSans = Open_Sans({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  variable: '--font-ui',
  display: 'swap',
});

const patrickHand = Patrick_Hand({
  weight: '400',
  subsets: ['latin', 'vietnamese'],
  variable: '--font-note',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ViTudy — Bàn Học Tương Tác',
  description: 'Bàn học tương tác, tài liệu học tập và hỗ trợ ôn thi thông minh.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${openSans.variable} ${patrickHand.variable}`} suppressHydrationWarning spellCheck={false}>
      <body 
        suppressHydrationWarning
        spellCheck={false}
        className="font-sans bg-white text-slate-800 antialiased overflow-hidden selection:bg-slate-200 selection:text-slate-900"
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

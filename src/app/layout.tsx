import type { Metadata } from 'next';
import { Open_Sans, Patrick_Hand, Lora } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
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

const lora = Lora({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-serif',
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
    <html lang="vi" className={`${openSans.variable} ${patrickHand.variable} ${lora.variable}`} suppressHydrationWarning spellCheck={false}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#E0562D" />
      </head>
      <body 
        suppressHydrationWarning
        spellCheck={false}
        className="font-sans bg-white text-slate-800 antialiased selection:bg-slate-200 selection:text-slate-900"
      >
        <AuthProvider>
          <ViTokenProvider>
            <StudySpaceProvider>
              {children}
            </StudySpaceProvider>
          </ViTokenProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

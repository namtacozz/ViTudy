import type { Metadata } from 'next';
import { Open_Sans, Patrick_Hand, Lora } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ViTokenProvider } from '@/context/ViTokenContext';
import { StudySpaceProvider } from '@/context/StudySpaceContext';
import { PomodoroProvider } from '@/context/PomodoroContext';

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

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: 'ViTudy — Bàn Học Tương Tác',
  description: 'Bàn học tương tác, tài liệu học tập và hỗ trợ ôn thi thông minh.',
  icons: {
    icon: [
      { url: `${basePath}/icons/vitudy.png`, type: 'image/png' },
      { url: `${basePath}/favicon.ico` },
    ],
    apple: `${basePath}/icons/vitudy.png`,
  },
  manifest: `${basePath}/manifest.json`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${openSans.variable} ${patrickHand.variable} ${lora.variable}`} suppressHydrationWarning spellCheck={false}>
      <head>
        <link rel="manifest" href={`${basePath}/manifest.json`} />
        <link rel="icon" href={`${basePath}/icons/vitudy.png`} type="image/png" />
        <link rel="shortcut icon" href={`${basePath}/favicon.ico`} />
        <link rel="apple-touch-icon" href={`${basePath}/icons/vitudy.png`} />
        <meta name="theme-color" content="#E0562D" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https://*.supabase.co https://img.vietqr.io https://api.vietqr.io https://media.giphy.com https://*.giphy.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://chatgpt.com https://auth.openai.com https://generativelanguage.googleapis.com https://api.anthropic.com https://vi.wikipedia.org; worker-src 'self' blob:;"
        />
      </head>
      <body 
        suppressHydrationWarning
        spellCheck={false}
        className="font-sans bg-white text-slate-800 antialiased selection:bg-slate-200 selection:text-slate-900"
      >
        <AuthProvider>
          <ViTokenProvider>
            <PomodoroProvider>
              <StudySpaceProvider>
                {children}
              </StudySpaceProvider>
            </PomodoroProvider>
          </ViTokenProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

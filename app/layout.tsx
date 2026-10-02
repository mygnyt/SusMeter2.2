import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { TelegramProvider } from '@/components/TelegramProvider';

export const metadata: Metadata = {
  title: 'SusMeter CS — Оценка подозрительности Steam-аккаунтов',
  description:
    'Вставь ссылку на Steam-профиль, и мы оценим по открытым данным, насколько аккаунт подозрителен и почему. Это подсказка, а не приговор.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#0e131b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased bg-[#0e131b] text-slate-100 flex flex-col min-h-screen">
        <TelegramProvider>{children}</TelegramProvider>
      </body>
    </html>
  );
}

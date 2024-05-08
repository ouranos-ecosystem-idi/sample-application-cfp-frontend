import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import packageInfo from '@/package.json';
import Favicon from '@/public/Favicon.ico';
import { AlertProvider } from '@/components/template/AlertHandler';
import TransitionMonitoring from '@/components/atoms/TransitionMonitoring';
import { ReactNode, Suspense } from 'react';
import { ErrorHandlerProvider } from '@/components/template/ErrorHandler';

export const metadata: Metadata = {
  title: '蓄電池トレサビ',
  description: 'CFPアプリ参考実装例',
  icons: [{ rel: 'icon', url: Favicon.src }],
};

const font = localFont({
  src: '../fonts/Noto_Sans_JP/NotoSansJP-VariableFont_wght.ttf',
  display: 'swap',
});

const aUrl = new URL(
  process.env.NEXT_PUBLIC_DATA_TRANSPORT_API_BASE_URL ?? 'https://undefined/'
).host;
const bUrl = new URL(
  process.env.NEXT_PUBLIC_TRACEABILITY_API_BASE_URL ?? 'https://undefined/'
).host;
const footerText = `Version:${packageInfo.version} A:${aUrl}  B:${bUrl}`;

export default function RootLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <html lang='ja' data-theme='default'>
      <head>
        <meta name='app:version' content={packageInfo.version} />
      </head>
      <body className={font.className}>
        <Suspense fallback={<div>...Loading</div>}>
          <TransitionMonitoring />
          <ErrorHandlerProvider>
            <AlertProvider>
              {children}
            </AlertProvider>
          </ErrorHandlerProvider>
          <footer className='fixed bottom-0 left-0'>
            <p>{footerText}</p>
          </footer>
        </Suspense>
      </body>
    </html>
  );
}

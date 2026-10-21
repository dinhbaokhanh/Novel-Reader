import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: {
    default: 'Trang sách | AI Novel Writer',
    template: '%s | AI Novel Writer',
  },
  description: 'Không gian đọc và sáng tác truyện với AI.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // cho phép dùng env(safe-area-inset-*) trên iPhone
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafb' },
    { media: '(prefers-color-scheme: dark)',  color: '#111b2e' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}

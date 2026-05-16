import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from '@/contexts/LanguageContext';

export const metadata: Metadata = {
  title: 'VisionInspect — AI Product Defect Detection',
  description: 'Upload product images and detect defects instantly using AI. Free and Pro plans available.',
  keywords: ['defect detection', 'AI inspection', 'quality control', 'machine vision'],
  openGraph: {
    title: 'VisionInspect — AI Product Defect Detection',
    description: 'Upload product images and detect defects instantly using AI.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#12152b',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(16px)',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#12152b' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#12152b' },
            },
          }}
        />
      </body>
    </html>
  );
}

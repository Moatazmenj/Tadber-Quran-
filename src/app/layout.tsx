import type { Metadata } from 'next';
import { Alegreya, Cairo, Noto_Kufi_Arabic, Noto_Naskh_Arabic } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import ThemeManager from '@/components/ThemeManager';
import { SplashScreen } from '@/components/SplashScreen';
import { cn } from '@/lib/utils';
import { RecordButton } from '@/components/RecordButton';

const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  variable: '--font-cairo',
  display: 'swap',
});

const alegreya = Alegreya({
  subsets: ['latin'],
  variable: '--font-alegreya',
  display: 'swap',
});

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-kufi-arabic',
  display: 'swap',
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-naskh-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tadber Quran',
  description: 'Browse, read, and reflect upon the Holy Quran.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className="dark notranslate" translate="no">
      <head>
        <meta name="google" content="notranslate" />
        <meta name="google-site-verification" content="MCyzGv3lByPE6bWQc719qeuZWiyyntMJb1ER-WEUuoI" />
      </head>
      <body className={cn(
        "antialiased",
        cairo.variable,
        alegreya.variable,
        notoKufiArabic.variable,
        notoNaskhArabic.variable,
        'font-body'
      )}>
        <SplashScreen>
          <ThemeManager />
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">{children}</main>
          </div>
          <RecordButton />
          <Toaster />
        </SplashScreen>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Alegreya, Cairo, Noto_Kufi_Arabic, Noto_Naskh_Arabic } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import ThemeManager from '@/components/ThemeManager';
import { SplashScreen } from '@/components/SplashScreen';
import { cn } from '@/lib/utils';
import { RecordButton } from '@/components/RecordButton';
import Analytics from '@/components/Analytics';

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
  title: 'Tadber',
  description: 'تدريب تفاعلي لتلاوة القرآن الكريم.',
  icons: {
    icon: 'https://i.postimg.cc/htG7JQBz/20250709-110234.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX';
  return (
    <html lang="en" dir="ltr" className="dark notranslate" translate="no">
      <head>
        <meta name="google" content="notranslate" />
        <meta name="google-site-verification" content="LgqOQAtjJYIobn9DHUcO6AwgO8q2gKnclAstbDwfcSs" />
        <Analytics />
      </head>
      <body className={cn(
        "antialiased",
        cairo.variable,
        alegreya.variable,
        notoKufiArabic.variable,
        notoNaskhArabic.variable,
        'font-body'
      )}>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
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

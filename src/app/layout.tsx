import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { SettingsProvider } from '@/hooks/use-settings';
import { AppProvider } from '@/hooks/use-app-context';
import { TeacherAuthProvider } from '@/hooks/use-teacher-auth';

export const metadata: Metadata = {
  title: {
    default: 'SAATH Academy Samundri',
    template: '%s | SAATH Academy Samundri',
  },
  description: 'An Academy Management System',
  manifest: '/manifest.json',
  icons: {
    icon: 'https://i.postimg.cc/v8L8kPMV/saath.png',
  },
  applicationName: 'SAATH Academy Samundri',
  appleWebApp: {
    capable: true,
    title: 'SAATH Academy Samundri',
    statusBarStyle: 'default',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <SettingsProvider>
            <AppProvider>
              <TeacherAuthProvider>
                {children}
              </TeacherAuthProvider>
            </AppProvider>
            <Toaster />
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
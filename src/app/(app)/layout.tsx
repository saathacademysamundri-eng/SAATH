
import React, { Suspense } from 'react';
import { ConditionalLayout } from './conditional-layout';
import { AppProvider } from '@/hooks/use-app-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // This layout is now only for authenticated routes.
  // The root layout handles the public pages.
  return (
    <Suspense fallback={<div>Loading...</div>}>
       <AppProvider>
        <ConditionalLayout>{children}</ConditionalLayout>
      </AppProvider>
    </Suspense>
  );
}

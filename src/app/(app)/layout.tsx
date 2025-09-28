import React, { Suspense } from 'react';
import { ConditionalLayout } from './conditional-layout';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConditionalLayout>{children}</ConditionalLayout>
    </Suspense>
  );
}

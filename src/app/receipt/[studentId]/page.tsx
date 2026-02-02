'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlobalPreloader } from '@/components/global-preloader';

export default function FeeReceiptRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return <GlobalPreloader />;
}

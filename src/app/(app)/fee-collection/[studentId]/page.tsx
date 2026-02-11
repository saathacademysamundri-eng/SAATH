'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlobalPreloader } from '@/components/global-preloader';

export default function StudentFeeDetailsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/fee-collection');
  }, [router]);

  return <GlobalPreloader />;
}

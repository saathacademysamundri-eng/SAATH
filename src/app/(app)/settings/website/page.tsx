'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlobalPreloader } from '@/components/global-preloader';

export default function WebsiteEditorRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings');
  }, [router]);

  return <GlobalPreloader />;
}

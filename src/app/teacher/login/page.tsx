
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlobalPreloader } from '@/components/global-preloader';

export default function TeacherLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return <GlobalPreloader />;
}

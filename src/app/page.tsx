
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';
import { GlobalPreloader } from '@/components/global-preloader';

const ADMIN_UID = "oiNKNvX9sQbdgjhxMP71eSiGkkH2";

export default function RootPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    // If not loading, redirect based on user auth state.
    if (!loading) {
      if (user) {
        if (user.uid === ADMIN_UID) {
          router.replace('/dashboard');
        } else {
          // If it's not the admin, assume it's a teacher
          router.replace('/teacher/dashboard');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  // While checking auth state, show a preloader.
  // This prevents any flash of content before redirection.
  return <GlobalPreloader />;
}

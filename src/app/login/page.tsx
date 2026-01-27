
'use client';

import { LoginForm } from '@/components/login/login-form';
import { useEffect, useState } from 'react';
import { Loader2, Facebook, Instagram, MessageSquare } from 'lucide-react';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);
  const [academyName, setAcademyName] = useState('SAATH Academy Samundri');
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    
    const cachedSettings = sessionStorage.getItem('cachedSettings');
    let name = 'SAATH Academy Samundri';
    if (cachedSettings) {
      try {
        const settings = JSON.parse(cachedSettings);
        name = settings.name || 'SAATH Academy Samundri';
      } catch (e) {
        console.error("Failed to parse cached settings for title");
      }
    }
    setAcademyName(name);
    document.title = `Login | ${name}`;
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-svh w-full items-center justify-center p-4 bg-gradient-to-br from-fuchsia-500 via-purple-600 to-cyan-500 animate-animated-gradient bg-[length:400%_400%]">
       <div className="w-full max-w-md space-y-8">
        <div className="rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-lg border border-white/20">
          <div className="mb-8 text-center text-white">
            <div className="mx-auto h-20 w-20">
              <Logo noText onLogin />
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tighter">
              {academyName}
            </h1>
             <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Admin Portal
              </h2>
              <p className="mt-1 text-sm text-gray-200">
                Please enter your login information.
              </p>
          </div>
          <LoginForm />
           <div className="mt-4 flex flex-col items-center justify-center text-sm">
              <Button variant="link" onClick={() => router.push('/teacher/login')} className="text-gray-200 hover:text-white">
                Are you a teacher? Log in here.
              </Button>
            </div>
        </div>
         <div className="mt-8 text-center text-sm text-white/70">
          <p>Developed by "Mian Mudassar"</p>
          <div className="mt-2 flex justify-center gap-4">
              <Link href="https://www.facebook.com/mianmudassar.in" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                <Facebook className="h-4 w-4" />
            </Link>
              <Link href="https://api.whatsapp.com/send?phone=923099969535&text=Hye%20%0AI%20want%20to%20know%20about%20the%20software%20you%20created%2C%20which%20is%20a%20management%20system%20in%20the%20school.%20" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                <MessageSquare className="h-4 w-4" />
            </Link>
            <Link href="https://www.instagram.com/mianmudassar_" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                <Instagram className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

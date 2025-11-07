
'use client';

import { LoginForm } from '@/components/login/login-form';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, Facebook, Instagram, MessageSquare } from 'lucide-react';
import { Logo } from '@/components/logo';
import Link from 'next/link';

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);
  const [bgImageId, setBgImageId] = useState(1);
  const [academyName, setAcademyName] = useState('My Academy');

  useEffect(() => {
    setIsClient(true);
    setBgImageId(Math.floor(Math.random() * 1000) + 1);

    const cachedSettings = sessionStorage.getItem('cachedSettings');
    let name = 'My Academy';
    if (cachedSettings) {
      try {
        const settings = JSON.parse(cachedSettings);
        name = settings.name || 'My Academy';
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
    <main className="flex min-h-svh w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="relative flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:h-auto md:min-h-[550px] md:flex-row">
        
        {/* Left Side - Login Form */}
        <div className="relative flex w-full flex-col justify-center p-8 md:w-1/2 lg:p-12 text-gray-900 dark:text-gray-900">
            {/* Background texture */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-5 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"></div>

          <div className="relative z-10 mx-auto w-full max-w-sm">
            <div className="mb-8 text-center">
                <div className="flex flex-col items-center justify-center gap-2 mb-4">
                    <div className="h-24 w-24">
                        <Logo noText onLogin />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tighter text-gray-900">{academyName}</h1>
                </div>
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                Login to system
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Please enter your login information.
              </p>
            </div>
            <LoginForm />
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Developed by "Mian Mudassar"</p>
              <div className="mt-2 flex justify-center gap-4">
                 <Link href="https://www.facebook.com/mianmudassar.in" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
                    <Facebook className="h-4 w-4" />
                </Link>
                 <Link href="https://api.whatsapp.com/send?phone=923099969535&text=Hye%20%0AI%20want%20to%20know%20about%20the%20software%20you%20created%2C%20which%20is%20a%20management%20system%20in%20the%20school.%20" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
                    <MessageSquare className="h-4 w-4" />
                </Link>
                <Link href="https://www.instagram.com/mianmudassar_" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
                    <Instagram className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="relative hidden w-1/2 items-center justify-center md:flex">
          <Image
            src={`https://picsum.photos/seed/${bgImageId}/800/1200`}
            alt="Abstract background"
            fill
            className="object-cover"
            data-ai-hint="abstract background"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/70 via-purple-600/50 to-pink-600/50 mix-blend-multiply"></div>
           <div className="absolute inset-0 bg-black/20"></div>
        </div>
      </div>
    </main>
  );
}

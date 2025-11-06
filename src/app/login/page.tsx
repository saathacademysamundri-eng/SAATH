
'use client';

import { LoginForm } from '@/components/login/login-form';
import { useSettings } from '@/hooks/use-settings';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  const { settings, isSettingsLoading } = useSettings();
  const [isClient, setIsClient] = useState(false);
  const [bgImageId, setBgImageId] = useState(1);

  useEffect(() => {
    setIsClient(true);
    // Randomize background image on each load
    setBgImageId(Math.floor(Math.random() * 1000) + 1);
  }, []);

  useEffect(() => {
    if (!isSettingsLoading && settings.name) {
      document.title = `Login | ${settings.name}`;
    }
  }, [isSettingsLoading, settings.name]);

  if (isSettingsLoading || !isClient) {
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
        <div className="relative flex w-full flex-col justify-center p-8 md:w-1/2 lg:p-12">
            {/* Background texture */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-5 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"></div>

            <Link href="/" className="absolute top-4 left-4 z-10 inline-flex items-center text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>

          <div className="relative z-10 mx-auto w-full max-w-sm">
            <div className="mb-8 text-left">
                <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="h-20 w-20">
                        <Logo noText />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">
                        {settings.name}
                    </h1>
                </div>
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-900">
                Login to system
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                Please enter your login information.
              </p>
            </div>
            <LoginForm />
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

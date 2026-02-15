'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings } from '@/hooks/use-settings';
import { Logo } from '@/components/logo';
import { Loader2, Search, GraduationCap, Phone } from 'lucide-react';
import Image from 'next/image';

export default function StudentPortalLoginPage() {
  const [rollNumber, setRollNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { settings, isSettingsLoading } = useSettings();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const queryTerm = rollNumber.trim();
    const phoneTerm = phoneNumber.trim();
    if (!queryTerm || !phoneTerm) return;

    setIsLoading(true);
    
    // Smart ID Formatting logic
    let formattedId = queryTerm;
    if (/^\d+$/.test(queryTerm)) {
      formattedId = `S${queryTerm.padStart(3, '0')}`;
    } else if (/^s\d+$/i.test(queryTerm)) {
      formattedId = `S${queryTerm.substring(1).padStart(3, '0')}`;
    }

    // Pass phone number as a query parameter for verification on the next page
    router.push(`/portal/${formattedId}?p=${encodeURIComponent(phoneTerm)}`);
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://images.unsplash.com/photo-1523050853063-bd8012fec2ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzfGVufDB8fHx8MTc2MTU0MDIwOXww&ixlib=rb-4.1.0&q=80&w=1920"
          alt="Academy Campus"
          fill
          className="object-cover opacity-40 dark:opacity-20"
          priority
          data-ai-hint="university campus"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background/80 to-background"></div>
      </div>

      <Card className="w-full max-w-md z-10 shadow-2xl border-primary/20 bg-card/90 backdrop-blur-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-24 w-24 drop-shadow-xl">
            <Logo noText />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight uppercase text-primary">
              {settings.name}
            </CardTitle>
            <CardDescription className="text-lg font-medium">Secure Student Access</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="rollNumber" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Roll Number
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-primary/60" />
                <Input
                  id="rollNumber"
                  placeholder="e.g., S001"
                  className="pl-10 h-12 text-lg font-mono border-2 focus:border-primary transition-all bg-background/50"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Registered Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-primary/60" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="e.g., 03001234567"
                  className="pl-10 h-12 text-lg border-2 focus:border-primary transition-all bg-background/50"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-center italic mt-1">
                Enter the number registered during admission for security.
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full text-lg py-7 shadow-lg hover:shadow-primary/20 transition-all font-bold" disabled={isLoading || !rollNumber.trim() || !phoneNumber.trim()}>
              {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Search className="mr-2" />}
              Access Portal
            </Button>
          </form>
        </CardContent>
        <CardContent className="pt-0 text-center">
            <p className="text-xs text-muted-foreground">
                Having trouble? Contact the administration office.
            </p>
        </CardContent>
      </Card>
    </main>
  );
}

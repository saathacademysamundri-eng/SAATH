
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings } from '@/hooks/use-settings';
import { Logo } from '@/components/logo';
import { Loader2, Search, GraduationCap } from 'lucide-react';
import Image from 'next/image';

export default function StudentPortalLoginPage() {
  const [rollNumber, setRollNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { settings, isSettingsLoading } = useSettings();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const queryTerm = rollNumber.trim();
    if (!queryTerm) return;

    setIsLoading(true);
    
    // Smart ID Formatting logic duplicated for consistency
    let formattedId = queryTerm;
    if (/^\d+$/.test(queryTerm)) {
      formattedId = `S${queryTerm.padStart(3, '0')}`;
    } else if (/^s\d+$/i.test(queryTerm)) {
      formattedId = `S${queryTerm.substring(1).padStart(3, '0')}`;
    }

    router.push(`/portal/${formattedId}`);
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://images.unsplash.com/photo-1523050853063-bd8012fec2ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzfGVufDB8fHx8MTc2MTU0MDIwOXww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Academy Campus"
          fill
          className="object-cover opacity-20 dark:opacity-10"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background"></div>
      </div>

      <Card className="w-full max-w-md z-10 shadow-2xl border-primary/20 bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-24 w-24">
            <Logo noText />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight uppercase">
              {settings.name}
            </CardTitle>
            <CardDescription className="text-lg">Student Portal</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="rollNumber" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Enter Your Roll Number
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="rollNumber"
                  placeholder="e.g., S001"
                  className="pl-10 h-12 text-lg font-mono border-2 focus:border-primary transition-all"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                  required
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground text-center italic">
                You can enter just the number (e.g., "1") or the full ID.
              </p>
            </div>
            <Button type="submit" size="lg" className="w-full text-lg py-6" disabled={isLoading || !rollNumber.trim()}>
              {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Search className="mr-2" />}
              Access My Data
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

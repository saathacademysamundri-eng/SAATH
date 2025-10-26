import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Users, BookUser, GraduationCap } from 'lucide-react';

const stats = [
    { icon: Users, value: '1,200+', label: 'Happy Students' },
    { icon: BookUser, value: '50+', label: 'Qualified Teachers' },
    { icon: GraduationCap, value: '98%', label: 'Success Rate' },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
             <div className='h-10 w-10 bg-muted rounded-full flex items-center justify-center overflow-hidden shrink-0'>
                <Logo noText={true} />
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center">
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container relative">
           <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
                <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
                    <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                        The Future of Academy Management
                    </h1>
                    <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                        Streamline your operations, empower your teachers, and engage your students with our all-in-one management system.
                    </p>
                    <div className="space-x-4">
                        <Button asChild size="lg">
                            <Link href="/login">Get Started</Link>
                        </Button>
                    </div>
                </div>
           </section>

           <section id="features" className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24 rounded-xl">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                    <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Why Choose Us?</h2>
                    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                       Our platform is built to handle everything from student admission to financial reporting, so you can focus on what matters most: education.
                    </p>
                </div>
                <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                             <Card key={index} className="flex flex-col items-center justify-center p-8 text-center">
                                <Icon className="h-16 w-16 mb-4 text-primary" />
                                <p className="text-4xl font-bold">{stat.value}</p>
                                <p className="text-lg text-muted-foreground">{stat.label}</p>
                            </Card>
                        )
                    })}
                </div>
           </section>
        </div>
      </main>
       <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by Mian Mudassar.
          </p>
        </div>
      </footer>
    </div>
  );
}

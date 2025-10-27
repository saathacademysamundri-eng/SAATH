
'use client';

import { CheckCircle, Zap, TrendingUp, BookOpen } from 'lucide-react';
import Image from 'next/image';
import { useSettings } from '@/hooks/use-settings';

export function BenefitsSection() {
  const { settings } = useSettings();

  const benefits = [
    {
      title: settings.benefit1Title,
      description: settings.benefit1Description,
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
    },
    {
      title: settings.benefit2Title,
      description: settings.benefit2Description,
      icon: <Zap className="h-6 w-6 text-blue-500" />,
    },
    {
      title: settings.benefit3Title,
      description: settings.benefit3Description,
      icon: <BookOpen className="h-6 w-6 text-purple-500" />,
    },
  ];
  
  return (
    <section className="container py-12 md:py-24">
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className="relative h-[500px] w-full">
          <Image
              src={settings.benefitsImageUrl}
              alt="Benefits of learning"
              className="rounded-2xl object-cover"
              fill
              data-ai-hint="student learning"
            />
          <div className="absolute -bottom-4 -left-4 w-fit rounded-lg bg-white p-4 shadow-lg dark:bg-card">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-orange-100 p-2 text-orange-500 dark:bg-orange-900/50">
                <Zap />
              </div>
              <p className="font-semibold">1k+ students are successful</p>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {settings.benefitsTitle.split(" ").map((word, i) => (
                word === 'Benefits' ? <span key={i} className="text-orange-500">Benefits </span> : `${word} `
            ))}
          </h2>
          <p className="text-muted-foreground">
            {settings.benefitsSubtitle}
          </p>
          <ul className="space-y-6">
            {benefits.map((benefit) => (
              <li key={benefit.title} className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

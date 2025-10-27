

'use client';

import { CheckCircle, Zap, TrendingUp, BookOpen } from 'lucide-react';
import Image from 'next/image';
import { useLandingPageContent, type IconElement } from '@/hooks/use-settings';

const icons: { [key: string]: React.ReactNode } = {
  TrendingUp: <TrendingUp className="h-6 w-6 text-green-500" />,
  Zap: <Zap className="h-6 w-6 text-blue-500" />,
  BookOpen: <BookOpen className="h-6 w-6 text-purple-500" />,
  CheckCircle: <CheckCircle className="h-6 w-6 text-green-500" />,
};


export function BenefitsSection() {
  const content = useLandingPageContent();
  const section = content.getSection('benefits');

  if (!section) return null;

  const benefits = [];
  for (let i = 1; ; i++) {
    const title = content.getElement(`benefit${i}Title`)?.text;
    if (!title) break;
    benefits.push({
      title,
      description: content.getElement(`benefit${i}Description`)?.text,
      icon: (content.getElement(`benefit${i}Icon`) as IconElement)?.icon || 'CheckCircle',
    });
  }

  const title = content.getElement('benefitsTitle');
  const subtitle = content.getElement('benefitsSubtitle');
  const image = content.getElement('benefitsImageUrl');
  
  return (
    <section className="container py-12 md:py-24">
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className="relative h-[500px] w-full">
          <Image
              src={(image as any)?.src || '/placeholder.svg'}
              alt={(image as any)?.alt || 'Benefits of learning'}
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
        <div className="space-y-8 text-center md:text-left" style={{ textAlign: title?.style?.textAlign || 'left' }}>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ textAlign: title?.style?.textAlign }}>
            {title?.text.split(" ").map((word, i) => (
                word === 'Benefits' ? <span key={i} className="text-orange-500">Benefits </span> : `${word} `
            ))}
          </h2>
          <p className="text-muted-foreground" style={{ textAlign: subtitle?.style?.textAlign }}>
            {subtitle?.text}
          </p>
          <ul className="space-y-6">
            {benefits.map((benefit, index) => benefit.title && (
              <li key={index} className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                  {icons[benefit.icon]}
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

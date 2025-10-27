'use client';

import { CheckCircle, Zap, TrendingUp, BookOpen } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const benefits = [
  {
    title: 'Accelerate Your Learning',
    description: 'Experience personalized instruction and achieve your academic goals faster.',
    icon: <TrendingUp className="h-6 w-6 text-green-500" />,
  },
  {
    title: 'Flexibility',
    description: 'Choose your own schedule and learn at a pace that suits you.',
    icon: <Zap className="h-6 w-6 text-blue-500" />,
  },
  {
    title: 'Practical Skills',
    description: 'Acquire practical skills that you can immediately apply in real-world situations.',
    icon: <BookOpen className="h-6 w-6 text-purple-500" />,
  },
];

export function BenefitsSection() {
  const image = PlaceHolderImages.find((img) => img.id === 'benefit-explore');
  return (
    <section className="container py-12 md:py-24">
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className="relative h-[500px] w-full">
          {image && (
            <Image
              src={image.imageUrl}
              alt="Benefits of learning"
              className="rounded-2xl object-cover"
              fill
              data-ai-hint={image.imageHint}
            />
          )}
          <div className="absolute -bottom-4 -left-4 w-fit rounded-lg bg-white p-4 shadow-lg dark:bg-card">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-orange-100 p-2 text-primary dark:bg-orange-900/50">
                <Zap />
              </div>
              <p className="font-semibold">1k+ students are successful</p>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Explore the <span className="text-primary">Benefits</span>
          </h2>
          <p className="text-muted-foreground">
            Our team of certified teachers are dedicated to help students achieve their goals and
            personal growth.
          </p>
          <ul className="space-y-6">
            {benefits.map((benefit) => (
              <li key={benefit.title} className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
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

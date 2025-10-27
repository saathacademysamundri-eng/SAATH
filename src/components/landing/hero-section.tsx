
'use client';

import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSettings } from '@/hooks/use-settings';

const TutorCard = ({
  name,
  experience,
  imageUrl,
}: {
  name: string;
  experience: string;
  imageUrl: string;
}) => {
  return (
    <div
      className="relative rounded-2xl p-4 text-white shadow-lg bg-yellow-400"
    >
      <div className="relative h-64">
        <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-contain object-bottom"
            data-ai-hint="person portrait"
          />
      </div>
      <div className="mt-4">
        <h3 className="font-bold">{name}</h3>
        <p className="text-sm">{experience}</p>
      </div>
    </div>
  );
};

export function HeroSection() {
  const { settings } = useSettings();

  return (
    <section className="container py-12 md:py-24">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div className="space-y-6 text-center lg:text-left">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            {settings.heroMainTitle.split(' ').map((word, i) => 
                word.toLowerCase() === 'tutor' ? <span key={i} className="text-orange-500">Tutor </span> : `${word} `
            )}
          </h1>
          <p className="text-lg text-muted-foreground">
            {settings.heroMainSubtitle}
          </p>
          <div className="flex items-center gap-4 justify-center lg:justify-start">
            <Button size="lg" asChild>
              <Link href="#">{settings.heroMainButton1Text}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#" className="flex items-center gap-2">
                <PlayCircle className="h-6 w-6" />
                {settings.heroMainButton2Text}
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TutorCard
            name={settings.heroTutor1Name}
            experience={settings.heroTutor1Experience}
            imageUrl={settings.heroTutor1ImageUrl}
          />
          <TutorCard
            name={settings.heroTutor2Name}
            experience={settings.heroTutor2Experience}
            imageUrl={settings.heroTutor2ImageUrl}
          />
        </div>
      </div>
    </section>
  );
}

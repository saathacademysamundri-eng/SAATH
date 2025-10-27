
'use client';

import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLandingPageContent } from '@/hooks/use-settings';

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
  const content = useLandingPageContent();
  const section = content.getSection('hero');

  if (!section) return null;

  const mainTitle = content.getElement('heroMainTitle');
  const mainSubtitle = content.getElement('heroMainSubtitle');
  const button1 = content.getElement('heroMainButton1Text');
  const button2 = content.getElement('heroMainButton2Text');

  const tutor1Name = content.getElement('heroTutor1Name')?.text || '';
  const tutor1Experience = content.getElement('heroTutor1Experience')?.text || '';
  const tutor1ImageUrl = content.getElement('heroTutor1ImageUrl')?.src || '/placeholder.svg';

  const tutor2Name = content.getElement('heroTutor2Name')?.text || '';
  const tutor2Experience = content.getElement('heroTutor2Experience')?.text || '';
  const tutor2ImageUrl = content.getElement('heroTutor2ImageUrl')?.src || '/placeholder.svg';

  return (
    <section className="container py-12 md:py-24">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div className="space-y-6 text-center lg:text-left" style={{ textAlign: mainTitle?.style?.textAlign || 'left' }}>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl" style={{ textAlign: mainTitle?.style?.textAlign }}>
            {mainTitle?.text.split(' ').map((word, i) => 
                word.toLowerCase() === 'tutor' ? <span key={i} className="text-orange-500">Tutor </span> : `${word} `
            )}
          </h1>
          <p className="text-lg text-muted-foreground" style={{ textAlign: mainSubtitle?.style?.textAlign }}>
            {mainSubtitle?.text}
          </p>
          <div className="flex items-center gap-4 justify-center lg:justify-start">
            <Button size="lg" asChild>
              <Link href="#">{button1?.text}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#" className="flex items-center gap-2">
                <PlayCircle className="h-6 w-6" />
                {button2?.text}
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TutorCard
            name={tutor1Name}
            experience={tutor1Experience}
            imageUrl={tutor1ImageUrl}
          />
          <TutorCard
            name={tutor2Name}
            experience={tutor2Experience}
            imageUrl={tutor2ImageUrl}
          />
        </div>
      </div>
    </section>
  );
}

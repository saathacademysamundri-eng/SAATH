'use client';

import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PlayCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const TutorCard = ({
  name,
  experience,
  color,
  imageId,
}: {
  name: string;
  experience: string;
  color: string;
  imageId: string;
}) => {
  const image = PlaceHolderImages.find((img) => img.id === imageId);
  return (
    <div
      className={`relative rounded-2xl p-4 text-white shadow-lg`}
      style={{ backgroundColor: color }}
    >
      <div className="relative h-64">
        {image && (
          <Image
            src={image.imageUrl}
            alt={name}
            fill
            className="object-contain object-bottom"
            data-ai-hint={image.imageHint}
          />
        )}
      </div>
      <div className="mt-4">
        <h3 className="font-bold">{name}</h3>
        <p className="text-sm">{experience}</p>
      </div>
    </div>
  );
};

export function HeroSection() {
  return (
    <section className="container py-12 md:py-24">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Achieve Your Goals with the <span className="text-primary">Right Tutor</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Our certified tutors provide the best, experienced and certified tutors across a series
            of strings.
          </p>
          <div className="flex items-center gap-4">
            <Button size="lg" asChild>
              <Link href="#">Get Started</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#" className="flex items-center gap-2">
                <PlayCircle className="h-6 w-6" />
                Free Trial Class
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TutorCard
            name="Anika Sarkar"
            experience="10+ Years Experience"
            color="#FFD700"
            imageId="tutor-female"
          />
          <TutorCard
            name="Abdullah Jiscal"
            experience="8+ Years Experience"
            color="#ADD8E6"
            imageId="tutor-male"
          />
        </div>
      </div>
    </section>
  );
}

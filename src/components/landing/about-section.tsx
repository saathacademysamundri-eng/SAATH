'use client';

import { useSettings } from '@/hooks/use-settings';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function AboutSection() {
  const { settings } = useSettings();
  const aboutImage = PlaceHolderImages.find((img) => img.id === 'about-section');

  return (
    <section id="about" className="container py-12 md:py-24">
      <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            About {settings.name || 'My Academy'}
          </h2>
          <p className="text-muted-foreground">
            Welcome to {settings.name || 'My Academy'}, where we are dedicated to fostering a
            supportive and challenging learning environment. Our mission is to empower students with
            the knowledge, skills, and confidence to achieve their academic and personal goals.
            With a team of experienced educators and a commitment to excellence, we provide a
            comprehensive curriculum designed to inspire a lifelong love for learning.
          </p>
          <Button asChild>
            <Link href="#">Learn More</Link>
          </Button>
        </div>
        {aboutImage && (
          <div className="relative h-80 w-full overflow-hidden rounded-lg">
            <Image
              src={aboutImage.imageUrl}
              alt="About the Academy"
              data-ai-hint={aboutImage.imageHint}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
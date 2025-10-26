'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { Button } from '../ui/button';
import Link from 'next/link';

const slides = [
  {
    image: 'slide-1',
    title: 'Unlock Your Potential',
    subtitle: 'Join our community of learners and achieve academic excellence.',
    buttonText: 'Enroll Now',
    buttonLink: '#',
  },
  {
    image: 'slide-2',
    title: 'Expert Teachers, Bright Futures',
    subtitle: 'Learn from the best to become your best.',
    buttonText: 'Meet Our Team',
    buttonLink: '#',
  },
  {
    image: 'slide-3',
    title: 'State-of-the-Art Facilities',
    subtitle: 'A modern learning environment designed for success.',
    buttonText: 'Explore Campus',
    buttonLink: '#',
  },
];

export function HeroSlider() {
  return (
    <section className="w-full">
      <Carousel
        className="w-full"
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
        opts={{ loop: true }}
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[60vh] min-h-[400px] w-full">
                <Image
                  src={`https://picsum.photos/seed/${slide.image}/1920/1080`}
                  alt={slide.title}
                  data-ai-hint="classroom students"
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                  <div className="container">
                    <h1 className="text-4xl font-bold tracking-tight text-balance md:text-6xl lg:text-7xl">
                      {slide.title}
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-balance text-white/90">
                      {slide.subtitle}
                    </p>
                    {slide.buttonText && slide.buttonLink && (
                      <Button asChild size="lg" className="mt-8">
                        <Link href={slide.buttonLink}>{slide.buttonText}</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white" />
      </Carousel>
    </section>
  );
}
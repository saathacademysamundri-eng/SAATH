
'use client';
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
import { useSettings } from '@/hooks/use-settings';

export function HeroSlider() {
  const { settings } = useSettings();
  
  const slides = [
      {
          id: 1,
          image: settings.heroImageUrl1,
          imageHint: 'education students',
          title: settings.heroTitle1,
          subtitle: settings.heroSubtitle1,
          buttonText: settings.heroButtonText1,
          buttonLink: settings.heroButtonLink1
      },
       {
          id: 2,
          image: settings.heroImageUrl2,
          imageHint: 'modern classroom',
          title: settings.heroTitle2,
          subtitle: settings.heroSubtitle2,
          buttonText: settings.heroButtonText2,
          buttonLink: settings.heroButtonLink2
      }
  ]

  return (
    <section>
      <Carousel
        opts={{ loop: true }}
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="relative h-[600px] w-full">
                <Image
                  src={slide.image}
                  alt={`Slide ${slide.id}`}
                  fill
                  className="object-cover"
                  data-ai-hint={slide.imageHint}
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex items-center justify-center text-center text-white">
                  <div className="container max-w-4xl space-y-6">
                    <h1 className="text-4xl font-bold md:text-6xl">{slide.title}</h1>
                    <p className="text-lg md:text-xl">{slide.subtitle}</p>
                    <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                      <Link href={slide.buttonLink || '#'}>{slide.buttonText}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
      </Carousel>
    </section>
  );
}

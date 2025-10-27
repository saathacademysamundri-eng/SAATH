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

const heroSlides = [
  {
    id: 1,
    image: 'https://picsum.photos/seed/1/1920/1080',
    imageHint: 'education students',
  },
  {
    id: 2,
    image: 'https://picsum.photos/seed/2/1920/1080',
    imageHint: 'modern classroom',
  },
];

export function HeroSlider() {
  const { settings, isSettingsLoading } = useSettings();
  
  const slides = [
      {
          id: 1,
          image: heroSlides[0].image,
          imageHint: heroSlides[0].imageHint,
          title: settings.heroTitle1 || "Get The Best Education",
          subtitle: settings.heroSubtitle1 || "We have a team of professionals who are always ready to help you.",
          buttonText: settings.heroButtonText1 || "Get Started",
          buttonLink: "#"
      },
       {
          id: 2,
          image: heroSlides[1].image,
          imageHint: heroSlides[1].imageHint,
          title: settings.heroTitle2 || "Boost Your Skills With Us",
          subtitle: settings.heroSubtitle2 || "Our certified tutors provide the best, experienced and certified tutors across a series of strings.",
          buttonText: settings.heroButtonText2 || "Our Courses",
          buttonLink: "#"
      }
  ]

  return (
    <section>
      <Carousel
        opts={{ loop: true }}
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
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
                      <Link href={slide.buttonLink}>{slide.buttonText}</Link>
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

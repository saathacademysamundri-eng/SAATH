'use client';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Card, CardContent } from '../ui/card';

const testimonials = [
  {
    name: 'Ali Khan',
    role: 'Parent',
    quote:
      "This academy has been a game-changer for my son's education. The teachers are fantastic and the management is incredibly organized.",
    avatar: 'user-1',
  },
  {
    name: 'Sana Javed',
    role: 'Student, 12th Grade',
    quote:
      'I love how easy it is to keep track of my classes and results. The teachers are always available for help. Best decision I ever made!',
    avatar: 'user-2',
  },
  {
    name: 'Mr. Qasim',
    role: 'Teacher',
    quote:
      'As a teacher, the platform simplifies my administrative tasks, allowing me to focus more on teaching and less on paperwork. It’s brilliant.',
    avatar: 'user-3',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="container py-12 md:py-24">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className="text-3xl font-bold leading-[1.1] md:text-5xl">What Our Community Says</h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Real stories from the people who make our academy great.
        </p>
      </div>
      <div className="mx-auto mt-12 grid grid-cols-1 gap-8 md:max-w-4xl md:grid-cols-3">
        {testimonials.map((testimonial) => {
          const image = PlaceHolderImages.find((img) => img.id === testimonial.avatar);
          return (
            <Card key={testimonial.name} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col items-center p-6 text-center">
                {image && (
                  <Image
                    src={image.imageUrl}
                    alt={testimonial.name}
                    data-ai-hint={image.imageHint}
                    width={80}
                    height={80}
                    className="mb-4 rounded-full"
                  />
                )}
                <blockquote className="flex-1 text-muted-foreground">
                  "{testimonial.quote}"
                </blockquote>
                <div className="mt-4">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
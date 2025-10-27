'use client';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Card, CardContent } from '../ui/card';

const testimonials = [
  {
    name: 'Ronald Richards',
    role: 'Business Owner',
    quote:
      'This learning platform has been a game-changer for my team. The courses are practical, and the instructors are top-notch. Highly recommended!',
    avatar: 'testimonial-avatar-1',
    color: 'bg-green-100',
  },
  {
    name: 'Robert Fox',
    role: 'UI/UX Designer',
    quote:
      "I've taken several courses here, and the quality is consistently excellent. The platform is user-friendly, and I've learned so much.",
    avatar: 'testimonial-avatar-2',
    color: 'bg-orange-100',
  },
];

export function Testimonials() {
  const image = PlaceHolderImages.find((img) => img.id === 'testimonial-student');
  return (
    <section id="testimonials" className="container py-12 md:py-24">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold leading-[1.1] md:text-4xl">
            What other Students are <span className="text-primary">Saying!</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Our team of certified teachers are dedicated to help students achieve their goals and
            personal growth.
          </p>
          <div className="mt-8 space-y-6">
            {testimonials.map((testimonial) => {
              const avatarImage = PlaceHolderImages.find((img) => img.id === testimonial.avatar);
              return (
                <Card key={testimonial.name} className={`${testimonial.color} dark:bg-muted/30`}>
                  <CardContent className="p-6">
                    <blockquote className="text-foreground">"{testimonial.quote}"</blockquote>
                    <div className="mt-4 flex items-center gap-4">
                      {avatarImage && (
                        <Image
                          src={avatarImage.imageUrl}
                          alt={testimonial.name}
                          data-ai-hint={avatarImage.imageHint}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        <div className="relative min-h-[400px]">
          {image && (
            <Image
              src={image.imageUrl}
              alt="Testimonial student"
              fill
              className="rounded-2xl object-cover"
              data-ai-hint={image.imageHint}
            />
          )}
        </div>
      </div>
    </section>
  );
}

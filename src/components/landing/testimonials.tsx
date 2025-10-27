
'use client';

import { useSettings } from '@/hooks/use-settings';
import Image from 'next/image';
import { Card, CardContent } from '../ui/card';

export function Testimonials() {
  const { settings } = useSettings();

  const testimonials = [
    {
      name: settings.testimonial1Name,
      role: settings.testimonial1Role,
      quote: settings.testimonial1Quote,
      avatar: settings.testimonial1AvatarUrl,
      color: 'bg-green-100',
    },
    {
      name: settings.testimonial2Name,
      role: settings.testimonial2Role,
      quote: settings.testimonial2Quote,
      avatar: settings.testimonial2AvatarUrl,
      color: 'bg-orange-100',
    },
  ];

  return (
    <section id="testimonials" className="container py-12 md:py-24">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold leading-[1.1] md:text-4xl">
             {settings.testimonialsTitle.split(' ').map((word, i) => 
                word.toLowerCase() === 'saying!' ? <span key={i} className="text-orange-500">Saying! </span> : `${word} `
            )}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {settings.testimonialsSubtitle}
          </p>
          <div className="mt-8 space-y-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className={`${testimonial.color} dark:bg-muted/30`}>
                <CardContent className="p-6">
                  <blockquote className="text-foreground">"{testimonial.quote}"</blockquote>
                  <div className="mt-4 flex items-center gap-4">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      data-ai-hint="person avatar"
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="relative min-h-[400px]">
          <Image
            src={settings.testimonialsImageUrl}
            alt="Testimonial student"
            fill
            className="rounded-2xl object-cover"
            data-ai-hint="smiling student"
          />
        </div>
      </div>
    </section>
  );
}

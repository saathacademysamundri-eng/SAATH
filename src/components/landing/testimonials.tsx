
'use client';

import { useLandingPageContent } from '@/hooks/use-settings';
import Image from 'next/image';
import { Card, CardContent } from '../ui/card';

export function Testimonials() {
  const content = useLandingPageContent();
  const section = content.getSection('testimonials');
  if (!section) return null;

  const testimonials = [
    {
      name: content.getElement('testimonial1Name')?.text,
      role: content.getElement('testimonial1Role')?.text,
      quote: content.getElement('testimonial1Quote')?.text,
      avatar: content.getElement('testimonial1AvatarUrl')?.src,
      color: 'bg-green-100',
    },
    {
      name: content.getElement('testimonial2Name')?.text,
      role: content.getElement('testimonial2Role')?.text,
      quote: content.getElement('testimonial2Quote')?.text,
      avatar: content.getElement('testimonial2AvatarUrl')?.src,
      color: 'bg-orange-100',
    },
  ];

  const title = content.getElement('testimonialsTitle');
  const subtitle = content.getElement('testimonialsSubtitle');
  const image = content.getElement('testimonialsImageUrl');

  return (
    <section id="testimonials" className="container py-12 md:py-24">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className='text-center md:text-left' style={{textAlign: title?.style?.textAlign || 'left'}}>
          <h2 className="text-3xl font-bold leading-[1.1] md:text-4xl" style={{textAlign: title?.style?.textAlign}}>
             {title?.text.split(' ').map((word, i) => 
                word.toLowerCase() === 'saying!' ? <span key={i} className="text-orange-500">Saying! </span> : `${word} `
            )}
          </h2>
          <p className="mt-4 text-muted-foreground" style={{textAlign: subtitle?.style?.textAlign}}>
            {subtitle?.text}
          </p>
          <div className="mt-8 space-y-6">
            {testimonials.map((testimonial) => testimonial.name && (
              <Card key={testimonial.name} className={`${testimonial.color} dark:bg-muted/30`}>
                <CardContent className="p-6">
                  <blockquote className="text-foreground">"{testimonial.quote}"</blockquote>
                  <div className="mt-4 flex items-center gap-4">
                    <Image
                      src={testimonial.avatar || '/placeholder.svg'}
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
            src={image?.src || '/placeholder.svg'}
            alt={image?.alt || 'Testimonial student'}
            fill
            className="rounded-2xl object-cover"
            data-ai-hint="smiling student"
          />
        </div>
      </div>
    </section>
  );
}

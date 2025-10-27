'use client';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Button } from '../ui/button';

export function CtaSection() {
  const image1 = PlaceHolderImages.find((img) => img.id === 'cta-image-1');
  const image2 = PlaceHolderImages.find((img) => img.id === 'cta-image-2');

  return (
    <section className="container py-12 md:py-24">
      <div className="rounded-2xl bg-blue-100 p-8 dark:bg-blue-900/20 md:p-12">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-200">
              Boost your skills with us! Enroll today and start learning confidently.
            </h2>
            <p className="text-blue-800 dark:text-blue-300">
              Our team of certified teachers are dedicated to help students achieve their goals and
              personal growth.
            </p>
            <Button size="lg">Get Started</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {image1 && (
              <Image
                src={image1.imageUrl}
                alt="CTA Image 1"
                width={300}
                height={400}
                className="rounded-2xl object-cover"
                data-ai-hint={image1.imageHint}
              />
            )}
            {image2 && (
              <Image
                src={image2.imageUrl}
                alt="CTA Image 2"
                width={300}
                height={400}
                className="mt-8 rounded-2xl object-cover"
                data-ai-hint={image2.imageHint}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

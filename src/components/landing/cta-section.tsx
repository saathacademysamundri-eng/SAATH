
'use client';

import Image from 'next/image';
import { Button } from '../ui/button';
import { useLandingPageContent } from '@/hooks/use-settings';

export function CtaSection() {
  const content = useLandingPageContent();
  const section = content.getSection('cta');

  if (!section) return null;

  const title = content.getElement('ctaTitle');
  const subtitle = content.getElement('ctaSubtitle');
  const button = content.getElement('ctaButtonText');
  const image1 = content.getElement('ctaImageUrl1');
  const image2 = content.getElement('ctaImageUrl2');

  return (
    <section className="container py-12 md:py-24">
      <div className="rounded-2xl bg-blue-100 p-8 dark:bg-blue-900/20 md:p-12">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="space-y-6 text-center md:text-left" style={{ textAlign: title?.style?.textAlign || 'left' }}>
            <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-200" style={{ textAlign: title?.style?.textAlign }}>
              {title?.text}
            </h2>
            <p className="text-blue-800 dark:text-blue-300" style={{ textAlign: subtitle?.style?.textAlign }}>
              {subtitle?.text}
            </p>
            <Button size="lg">{button?.text}</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src={image1?.src || '/placeholder.svg'}
              alt={image1?.alt || 'CTA Image 1'}
              width={300}
              height={400}
              className="rounded-2xl object-cover"
              data-ai-hint="online learning"
            />
            <Image
              src={image2?.src || '/placeholder.svg'}
              alt={image2?.alt || 'CTA Image 2'}
              width={300}
              height={400}
              className="mt-8 rounded-2xl object-cover"
              data-ai-hint="writing notes"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

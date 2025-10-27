
'use client';

import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useLandingPageContent } from '@/hooks/use-settings';

export function NewsletterSection() {
  const content = useLandingPageContent();
  const section = content.getSection('newsletter');
  if (!section) return null;

  const title = content.getElement('newsletterTitle');
  const subtitle = content.getElement('newsletterSubtitle');
  const button = content.getElement('newsletterButton');

  return (
    <section className="bg-yellow-300 py-12 md:py-24">
      <div className="container">
        <div className="text-center" style={{ textAlign: title?.style?.textAlign || 'center' }}>
          <h2 className="text-3xl font-bold" style={{ textAlign: title?.style?.textAlign }}>{title?.text}</h2>
          <p className="mt-2 text-gray-800" style={{ textAlign: subtitle?.style?.textAlign }}>
            {subtitle?.text}
          </p>
          <div className="mt-6 flex max-w-md mx-auto">
            <Input type="email" placeholder="Enter your email" className="rounded-r-none" />
            <Button type="submit" className="rounded-l-none">
              {button?.text || 'Subscribe'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}


'use client';

import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useSettings } from '@/hooks/use-settings';

export function NewsletterSection() {
  const { settings } = useSettings();
  return (
    <section className="bg-yellow-300 py-12 md:py-24">
      <div className="container">
        <div className="text-center">
          <h2 className="text-3xl font-bold">{settings.newsletterTitle}</h2>
          <p className="mt-2 text-gray-800">
            {settings.newsletterSubtitle}
          </p>
          <div className="mt-6 flex max-w-md mx-auto">
            <Input type="email" placeholder="Enter your email" className="rounded-r-none" />
            <Button type="submit" className="rounded-l-none">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

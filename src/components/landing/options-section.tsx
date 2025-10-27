
'use client';

import { useLandingPageContent } from '@/hooks/use-settings';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function OptionsSection() {
  const content = useLandingPageContent();
  const section = content.getSection('options');
  if (!section) return null;

  const courseOptions = [
    {
      id: 'group',
      title: content.getElement('option1Title')?.text,
      description: content.getElement('option1Description')?.text,
      price: content.getElement('option1Price')?.text,
      imageUrl: content.getElement('option1ImageUrl')?.src,
      color: 'bg-blue-100',
      borderColor: 'border-blue-300',
    },
    {
      id: 'online',
      title: content.getElement('option2Title')?.text,
      description: content.getElement('option2Description')?.text,
      price: content.getElement('option2Price')?.text,
      imageUrl: content.getElement('option2ImageUrl')?.src,
      color: 'bg-pink-100',
      borderColor: 'border-pink-300',
    },
    {
      id: 'workshop',
      title: content.getElement('option3Title')?.text,
      description: content.getElement('option3Description')?.text,
      price: content.getElement('option3Price')?.text,
      imageUrl: content.getElement('option3ImageUrl')?.src,
      color: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
    },
  ];

  const title = content.getElement('optionsTitle');
  const subtitle = content.getElement('optionsSubtitle');

  return (
    <section className="bg-orange-50 py-12 md:py-24 dark:bg-muted/20">
      <div className="container">
        <div className="mb-12 text-center" style={{ textAlign: title?.style?.textAlign || 'center' }}>
          <h2 className="text-3xl font-bold md:text-4xl">
             {title?.text.split(" ").map((word, i) => (
                word === 'Options' ? <span key={i} className="text-orange-500">Options </span> : `${word} `
            ))}
          </h2>
          <p className="mt-2 text-muted-foreground" style={{ textAlign: subtitle?.style?.textAlign }}>
            {subtitle?.text}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {courseOptions.map((option) => option.title && (
            <Card key={option.id} className={`overflow-hidden border-2 ${option.borderColor}`}>
              <div className="relative h-48 w-full">
                <Image
                  src={option.imageUrl || '/placeholder.svg'}
                  alt={option.title}
                  fill
                  className="object-cover"
                  data-ai-hint="course type"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-bold">{option.title}</h3>
                <p className="mb-4 text-muted-foreground">{option.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-orange-500">${Number(option.price).toFixed(2)}</p>
                  <Button variant="outline" asChild>
                    <Link href="#">View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

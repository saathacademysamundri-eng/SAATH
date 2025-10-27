
'use client';

import { useSettings } from '@/hooks/use-settings';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function OptionsSection() {
  const { settings } = useSettings();

  const courseOptions = [
    {
      id: 'group',
      title: settings.option1Title,
      description: settings.option1Description,
      price: settings.option1Price,
      imageUrl: settings.option1ImageUrl,
      color: 'bg-blue-100',
      borderColor: 'border-blue-300',
    },
    {
      id: 'online',
      title: settings.option2Title,
      description: settings.option2Description,
      price: settings.option2Price,
      imageUrl: settings.option2ImageUrl,
      color: 'bg-pink-100',
      borderColor: 'border-pink-300',
    },
    {
      id: 'workshop',
      title: settings.option3Title,
      description: settings.option3Description,
      price: settings.option3Price,
      imageUrl: settings.option3ImageUrl,
      color: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
    },
  ];

  return (
    <section className="bg-orange-50 py-12 md:py-24 dark:bg-muted/20">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
             {settings.optionsTitle.split(" ").map((word, i) => (
                word === 'Options' ? <span key={i} className="text-orange-500">Options </span> : `${word} `
            ))}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {settings.optionsSubtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {courseOptions.map((option) => (
            <Card key={option.id} className={`overflow-hidden border-2 ${option.borderColor}`}>
              <div className="relative h-48 w-full">
                <Image
                  src={option.imageUrl}
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

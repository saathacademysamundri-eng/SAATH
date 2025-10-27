'use client';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const courseOptions = [
  {
    id: 'group',
    title: 'Group Classes',
    description: 'Join a dynamic learning environment and interact with peers.',
    price: 25.0,
    imageId: 'group-classes',
    color: 'bg-blue-100',
    borderColor: 'border-blue-300',
  },
  {
    id: 'online',
    title: 'Online Classes',
    description: 'Join a dynamic learning environment and interact with peers.',
    price: 50.0,
    imageId: 'online-classes',
    color: 'bg-pink-100',
    borderColor: 'border-pink-300',
  },
  {
    id: 'workshop',
    title: 'Workshop Classes',
    description: 'Join a dynamic learning environment and interact with peers.',
    price: 80.0,
    imageId: 'workshop-classes',
    color: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
  },
];

export function OptionsSection() {
  return (
    <section className="bg-orange-50 py-12 md:py-24 dark:bg-muted/20">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Explore the <span className="text-orange-500">Options</span>
          </h2>
          <p className="mt-2 text-muted-foreground">
            Our team of certified teachers are dedicated to help students achieve their goals and
            personal growth.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {courseOptions.map((option) => {
            const image = PlaceHolderImages.find((img) => img.id === option.imageId);
            return (
              <Card key={option.id} className={`overflow-hidden border-2 ${option.borderColor}`}>
                <div className="relative h-48 w-full">
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt={option.title}
                      fill
                      className="object-cover"
                      data-ai-hint={image.imageHint}
                    />
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="mb-2 text-xl font-bold">{option.title}</h3>
                  <p className="mb-4 text-muted-foreground">{option.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-orange-500">${option.price.toFixed(2)}</p>
                    <Button variant="outline" asChild>
                      <Link href="#">View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

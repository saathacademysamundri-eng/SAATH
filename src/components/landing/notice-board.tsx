'use client';

import { ArrowRight, Rss } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Card, CardContent } from '../ui/card';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const notices = [
  {
    date: 'July 28, 2024',
    title: 'Annual Sports Gala Announcement',
    description: 'All classes will be suspended for the annual sports gala...',
    link: '#',
  },
  {
    date: 'July 25, 2024',
    title: 'Final Term Examination Schedule',
    description: 'The final term exams will commence from August 15th...',
    link: '#',
  },
  {
    date: 'July 20, 2024',
    title: 'Parent-Teacher Meetings',
    description: 'The bi-annual parent-teacher meetings are scheduled...',
    link: '#',
  },
];

export function NoticeBoard() {
  const motivationalImage = PlaceHolderImages.find((img) => img.id === 'motivational-quote');

  return (
    <section id="notice-board" className="bg-muted py-12 md:py-24">
      <div className="container grid gap-12 md:grid-cols-2">
        <div>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-3xl font-bold">
              <Rss className="text-primary" /> Notice Board
            </h2>
            <Button variant="ghost" asChild>
              <Link href="#">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-6">
            {notices.map((notice, index) => (
              <Card key={index} className="transition-transform hover:scale-105">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{notice.date}</p>
                  <h3 className="font-semibold">{notice.title}</h3>
                  <p className="text-sm text-muted-foreground">{notice.description}</p>
                  <Button variant="link" asChild className="p-0 h-auto mt-2">
                    <Link href={notice.link}>Read More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-lg">
          {motivationalImage && (
            <Image
              src={motivationalImage.imageUrl}
              alt="Motivational quote background"
              data-ai-hint={motivationalImage.imageHint}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 p-8 text-center text-white">
            <blockquote className="text-2xl font-semibold italic">
              "The beautiful thing about learning is that no one can take it away from you."
            </blockquote>
            <cite className="mt-4 block text-right not-italic">- B.B. King</cite>
            <Button size="lg" className="mt-8">
              Join Us Today
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
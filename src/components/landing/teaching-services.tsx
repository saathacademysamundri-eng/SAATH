'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Award, Users, Heart } from 'lucide-react';

const services = [
  {
    title: '12 years of experience',
    description:
      'We have a huge experience in this field, we have a bunch of satisfied users. Our strategies for education are proven to be working.',
    icon: <Award className="h-8 w-8" />,
    color: 'bg-pink-100 text-pink-600',
  },
  {
    title: 'Team of professionals',
    description:
      'We have a team of professionals who are always ready to help you. Our team is a bunch of certified teachers.',
    icon: <Users className="h-8 w-8" />,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Dedicated Work',
    description:
      'We are dedicated to our work. We provide quality education. Our students are our first priority. We provide quality education.',
    icon: <Heart className="h-8 w-8" />,
    color: 'bg-yellow-100 text-yellow-600',
  },
];

export function TeachingServices() {
  return (
    <section className="bg-orange-50 py-12 md:py-24 dark:bg-muted/20">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Our Teaching Services</h2>
          <p className="mt-2 text-muted-foreground">
            Our team of certified teachers are dedicated to help students achieve their goals.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {services.map((service) => (
            <Card key={service.title} className="text-center shadow-lg">
              <CardContent className="p-8">
                <div
                  className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${service.color}`}
                >
                  {service.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

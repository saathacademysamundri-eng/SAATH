
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Award, Users, Heart } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

export function TeachingServices() {
  const { settings } = useSettings();

  const services = [
    {
      title: settings.service1Title,
      description: settings.service1Description,
      icon: <Award className="h-8 w-8" />,
      color: 'bg-pink-100 text-pink-600',
    },
    {
      title: settings.service2Title,
      description: settings.service2Description,
      icon: <Users className="h-8 w-8" />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: settings.service3Title,
      description: settings.service3Description,
      icon: <Heart className="h-8 w-8" />,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];


  return (
    <section className="bg-orange-50 py-12 md:py-24 dark:bg-muted/20">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">{settings.servicesTitle}</h2>
          <p className="mt-2 text-muted-foreground">
            {settings.servicesSubtitle}
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
                <h3 className="mb-2 mt-2 text-xl font-bold">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

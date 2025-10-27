
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Award, Users, Heart } from 'lucide-react';
import { useLandingPageContent } from '@/hooks/use-settings';

export function TeachingServices() {
  const content = useLandingPageContent();
  const section = content.getSection('services');
  if (!section) return null;

  const services = [
    {
      title: content.getElement('service1Title')?.text,
      description: content.getElement('service1Description')?.text,
      icon: <Award className="h-8 w-8" />,
      color: 'bg-pink-100 text-pink-600',
    },
    {
      title: content.getElement('service2Title')?.text,
      description: content.getElement('service2Description')?.text,
      icon: <Users className="h-8 w-8" />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: content.getElement('service3Title')?.text,
      description: content.getElement('service3Description')?.text,
      icon: <Heart className="h-8 w-8" />,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];
  
  const title = content.getElement('servicesTitle');
  const subtitle = content.getElement('servicesSubtitle');

  return (
    <section className="bg-orange-50 py-12 md:py-24 dark:bg-muted/20">
      <div className="container">
        <div className="mb-12 text-center" style={{textAlign: title?.style?.textAlign || 'center'}}>
          <h2 className="text-3xl font-bold md:text-4xl">{title?.text}</h2>
          <p className="mt-2 text-muted-foreground" style={{textAlign: subtitle?.style?.textAlign}}>
            {subtitle?.text}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {services.map((service) => service.title && (
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

'use client';
import { BookUser, GraduationCap, Users } from 'lucide-react';
import { Card } from '../ui/card';

const stats = [
  { icon: Users, value: '1,200+', label: 'Happy Students' },
  { icon: BookUser, value: '50+', label: 'Qualified Teachers' },
  { icon: GraduationCap, value: '98%', label: 'Success Rate' },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="container space-y-6 rounded-lg bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
    >
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className="text-3xl font-bold leading-[1.1] md:text-5xl">Why Choose Us?</h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Our platform is built to handle everything from student admission to financial
          reporting, so you can focus on what matters most: education.
        </p>
      </div>
      <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="flex flex-col items-center justify-center p-8 text-center">
              <Icon className="mb-4 h-16 w-16 text-primary" />
              <p className="text-4xl font-bold">{stat.value}</p>
              <p className="text-lg text-muted-foreground">{stat.label}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
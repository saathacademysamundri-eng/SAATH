import { GraduationCap } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 font-headline text-2xl font-bold text-primary">
      <GraduationCap className="h-8 w-8" />
      <span className="font-bold tracking-tighter">AcademiaLite</span>
    </div>
  );
}

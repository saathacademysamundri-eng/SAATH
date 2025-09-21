import { GraduationCap } from 'lucide-react';

export function Logo({ noText = false }: { noText?: boolean }) {
  return (
    <div className="flex items-center gap-2 font-headline text-2xl font-bold text-primary">
      <img src="/logo.png" alt="logo" className="h-10 w-10 object-contain" />
      {!noText && <span className="font-bold tracking-tighter">The Spirit School</span>}
    </div>
  );
}

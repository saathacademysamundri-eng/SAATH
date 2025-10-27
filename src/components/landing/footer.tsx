
'use client';

import { useSettings } from '@/hooks/use-settings';
import { Facebook, Instagram, Youtube, Twitter, Send } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '../logo';

const companyLinks = ['About', 'Services', 'News', 'Career', 'Team', 'Expert Teachers'];
const utilityLinks = ['Style Guide', 'Get a Quote', 'Privacy Policy', 'Licenses', 'Changelog', 'Emergency'];


export function Footer() {
  const { settings } = useSettings();
  const year = new Date().getFullYear();
  const academyName = settings.name || 'My Academy';
  
  const socialLinks = [
    { icon: Facebook, href: settings.socialFacebook || '#' },
    { icon: Instagram, href: settings.socialInstagram || '#' },
    { icon: Youtube, href: settings.socialYoutube || '#' },
    { icon: Twitter, href: settings.socialTwitter || '#' },
  ];
  
  const subjectLinks = ['Web Design', 'UX/UI Design', 'Branding Identity', 'Simple Design', 'Strategy', 'Digital Marketing'];

  return (
    <footer className="bg-background py-12">
      <div className="container grid grid-cols-1 gap-8 text-center md:grid-cols-5 md:text-left">
        <div className="space-y-4 col-span-2">
          <div className="flex justify-center md:justify-start">
            <div className="h-10 w-auto">
              <Logo />
            </div>
          </div>
          <p className="text-sm text-muted-foreground pr-8">
            Become a part of our community and let us help you grow. We are committed to providing the best education possible.
          </p>
           <div className="flex justify-center md:justify-start gap-4 pt-4">
            {socialLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link key={index} href={link.href} target="_blank" rel="noopener noreferrer" className="bg-orange-500/10 p-2 rounded-full text-orange-500 hover:bg-orange-500 hover:text-white transition-colors">
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>
        </div>
        
        <div>
          <h4 className="mb-4 font-semibold">Subject</h4>
          <ul className="space-y-2">
            {subjectLinks.map((link) => (
              <li key={link}>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-orange-500"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold">Company</h4>
          <ul className="space-y-2">
            {companyLinks.map((link) => (
              <li key={link}>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-orange-500"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold">Utility Page</h4>
          <ul className="space-y-2">
            {utilityLinks.map((link) => (
              <li key={link}>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-orange-500"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>
      <div className="container mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
        <p>
          Copyright {year} | Designed by <a href="#" className="text-orange-500 hover:underline">Mian Mudassar</a> | Powered by <a href="#" className="text-orange-500 hover:underline">Firebase</a>
        </p>
      </div>
    </footer>
  );
}

'use client';

import { useSettings } from '@/hooks/use-settings';
import { Facebook, Instagram, Youtube, Twitter, Send } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '../logo';

const socialLinks = [
  { icon: Facebook, href: '#' },
  { icon: Instagram, href: '#' },
  { icon: Youtube, href: '#' },
  { icon: Twitter, href: '#' },
  { icon: Send, href: '#' }, // Using Send for WhatsApp/Telegram
];

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '#' },
  { label: 'Contact', href: '#' },
  { label: 'Results', href: '#' },
];

export function Footer() {
  const { settings } = useSettings();
  const year = new Date().getFullYear();
  const academyName = settings.name || 'My Academy';

  return (
    <footer className="bg-secondary/50 py-12">
      <div className="container grid grid-cols-1 gap-8 text-center md:grid-cols-4 md:text-left">
        <div className="space-y-4">
          <div className="flex justify-center md:justify-start">
            <div className="h-12 w-auto">
              <Logo />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{settings.address}</p>
        </div>
        <div className="md:col-span-2 md:mx-auto">
          <h4 className="mb-2 font-semibold">Quick Links</h4>
          <ul className="space-y-1">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-semibold">Connect With Us</h4>
          <div className="flex justify-center gap-4 md:justify-start">
            {socialLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link key={index} href={link.href} target="_blank" rel="noopener noreferrer">
                  <Icon className="h-6 w-6 text-muted-foreground transition-colors hover:text-primary" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <div className="container mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
        <p>
          © {year} {academyName}. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
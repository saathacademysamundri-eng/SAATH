
'use client';

import { useLandingPageContent } from '@/hooks/use-settings';
import { Facebook, Instagram, Youtube, Twitter, Send } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '../logo';

export function Footer() {
  const content = useLandingPageContent();
  const year = new Date().getFullYear();
  const academyName = content.getElement('name')?.text || 'My Academy';
  
  const socialLinks = [
    { icon: Facebook, href: content.getElement('footerSocialFacebook')?.text || '#' },
    { icon: Instagram, href: content.getElement('footerSocialInstagram')?.text || '#' },
    { icon: Youtube, href: content.getElement('footerSocialYoutube')?.text || '#' },
    { icon: Twitter, href: content.getElement('footerSocialTwitter')?.text || '#' },
  ];

  const footerLinkSections = [
      content.getSection('footerLinks1'),
      content.getSection('footerLinks2'),
      content.getSection('footerLinks3'),
  ];
  
  return (
    <footer className="bg-background py-12">
      <div className="container grid grid-cols-1 gap-8 md:grid-cols-5 text-center md:text-left">
        <div className="space-y-4 col-span-full md:col-span-1">
          <div className="flex justify-center md:justify-start">
            <div className="h-10 w-auto">
              <Logo />
            </div>
          </div>
          <p className="text-sm text-muted-foreground pr-0 md:pr-8">
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
        
        <div className='col-span-full md:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-8'>
          {footerLinkSections.map(section => {
              if (!section) return null;
              const title = content.getElement(`${section.id}Title`)?.text;
              const links = section.elements.filter(el => el.type === 'text' && el.id.includes('Link'));
              
              const groupedLinks: { text: string, url: string }[] = [];
              for (let i = 0; i < links.length; i += 2) {
                  const textEl = links.find(l => l.id === `${section.id}Link${i/2 + 1}Text`);
                  const urlEl = links.find(l => l.id === `${section.id}Link${i/2 + 1}Url`);
                  if (textEl && urlEl && 'text' in textEl && 'text' in urlEl) {
                      groupedLinks.push({ text: textEl.text, url: urlEl.text });
                  }
              }

              return (
                  <div key={section.id}>
                      <h4 className="mb-4 font-semibold">{title}</h4>
                      <ul className="space-y-2">
                          {groupedLinks.map((link, index) => (
                              <li key={index}>
                                  <Link
                                      href={link.url || '#'}
                                      className="text-sm text-muted-foreground hover:text-orange-500"
                                  >
                                      {link.text}
                                  </Link>
                              </li>
                          ))}
                      </ul>
                  </div>
              );
          })}
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

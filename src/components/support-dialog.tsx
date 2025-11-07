
'use client';

import {
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { useSettings } from '@/hooks/use-settings';
import { Button } from './ui/button';
import {
  Mail,
  Facebook,
  Instagram,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

export function SupportDialog() {
  const { settings } = useSettings();

  return (
    <DialogContent className="sm:max-w-lg bg-gray-900 text-white border-gray-800">
      <DialogHeader className="items-center text-center space-y-4">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-800 overflow-hidden border-2 border-gray-700">
          <img src="https://i.postimg.cc/25bFSj1P/Whats-App-Image-2025-11-07-at-2-10-20-PM.jpg" alt="Developer Logo" className="object-cover w-full h-full" />
        </div>
        <h2 className="text-3xl font-bold">Support</h2>
        <p className="text-sm text-gray-400">
          Contact Information for the SchoolUp Platform.
        </p>
      </DialogHeader>
      <div className="py-4 px-2 space-y-4 text-center text-gray-300 text-sm">
        <p>
          At Schoolup - A Unique Platform for Smart Schools, we believe that
          every question deserves a clear answer and every problem
          deserves a quick solution. Our support team is always here to
          guide you, whether it's about setting up your account, managing
          attendance, handling finances, or exploring advanced features like
          WhatsApp integration and live data management.
        </p>
        <p>
          We have designed Schoolup to be simple, reliable, and family-
          focused, ensuring that schools can run smarter and parents can
          stay more connected. If you ever face any issue, need detailed
          guidance, or want to unlock the full potential of our platform, our
          dedicated support team is just a message away.
        </p>
        <p>
          Your trust matters to us, and we are committed to keeping your
          school management experience smooth, efficient, and stress-free.
        </p>
      </div>
      <div className="flex justify-center">
        <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white text-base py-6 px-8 rounded-lg">
          <a href="mailto:mianmudassar137@gmail.com">
            <Mail className="mr-2" />
            Contact Support via Email
          </a>
        </Button>
      </div>
      <div className="border-t border-gray-800 mt-6 pt-4 flex justify-between items-center text-xs text-gray-500">
        <p>Schoolup – Because Smart Schools Deserve a Unique Platform.</p>
        <div className="flex items-center gap-4">
          <p>Developed by "Mian Mudassar"</p>
          <Link href="https://api.whatsapp.com/send?phone=923099969535" target="_blank" className="hover:text-white"><MessageSquare className="h-4 w-4" /></Link>
          <Link href="https://www.facebook.com/mianmudassar.in" target="_blank" className="hover:text-white"><Facebook className="h-4 w-4" /></Link>
          <Link href="https://www.instagram.com/mianmudassar_" target="_blank" className="hover:text-white"><Instagram className="h-4 w-4" /></Link>
          <a href="mailto:mianmudassar137@gmail.com" className="hover:text-white"><Mail className="h-4 w-4" /></a>
        </div>
      </div>
    </DialogContent>
  );
}

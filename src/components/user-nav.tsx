

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { LifeBuoy, LogOut, Settings, User, MessageCircleQuestion, Database } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from './logo';

export function UserNav() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
           <div className='h-9 w-9 bg-sidebar-primary text-sidebar-primary-foreground rounded-full flex items-center justify-center overflow-hidden shrink-0'>
              <Logo noText={true} />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col items-center gap-2 py-2">
             <div className='h-16 w-16 bg-muted rounded-full flex items-center justify-center overflow-hidden shrink-0'>
                <Logo noText={true} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium leading-none">Super Admin</p>
              <p className="text-xs leading-none text-muted-foreground">
                admin@example.com
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/profile">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/settings">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
           <Link href="/settings?tab=data">
            <DropdownMenuItem>
              <Database className="mr-2 h-4 w-4" />
              <span>Data Management</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <MessageCircleQuestion className="mr-2 h-4 w-4" />
          <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

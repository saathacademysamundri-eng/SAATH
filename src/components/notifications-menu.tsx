'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/use-notifications';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';

export function NotificationsMenu({ userId }: { userId: string | null }) {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications(userId);
    const router = useRouter();

    const handleItemClick = (notification: any) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0">{unreadCount}</Badge>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel className="flex justify-between items-center">
                    Notifications
                    {unreadCount > 0 && <Button variant="link" size="sm" className="p-0 h-auto" onClick={markAllAsRead}>Mark all as read</Button>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="p-2 space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : notifications.length > 0 ? (
                        notifications.map(notification => (
                            <DropdownMenuItem key={notification.id} onSelect={() => handleItemClick(notification)} className={cn("flex flex-col items-start gap-1 whitespace-normal cursor-pointer", !notification.read && "bg-accent/50")}>
                               <p className={cn("text-sm", !notification.read && "font-semibold")}>{notification.message}</p>
                               <p className="text-xs text-muted-foreground font-normal">
                                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                               </p>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <p className="p-4 text-center text-sm text-muted-foreground">No new notifications.</p>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

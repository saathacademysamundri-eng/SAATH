
'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/hooks/use-app-context';
import { Activity } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { History } from 'lucide-react';
import { useMemo } from 'react';


const activityTypeMap: { [key: string]: { variant: "default" | "secondary" | "destructive" | "outline", text: string } } = {
    'fee_payment': { variant: 'secondary', text: 'Fee Paid' },
    'new_admission': { variant: 'default', text: 'New Admission' },
    'exam_created': { variant: 'outline', text: 'Exam Created' },
};


export function RecentActivities() {
    const { activities, loading } = useAppContext();

    const sortedActivities = useMemo(() => {
        return [...activities].sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [activities]);

    const activitiesForScrolling = useMemo(() => {
        if (sortedActivities.length === 0) return [];
        // Ensure the list is long enough to scroll, duplicate if necessary for the animation
        return sortedActivities.length < 10 ? [...sortedActivities, ...sortedActivities] : sortedActivities;
    }, [sortedActivities]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History />
                    Recent Activities
                </CardTitle>
                <CardDescription>A live feed of recent actions.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="h-64 overflow-hidden relative">
                    {loading ? (
                        <div className="text-center text-muted-foreground">Loading activities...</div>
                    ) : sortedActivities.length > 0 ? (
                        <div className="absolute top-0 animate-scroll-up-slow">
                            <div className="space-y-4">
                                {activitiesForScrolling.map((activity, index) => (
                                    <div key={`${activity.id}-${index}`} className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm leading-tight">
                                                {activity.message}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                <Badge variant={activityTypeMap[activity.type]?.variant || 'default'}>
                                                    {activityTypeMap[activity.type]?.text || activity.type.replace(/_/g, ' ')}
                                                </Badge>
                                                <span>{formatDistanceToNow(activity.date, { addSuffix: true })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                             <div className="space-y-4 mt-4">
                                {activitiesForScrolling.map((activity, index) => (
                                    <div key={`${activity.id}-${index}-clone`} className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm leading-tight">
                                                {activity.message}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                <Badge variant={activityTypeMap[activity.type]?.variant || 'default'}>
                                                    {activityTypeMap[activity.type]?.text || activity.type.replace(/_/g, ' ')}
                                                </Badge>
                                                <span>{formatDistanceToNow(activity.date, { addSuffix: true })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            No recent activities.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

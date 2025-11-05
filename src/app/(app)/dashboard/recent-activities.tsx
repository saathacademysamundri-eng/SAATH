
'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { recentActivities } from '@/lib/data';
import { History } from 'lucide-react';


const activityTypeMap: { [key: string]: { variant: "default" | "secondary" | "destructive" | "outline", text: string } } = {
    'Paid': { variant: 'secondary', text: 'Fee Paid' },
    'Admission': { variant: 'default', text: 'New Admission' },
    'Partial': { variant: 'outline', text: 'Partial Fee' },
    'Exam': { variant: 'outline', text: 'Exam Created' },
};


export function RecentActivities() {

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
                    <div className="absolute top-0 animate-scroll-up-slow">
                        <div className="space-y-4">
                            {recentActivities.map((activity, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm leading-tight">
                                            {activity.status === 'Admission' ? activity.name : (
                                                <>
                                                    {activity.status === 'Exam' ? activity.name : (
                                                        <>
                                                            Payment of <span className="font-bold">{activity.amount}</span> received from <span className="font-bold">{activity.name}</span>.
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <Badge variant={activityTypeMap[activity.status]?.variant || 'default'}>
                                                {activityTypeMap[activity.status]?.text || activity.status}
                                            </Badge>
                                            <span>{activity.date}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4 mt-4">
                            {recentActivities.map((activity, index) => (
                                <div key={index + recentActivities.length} className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm leading-tight">
                                            {activity.status === 'Admission' ? activity.name : (
                                                <>
                                                    {activity.status === 'Exam' ? activity.name : (
                                                        <>
                                                            Payment of <span className="font-bold">{activity.amount}</span> received from <span className="font-bold">{activity.name}</span>.
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <Badge variant={activityTypeMap[activity.status]?.variant || 'default'}>
                                                {activityTypeMap[activity.status]?.text || activity.status}
                                            </Badge>
                                            <span>{activity.date}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

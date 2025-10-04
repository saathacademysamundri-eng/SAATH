
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/hooks/use-settings';
import { Teacher } from '@/lib/data';
import { getTeacher } from '@/lib/firebase/firestore';
import { Home, Mail, Phone, BookOpen } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function ProfileSkeleton() {
    return (
        <main className="min-h-screen bg-muted/40 p-4 sm:p-6 md:p-8">
            <div className="mx-auto max-w-2xl">
                <Card className="mb-6">
                    <CardContent className="p-6 text-center">
                        <Skeleton className="h-12 w-3/4 mx-auto mb-2" />
                        <Skeleton className="h-5 w-full mx-auto mb-1" />
                        <Skeleton className="h-5 w-1/2 mx-auto" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4">
                        <Skeleton className="w-24 h-24 rounded-full" />
                        <div className='grid gap-2 w-full'>
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-5 w-1/3" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <div className="space-y-2 pt-2">
                            <Skeleton className="h-6 w-1/4" />
                            <div className="flex flex-wrap gap-2">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}


export default function TeacherPublicProfile() {
    const params = useParams();
    const teacherId = params.teacherId as string;
    
    const { settings, isSettingsLoading } = useSettings();
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (teacherId) {
            getTeacher(teacherId).then(data => {
                setTeacher(data);
                setLoading(false);
            });
        }
    }, [teacherId]);

    if (loading || isSettingsLoading) {
        return <ProfileSkeleton />;
    }

    if (!teacher) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p>Teacher not found.</p>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-muted/40 p-4 sm:p-6 md:p-8">
            <div className="mx-auto max-w-2xl">
                <header className="mb-6">
                    <Card>
                        <CardContent className="p-6 text-center">
                            {settings.logo && <img src={settings.logo} alt="Academy Logo" className="h-16 mx-auto mb-4 object-contain" />}
                            <h1 className="text-2xl font-bold text-primary">{settings.name}</h1>
                            <p className="text-muted-foreground">{settings.address}</p>
                            <p className="text-muted-foreground">Phone: {settings.phone}</p>
                        </CardContent>
                    </Card>
                </header>

                <Card>
                    <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4">
                        <Avatar className="h-24 w-24 border-2 border-primary">
                            <AvatarImage src={teacher.imageUrl} alt={teacher.name} />
                            <AvatarFallback className="text-3xl">{teacher.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className='grid gap-1'>
                            <CardTitle className="text-2xl">{teacher.name}</CardTitle>
                            <CardDescription>Father's Name: {teacher.fatherName}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-4 rounded-md border p-3">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            <span>{teacher.phone}</span>
                        </div>
                        {teacher.email && (
                            <div className="flex items-center gap-4 rounded-md border p-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <span>{teacher.email}</span>
                            </div>
                        )}
                        <div className="flex items-start gap-4 rounded-md border p-3">
                            <Home className="h-5 w-5 text-muted-foreground mt-1" />
                            <span>{teacher.address}</span>
                        </div>
                        <div className="space-y-2 pt-2">
                             <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Subjects
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {teacher.subjects.map(subject => (
                                    <Badge key={subject} variant="secondary">{subject}</Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}

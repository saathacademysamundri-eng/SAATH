

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/hooks/use-settings';
import { Student } from '@/lib/data';
import { getStudent } from '@/lib/firebase/firestore';
import { Home, Mail, Phone, User, LogIn } from 'lucide-react';
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
                    <CardHeader className="items-center text-center space-y-4">
                        <Skeleton className="w-28 h-28 rounded-full" />
                        <div className='grid gap-2 w-full'>
                            <Skeleton className="h-8 w-1/2 mx-auto" />
                            <Skeleton className="h-5 w-1/3 mx-auto" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}


export default function StudentPublicProfile() {
    const params = useParams();
    const studentId = params.studentId as string;
    
    const { settings, isSettingsLoading } = useSettings();
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (studentId) {
            getStudent(studentId).then(data => {
                setStudent(data);
                setLoading(false);
            });
        }
    }, [studentId]);

    const getFeeStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return 'text-green-500';
            case 'Pending': return 'text-orange-500';
            case 'Partial': return 'text-yellow-500';
            case 'Overdue': return 'text-red-500';
            default: return 'text-muted-foreground';
        }
    }

    if (loading || isSettingsLoading) {
        return <ProfileSkeleton />;
    }

    if (!student) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <Card className="p-8 text-center">
                    <CardTitle className="text-destructive">Student Not Found</CardTitle>
                    <CardDescription>Could not find a profile for the given ID.</CardDescription>
                </Card>
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
                    <CardHeader className="items-center text-center space-y-4">
                        <Avatar className="h-28 w-28 border-4 border-primary shadow-lg">
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${student.id}`} alt={student.name} />
                            <AvatarFallback className="text-4xl">{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className='grid gap-1'>
                            <CardTitle className="text-3xl font-bold">{student.name}</CardTitle>
                            <CardDescription>Roll #: {student.id} | Class: {student.class}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className='p-4 bg-secondary rounded-lg'>
                                <p className='text-sm text-muted-foreground'>Fee Status</p>
                                <p className={`text-2xl font-bold ${getFeeStatusColor(student.feeStatus)}`}>{student.feeStatus}</p>
                            </div>
                            <div className='p-4 bg-destructive/10 rounded-lg'>
                                <p className='text-sm text-destructive'>Outstanding Dues</p>
                                <p className='text-2xl font-bold text-destructive'>{student.totalFee.toLocaleString()} PKR</p>
                            </div>
                        </div>

                         <div className="flex items-center gap-4 rounded-md border p-4">
                            <Phone className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                            <div>
                                <p className="text-sm text-muted-foreground">Contact Number</p>
                                <p className="font-medium">{student.phone}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-4 rounded-md border p-4">
                            <Home className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" />
                             <div>
                                <p className="text-sm text-muted-foreground">Address</p>
                                <p className="font-medium">{student.address}</p>
                            </div>
                        </div>
                        
                    </CardContent>
                    <CardContent>
                        <Button className="w-full" variant="outline">
                            <LogIn className="mr-2 h-4 w-4" />
                            Student Portal Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}

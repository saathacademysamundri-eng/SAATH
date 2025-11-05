
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { saveTeacherAttendance } from '@/lib/firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/hooks/use-app-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

type AttendanceStatus = 'Present' | 'Absent' | 'Leave';

export function TakeTeacherAttendance() {
    const { teachers, loading } = useAppContext();
    const [attendance, setAttendance] = useState<{ [teacherId: string]: AttendanceStatus }>({});
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const initialAttendance: { [teacherId: string]: AttendanceStatus } = {};
        teachers.forEach(teacher => {
            initialAttendance[teacher.id] = 'Present';
        });
        setAttendance(initialAttendance);
    }, [teachers]);

    const handleAttendanceChange = (teacherId: string, status: AttendanceStatus) => {
        setAttendance(prev => ({
            ...prev,
            [teacherId]: status,
        }));
    };

    const handleSaveAttendance = async () => {
        setIsSaving(true);
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const result = await saveTeacherAttendance(date, attendance);

        if (result.success) {
            toast({ title: 'Attendance Saved', description: `Teacher attendance for ${format(new Date(), 'PPP')} has been saved.` });
        } else {
            toast({ variant: 'destructive', title: 'Save Failed', description: result.message });
        }
        setIsSaving(false);
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>
                                Mark Attendance for {format(new Date(), 'PPP')}
                            </CardTitle>
                            <CardDescription>Select the status for each teacher.</CardDescription>
                        </div>
                        <Button onClick={handleSaveAttendance} disabled={isSaving || teachers.length === 0}>
                            {isSaving && <Loader2 className="mr-2 animate-spin" />}
                            Save Attendance
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Teacher Name</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-6 w-48 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : teachers.length > 0 ? (
                                teachers.map((teacher) => (
                                    <TableRow key={teacher.id}>
                                        <TableCell className="font-medium">{teacher.name}</TableCell>
                                        <TableCell className="text-right">
                                            <RadioGroup
                                                value={attendance[teacher.id] || 'Present'}
                                                onValueChange={(value: AttendanceStatus) => handleAttendanceChange(teacher.id, value)}
                                                className="flex justify-end gap-4"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Present" id={`present-${teacher.id}`} />
                                                    <Label htmlFor={`present-${teacher.id}`} className="text-green-600">Present</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Absent" id={`absent-${teacher.id}`} />
                                                    <Label htmlFor={`absent-${teacher.id}`} className="text-red-600">Absent</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Leave" id={`leave-${teacher.id}`} />
                                                    <Label htmlFor={`leave-${teacher.id}`} className="text-yellow-600">Leave</Label>
                                                </div>
                                            </RadioGroup>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                        No teachers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

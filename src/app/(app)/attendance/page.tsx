
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { type Student } from '@/lib/data';
import { saveAttendance } from '@/lib/firebase/firestore';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useAppContext } from '@/hooks/use-app-context';

export default function AttendancePage() {
    const { classes, students, loading } = useAppContext();
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [attendance, setAttendance] = useState<{ [studentId: string]: 'Present' | 'Absent' }>({});
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleClassChange = (classId: string) => {
        setSelectedClassId(classId);
        setLoadingStudents(true);
        // Reset attendance when class changes
        setAttendance({});
        setTimeout(() => setLoadingStudents(false), 300); // Simulate loading
    };
    
    const classStudents = useMemo(() => {
        if (!selectedClassId) return [];
        const currentClassName = classes.find(c => c.id === selectedClassId)?.name;
        return students.filter(s => s.class === currentClassName);
    }, [selectedClassId, students, classes]);

    // Initialize attendance for students of the selected class
    useEffect(() => {
        const initialAttendance: { [studentId: string]: 'Present' | 'Absent' } = {};
        classStudents.forEach(student => {
            initialAttendance[student.id] = 'Present';
        });
        setAttendance(initialAttendance);
    }, [classStudents]);

    const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: isPresent ? 'Present' : 'Absent',
        }));
    };

    const handleSaveAttendance = async () => {
        if (!selectedClassId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a class.' });
            return;
        }

        setIsSaving(true);
        const attendanceData = {
            classId: selectedClassId,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            records: attendance,
        };

        const result = await saveAttendance(attendanceData);
        if (result.success) {
            toast({ title: 'Attendance Saved', description: `Attendance for ${classes.find(c => c.id === selectedClassId)?.name} has been saved.` });
        } else {
            toast({ variant: 'destructive', title: 'Save Failed', description: result.message });
        }
        setIsSaving(false);
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Daily Attendance</h1>
                <p className="text-muted-foreground">Mark student attendance for today.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Take Attendance</CardTitle>
                    <CardDescription>Select a class to view students and mark their attendance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="max-w-xs space-y-2">
                        <Label htmlFor="class-select">Select Class</Label>
                        <Select onValueChange={handleClassChange} disabled={loading}>
                            <SelectTrigger id="class-select">
                                <SelectValue placeholder="Select a class..." />
                            </SelectTrigger>
                            <SelectContent>
                                {loading ? (
                                    <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                                ) : (
                                    classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedClassId && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>
                                            Students of {classes.find(c => c.id === selectedClassId)?.name}
                                        </CardTitle>
                                        <CardDescription>Toggle the switch to mark a student as absent.</CardDescription>
                                    </div>
                                    <Button onClick={handleSaveAttendance} disabled={isSaving || classStudents.length === 0}>
                                        {isSaving && <Loader2 className="mr-2 animate-spin" />}
                                        Save Attendance
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Roll #</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead className="text-right">Status (Present/Absent)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingStudents || loading ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                                    <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : classStudents.length > 0 ? (
                                            classStudents.map((student) => (
                                                <TableRow key={student.id}>
                                                    <TableCell className="font-medium">{student.id}</TableCell>
                                                    <TableCell>{student.name}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Label htmlFor={`att-${student.id}`} className={attendance[student.id] === 'Present' ? 'text-green-600' : 'text-red-600'}>
                                                                {attendance[student.id]}
                                                            </Label>
                                                            <Switch
                                                                id={`att-${student.id}`}
                                                                checked={attendance[student.id] === 'Present'}
                                                                onCheckedChange={(checked) => handleAttendanceChange(student.id, checked)}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                                    No students found in this class.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

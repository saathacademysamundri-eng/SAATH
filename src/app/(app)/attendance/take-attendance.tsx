
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { saveAttendance } from '@/lib/firebase/firestore';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useAppContext } from '@/hooks/use-app-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

type AttendanceStatus = 'Present' | 'Absent' | 'Leave';

export function TakeAttendance() {
    const { classes, students, loading } = useAppContext();
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [attendance, setAttendance] = useState<{ [studentId: string]: AttendanceStatus }>({});
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleClassChange = (classId: string) => {
        setSelectedClassId(classId);
        setLoadingStudents(true);
        setAttendance({});
        setTimeout(() => setLoadingStudents(false), 300); 
    };
    
    const classStudents = useMemo(() => {
        if (!selectedClassId) return [];
        const currentClassName = classes.find(c => c.id === selectedClassId)?.name;
        return students.filter(s => s.class === currentClassName);
    }, [selectedClassId, students, classes]);

    useEffect(() => {
        const initialAttendance: { [studentId: string]: AttendanceStatus } = {};
        classStudents.forEach(student => {
            initialAttendance[student.id] = 'Present';
        });
        setAttendance(initialAttendance);
    }, [classStudents]);

    const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status,
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
            className: classes.find(c => c.id === selectedClassId)?.name || '',
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
        <div className="space-y-4">
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
                                <CardDescription>Select the status for each student.</CardDescription>
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
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingStudents || loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-6 w-48 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : classStudents.length > 0 ? (
                                    classStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.id}</TableCell>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell className="text-right">
                                                <RadioGroup
                                                    value={attendance[student.id] || 'Present'}
                                                    onValueChange={(value: AttendanceStatus) => handleAttendanceChange(student.id, value)}
                                                    className="flex justify-end gap-4"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="Present" id={`present-${student.id}`} />
                                                        <Label htmlFor={`present-${student.id}`} className="text-green-600">Present</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="Absent" id={`absent-${student.id}`} />
                                                        <Label htmlFor={`absent-${student.id}`} className="text-red-600">Absent</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="Leave" id={`leave-${student.id}`} />
                                                        <Label htmlFor={`leave-${student.id}`} className="text-yellow-600">Leave</Label>
                                                    </div>
                                                </RadioGroup>
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
        </div>
    );
}

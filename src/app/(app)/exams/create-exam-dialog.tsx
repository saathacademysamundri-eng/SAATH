"use client"

import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect, useMemo } from "react"
import { type Class, type Teacher, Exam } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createExam } from "@/lib/firebase/firestore"
import { Loader2, CalendarIcon } from "lucide-react"
import { useAppContext } from "@/hooks/use-app-context"
import { useSettings } from "@/hooks/use-settings"
import { useTeacherAuth } from "@/hooks/use-teacher-auth"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function CreateExamDialog({ onExamCreated }: { onExamCreated: (examId: string) => void }) {
    const { classes, teachers } = useAppContext();
    const { teacher } = useTeacherAuth();
    const { settings } = useSettings();
    const pathname = usePathname();
    const isTeacherPortal = pathname.startsWith('/teacher');

    const [name, setName] = useState('');
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [examType, setExamType] = useState<'Single Subject' | 'Full Test' | 'Manual'>('Single Subject');
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [manualSubjects, setManualSubjects] = useState('');
    const [totalMarks, setTotalMarks] = useState(100);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
    const [scope, setScope] = useState<Exam['scope']>('class');
    const [academicSession, setAcademicSession] = useState(settings.academicSession);
    const [submissionDeadline, setSubmissionDeadline] = useState<Date | undefined>();
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isTeacherPortal && teacher) {
            setSelectedTeacherId(teacher.id);
        }
    }, [teacher, isTeacherPortal]);

    useEffect(() => {
        if (settings.academicSession) {
            setAcademicSession(settings.academicSession);
        }
    }, [settings.academicSession]);
    
    const academicSessions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = new Set<string>();
        if (settings.academicSession) years.add(settings.academicSession);

        for (let i = -5; i < 10; i++) {
            const startYear = currentYear + i;
            const endYear = startYear + 1;
            years.add(`${startYear}-${endYear}`);
        }
        return Array.from(years).sort((a,b) => b.localeCompare(a));
    }, [settings.academicSession]);

    const handleClassChange = (value: string) => {
        setSelectedClassId(value);
        setSelectedSubject(null); 
        if (!isTeacherPortal) {
            setSelectedTeacherId(null);
        }
    }
    
    const availableTeachers = useMemo(() => {
        if (isTeacherPortal && teacher) return [teacher];
        if (!selectedClassId) return [];
        const currentClass = classes.find(c => c.id === selectedClassId);
        if (!currentClass) return [];
        
        const subjectsInClass = new Set(currentClass.subjects.map(s => s.name));
        
        return teachers.filter(teacher => 
            (teacher.subjects || []).some(subject => subjectsInClass.has(subject))
        );
    }, [selectedClassId, classes, teachers, teacher, isTeacherPortal]);
    
    const currentClass = classes.find(c => c.id === selectedClassId);
    
    const availableSubjects = useMemo(() => {
        if (!currentClass) return [];
        if (isTeacherPortal && teacher) {
            const teacherSubjectNames = new Set(teacher.subjects);
            return currentClass.subjects.filter(s => teacherSubjectNames.has(s.name));
        }
        return currentClass.subjects;
    }, [currentClass, teacher, isTeacherPortal]);


    const handleSubmit = async () => {
        const subjects: string[] = [];
        if (examType === 'Single Subject') {
            if (selectedSubject) subjects.push(selectedSubject);
        } else if (examType === 'Full Test') {
            subjects.push(...availableSubjects.map(s => s.name));
        } else if (examType === 'Manual') {
            subjects.push(...manualSubjects.split(',').map(s => s.trim()).filter(s => s));
        }

        const hasMissingInfo = !name || !selectedClassId || !selectedTeacherId || subjects.length === 0 || totalMarks <= 0 || !academicSession;

        if (hasMissingInfo) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please fill out all fields: name, class, teacher, subjects, marks, and academic session.',
            });
            return;
        }

        setIsSaving(true);
        const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
        
        const examData = {
            name,
            className: currentClass!.name,
            teacherId: selectedTeacherId!,
            teacherName: selectedTeacher!.name,
            examType,
            subjects,
            totalMarks,
            scope,
            results: [],
            academicSession: academicSession,
            // Ensure submissionDeadline is passed as undefined if no date is picked to prevent type mismatch
            submissionDeadline: submissionDeadline || undefined,
            status: (isTeacherPortal && teacher) ? 'pending' as const : 'approved' as const,
        };

        const result = await createExam(examData);

        if(result.success) {
            const successMessage = (isTeacherPortal && teacher) 
                ? `${name} has been submitted for approval.`
                : `${name} has been successfully created.`;
            toast({
                title: (isTeacherPortal && teacher) ? 'Exam Submitted' : 'Exam Created',
                description: successMessage,
            });
            onExamCreated(result.id!);
        } else {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: `Failed to create exam: ${result.message}`,
            });
        }
        setIsSaving(false);
    };

  return (
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New Exam</DialogTitle>
          <DialogDescription>
            Fill in the details to set up a new exam.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Exam Name</Label>
                    <Input id="name" placeholder="e.g., Mid-Term Test, Weekly Physics Quiz" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="session">Academic Session</Label>
                    <Select onValueChange={setAcademicSession} value={academicSession}>
                        <SelectTrigger id="session">
                            <SelectValue placeholder="Select a session" />
                        </SelectTrigger>
                        <SelectContent>
                            {academicSessions.map((session) => (
                                <SelectItem key={session} value={session}>{session}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="class">Class</Label>
                    <Select onValueChange={handleClassChange} value={selectedClassId || undefined}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="teacher">Assign Teacher</Label>
                    <Select onValueChange={setSelectedTeacherId} value={selectedTeacherId || undefined} disabled={!selectedClassId || (isTeacherPortal && !!teacher)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a teacher" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableTeachers.map((t) => (
                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedTeacherId && (
                <div className="grid gap-2">
                    <Label>Exam For</Label>
                    <RadioGroup value={scope} onValueChange={(v: any) => setScope(v)} className="flex items-center gap-4 pt-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="class" id="scope-class-create" />
                            <Label htmlFor="scope-class-create" className="font-normal">Entire Class</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="teacher_students" id="scope-teacher-create" />
                            <Label htmlFor="scope-teacher-create" className="font-normal">Teacher's Students Only</Label>
                        </div>
                    </RadioGroup>
                </div>
            )}
            
            <div className="grid gap-2">
                <Label>Exam Type</Label>
                <RadioGroup value={examType} onValueChange={(v: any) => setExamType(v)} className="flex items-center gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Single Subject" id="single" />
                        <Label htmlFor="single" className="font-normal">Single Subject</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Full Test" id="full" />
                        <Label htmlFor="full" className="font-normal">Full Test</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Manual" id="manual" />
                        <Label htmlFor="manual" className="font-normal">Manual</Label>
                    </div>
                </RadioGroup>
            </div>
            
            {examType === 'Single Subject' && currentClass && (
                 <div className="grid gap-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select onValueChange={setSelectedSubject} value={selectedSubject || undefined}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableSubjects.map((s) => (
                                <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            
            {examType === 'Manual' && (
                 <div className="grid gap-2">
                    <Label htmlFor="manual-subjects">Manual Subjects</Label>
                    <Input id="manual-subjects" value={manualSubjects} onChange={(e) => setManualSubjects(e.target.value)} placeholder="Enter subjects, separated by commas" />
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="totalMarks">Total Marks per Subject</Label>
                    <Input id="totalMarks" type="number" placeholder="e.g., 100" value={totalMarks} onChange={(e) => setTotalMarks(Number(e.target.value))} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="submission-deadline">Submission Deadline (Optional)</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !submissionDeadline && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {submissionDeadline ? format(submissionDeadline, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={submissionDeadline}
                                onSelect={setSubmissionDeadline}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

        </div>
        <DialogFooter>
            <DialogClose asChild>
                 <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSubmit} disabled={isSaving}>
                {isSaving && <Loader2 className="animate-spin mr-2"/>}
                {isSaving ? 'Submitting...' : (isTeacherPortal && teacher) ? 'Submit for Approval' : 'Create Exam'}
            </Button>
        </DialogFooter>
      </DialogContent>
  )
}

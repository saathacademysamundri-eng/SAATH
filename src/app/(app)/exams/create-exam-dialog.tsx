
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

    const handleClassChange = (value: string) => {
        setSelectedClassId(value);
        setSelectedSubject(null); 
        if (!isTeacherPortal) {
            setSelectedTeacherId(null);
        }
    }
    
    const academicSessions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = new Set<string>();
        if (settings.academicSession) years.add(settings.academicSession);
        for (let i = -5; i < 5; i++) {
            const startYear = currentYear + i;
            const endYear = startYear + 1;
            years.add(`${startYear}-${endYear}`);
        }
        return Array.from(years).sort((a,b) => b.localeCompare(a));
    }, [settings.academicSession]);

    const currentClass = classes.find(c => c.id === selectedClassId);
    
    const availableSubjects = useMemo(() => {
        if (!currentClass) return [];
        if (isTeacherPortal && teacher) {
            const teacherSubjectNames = new Set(teacher.subjects);
            return currentClass.subjects.filter(s => teacherSubjectNames.has(s.name));
        }
        return currentClass.subjects;
    }, [currentClass, teacher, isTeacherPortal]);

    const availableTeachers = useMemo(() => {
        if (isTeacherPortal && teacher) return [teacher];
        if (!selectedClassId) return [];
        const subjectsInClass = new Set(currentClass?.subjects.map(s => s.name));
        return teachers.filter(t => (t.subjects || []).some(sub => subjectsInClass.has(sub)));
    }, [selectedClassId, currentClass, teachers, teacher, isTeacherPortal]);

    const handleSubmit = async () => {
        const subjects: string[] = [];
        if (examType === 'Single Subject') {
            if (selectedSubject) subjects.push(selectedSubject);
        } else if (examType === 'Full Test') {
            subjects.push(...availableSubjects.map(s => s.name));
        } else if (examType === 'Manual') {
            subjects.push(...manualSubjects.split(',').map(s => s.trim()).filter(s => s));
        }

        if (!name || !selectedClassId || !selectedTeacherId || subjects.length === 0) {
            toast({ variant: 'destructive', title: 'ERROR', description: 'PLEASE FILL ALL REQUIRED FIELDS.' });
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
            submissionDeadline: submissionDeadline || undefined, // FIX: USE UNDEFINED INSTEAD OF NULL
            status: (isTeacherPortal && teacher) ? 'pending' as const : 'approved' as const,
        };

        const result = await createExam(examData);

        if(result.success) {
            toast({ title: 'EXAM CREATED', description: 'EXAM HAS BEEN SUCCESSFULLY ADDED.' });
            onExamCreated(result.id!);
        } else {
             toast({ variant: 'destructive', title: 'ERROR', description: result.message });
        }
        setIsSaving(false);
    };

  return (
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="uppercase font-black">CREATE NEW EXAM</DialogTitle>
          <DialogDescription className="uppercase text-xs">FILL IN THE DETAILS TO SET UP A NEW EXAM.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label className="uppercase text-[10px] font-bold">EXAM NAME</Label>
                    <Input placeholder="e.g., MID-TERM" value={name} onChange={(e) => setName(e.target.value)} className="font-bold" />
                </div>
                 <div className="grid gap-2">
                    <Label className="uppercase text-[10px] font-bold">SESSION</Label>
                    <Select onValueChange={setAcademicSession} value={academicSession}>
                        <SelectTrigger className="font-bold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {academicSessions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label className="uppercase text-[10px] font-bold">CLASS</Label>
                    <Select onValueChange={handleClassChange}>
                        <SelectTrigger className="font-bold">
                            <SelectValue placeholder="SELECT CLASS" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid gap-2">
                    <Label className="uppercase text-[10px] font-bold">ASSIGN TEACHER</Label>
                    <Select onValueChange={setSelectedTeacherId} value={selectedTeacherId || undefined} disabled={!selectedClassId}>
                        <SelectTrigger className="font-bold">
                            <SelectValue placeholder="SELECT TEACHER" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableTeachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-2">
                <Label className="uppercase text-[10px] font-bold">EXAM TYPE</Label>
                <RadioGroup value={examType} onValueChange={(v: any) => setExamType(v)} className="flex gap-4">
                    {['Single Subject', 'Full Test', 'Manual'].map(t => (
                        <div key={t} className="flex items-center space-x-2">
                            <RadioGroupItem value={t} id={t} />
                            <Label htmlFor={t} className="font-bold text-xs uppercase">{t}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label className="uppercase text-[10px] font-bold">TOTAL MARKS</Label>
                    <Input type="number" value={totalMarks} onChange={(e) => setTotalMarks(Number(e.target.value))} className="font-bold" />
                </div>
                <div className="grid gap-2">
                    <Label className="uppercase text-[10px] font-bold">SUBMISSION DEADLINE</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-bold", !submissionDeadline && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {submissionDeadline ? format(submissionDeadline, "PPP").toUpperCase() : <span>PICK A DATE</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={submissionDeadline} onSelect={setSubmissionDeadline} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
        <DialogFooter>
            <Button onClick={handleSubmit} disabled={isSaving} className="font-black uppercase w-full sm:w-auto">
                {isSaving && <Loader2 className="mr-2 animate-spin"/>}
                {isSaving ? 'CREATING...' : 'CREATE EXAM'}
            </Button>
        </DialogFooter>
      </DialogContent>
  )
}

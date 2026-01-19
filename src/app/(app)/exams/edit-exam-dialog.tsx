

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
import { type Class, Exam, Teacher } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { updateExam } from "@/lib/firebase/firestore"
import { Loader2 } from "lucide-react"
import { useAppContext } from "@/hooks/use-app-context"
import { useSettings } from "@/hooks/use-settings"

export function EditExamDialog({ exam, onExamUpdated }: { exam: Exam, onExamUpdated: () => void }) {
    const { classes, teachers } = useAppContext();
    const { settings } = useSettings();
    const [name, setName] = useState(exam.name);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(() => classes.find(c => c.name === exam.className)?.id || null);
    const [examType, setExamType] = useState<Exam['examType']>(exam.examType);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(exam.examType === 'Single Subject' ? exam.subjects[0] : null);
    const [manualSubjects, setManualSubjects] = useState(exam.examType === 'Manual' ? exam.subjects.join(', ') : '');
    const [totalMarks, setTotalMarks] = useState(exam.totalMarks || 100);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(exam.teacherId);
    const [academicSession, setAcademicSession] = useState(exam.academicSession || settings.academicSession);
    
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const academicSessions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = new Set<string>();
        if (settings.academicSession) years.add(settings.academicSession);
        if (exam.academicSession) years.add(exam.academicSession);

        for (let i = -5; i < 10; i++) {
            const startYear = currentYear + i;
            const endYear = startYear + 1;
            years.add(`${startYear}-${endYear}`);
        }
        return Array.from(years).sort((a,b) => b.localeCompare(a));
    }, [settings.academicSession, exam.academicSession]);

    const handleClassChange = (value: string) => {
        setSelectedClassId(value);
        setSelectedSubject(null);
        setSelectedTeacherId(null);
    }
    
    const availableTeachers = useMemo(() => {
        if (!selectedClassId) return [];
        const currentClass = classes.find(c => c.id === selectedClassId);
        if (!currentClass) return [];
        
        const subjectsInClass = new Set(currentClass.subjects.map(s => s.name));
        
        return teachers.filter(teacher => 
            (teacher.subjects || []).some(subject => subjectsInClass.has(subject))
        );
    }, [selectedClassId, classes, teachers]);


    const handleSubmit = async () => {
        const subjects: string[] = [];
        if (examType === 'Single Subject') {
            if (selectedSubject) subjects.push(selectedSubject);
        } else if (examType === 'Full Test') {
            const currentClass = classes.find(c => c.id === selectedClassId);
            if (currentClass) subjects.push(...currentClass.subjects.map(s => s.name));
        } else if (examType === 'Manual') {
            subjects.push(...manualSubjects.split(',').map(s => s.trim()).filter(s => s));
        }

        const hasMissingInfo = !name || !selectedClassId || !selectedTeacherId || subjects.length === 0 || totalMarks <= 0;

        if (hasMissingInfo) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please fill out all required fields.',
            });
            return;
        }

        setIsSaving(true);
        const currentClass = classes.find(c => c.id === selectedClassId);
        const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
        
        const examData: Partial<Exam> = {
            name,
            className: currentClass!.name,
            teacherId: selectedTeacherId!,
            teacherName: selectedTeacher!.name,
            examType,
            subjects,
            totalMarks,
            academicSession,
        };

        const result = await updateExam(exam.id, examData);

        if(result.success) {
            toast({
                title: 'Exam Updated',
                description: `${name} has been successfully updated.`,
            });
            onExamUpdated();
        } else {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: `Failed to update exam: ${result.message}`,
            });
        }
        setIsSaving(false);
    };

    const currentClass = classes.find(c => c.id === selectedClassId);

  return (
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Exam</DialogTitle>
          <DialogDescription>
            Update the details for this exam.
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
                    <Select onValueChange={setSelectedTeacherId} value={selectedTeacherId || undefined} disabled={!selectedClassId}>
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

            <div className="grid gap-2">
                <Label>Exam Type</Label>
                <RadioGroup value={examType} onValueChange={(v: any) => setExamType(v)} className="flex items-center gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Single Subject" id="single-edit" />
                        <Label htmlFor="single-edit" className="font-normal">Single Subject</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Full Test" id="full-edit" />
                        <Label htmlFor="full-edit" className="font-normal">Full Test</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Manual" id="manual-edit" />
                        <Label htmlFor="manual-edit" className="font-normal">Manual</Label>
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
                            {currentClass.subjects.map((s) => (
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

            <div className="grid gap-2">
                <Label htmlFor="totalMarks">Total Marks per Subject</Label>
                <Input id="totalMarks" type="number" placeholder="e.g., 100" value={totalMarks} onChange={(e) => setTotalMarks(Number(e.target.value))} />
            </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" onClick={handleSubmit} disabled={isSaving}>
                    {isSaving && <Loader2 className="animate-spin mr-2"/>}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
  )
}


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
import { useState, useEffect } from "react"
import { type Class } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createExam, getClasses } from "@/lib/firebase/firestore"
import { Loader2 } from "lucide-react"

export function CreateExamDialog({ onExamCreated }: { onExamCreated: (examId: string) => void }) {
    const [name, setName] = useState('');
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [examType, setExamType] = useState<'Single Subject' | 'Full Test'>('Single Subject');
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [totalMarks, setTotalMarks] = useState(100);

    const [classes, setClasses] = useState<Class[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchInitialData = async () => {
            const classesData = await getClasses();
            setClasses(classesData);
        };
        fetchInitialData();
    }, []);

    const handleClassChange = (value: string) => {
        setSelectedClassId(value);
        setSelectedSubject(null); // Reset subject when class changes
    }

    const handleSubmit = async () => {
        const hasMissingInfo = !name || !selectedClassId || (examType === 'Single Subject' && !selectedSubject) || totalMarks <= 0;

        if (hasMissingInfo) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please fill out all required fields, including total marks.',
            });
            return;
        }

        setIsSaving(true);
        const currentClass = classes.find(c => c.id === selectedClassId);
        
        const examData = {
            name,
            className: currentClass!.name,
            examType,
            subjects: examType === 'Single Subject' ? [selectedSubject!] : currentClass!.subjects.map(s => s.name),
            totalMarks,
            results: [],
        };

        const result = await createExam(examData);

        if(result.success) {
            toast({
                title: 'Exam Created',
                description: `${name} has been successfully created.`,
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

    const currentClass = classes.find(c => c.id === selectedClassId);

  return (
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New Exam</DialogTitle>
          <DialogDescription>
            Fill in the details to set up a new exam.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Exam Name</Label>
                <Input id="name" placeholder="e.g., Mid-Term Test, Weekly Physics Quiz" value={name} onChange={(e) => setName(e.target.value)} />
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
                    </RadioGroup>
                </div>
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
            
            <div className="grid gap-2">
                <Label htmlFor="totalMarks">Total Marks per Subject</Label>
                <Input id="totalMarks" type="number" placeholder="e.g., 100" value={totalMarks} onChange={(e) => setTotalMarks(Number(e.target.value))} />
            </div>

        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" onClick={handleSubmit} disabled={isSaving}>
                    {isSaving && <Loader2 className="animate-spin mr-2"/>}
                    {isSaving ? 'Creating...' : 'Create Exam'}
                </Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
  )
}

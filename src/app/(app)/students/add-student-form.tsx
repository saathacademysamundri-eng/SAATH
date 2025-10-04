

"use client"

import { Button } from "@/components/ui/button"
import {
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
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useMemo, useEffect } from "react"
import { type Student, type StudentSubject, type Subject, Class, Teacher } from "@/lib/data"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { addStudent, getNextStudentId } from "@/lib/firebase/firestore"
import { Loader2 } from "lucide-react"
import { useAppContext } from "@/hooks/use-app-context"

type SelectedSubjectInfo = {
    subject: Subject;
    teacherId: string | null;
}

export function AddStudentForm({ onStudentAdded }: { onStudentAdded: () => void }) {
    const { classes, teachers } = useAppContext();
    const [name, setName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [phone, setPhone] = useState('');
    const [college, setCollege] = useState('');
    const [address, setAddress] = useState('');
    const [gender, setGender] = useState('male');
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [monthlyFee, setMonthlyFee] = useState(0);
    const [selectedSubjects, setSelectedSubjects] = useState<SelectedSubjectInfo[]>([]);
    
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleClassChange = (value: string) => {
        setSelectedClassId(value);
        setSelectedSubjects([]);
    }

    const handleSubjectCheckedChange = (subject: Subject) => {
        const isSelected = selectedSubjects.some(s => s.subject.id === subject.id);
        if (isSelected) {
            setSelectedSubjects(prev => prev.filter(s => s.subject.id !== subject.id));
        } else {
            // Find a teacher who teaches this subject
            const defaultTeacher = teachers.find(t => (t.subjects || []).includes(subject.name));
            setSelectedSubjects(prev => [...prev, { subject, teacherId: defaultTeacher?.id || null }]);
        }
    }
    
    const handleTeacherChange = (subjectId: string, teacherId: string) => {
        setSelectedSubjects(prev => prev.map(s => 
            s.subject.id === subjectId ? { ...s, teacherId } : s
        ));
    }

    const feeShare = useMemo(() => {
        if (selectedSubjects.length === 0 || monthlyFee === 0) {
            return 0;
        }
        return monthlyFee / selectedSubjects.length;
    }, [monthlyFee, selectedSubjects.length]);

    const handleSubmit = async () => {
        const hasMissingInfo = !name || !fatherName || !phone || !college || !address || !selectedClassId || monthlyFee <= 0 || selectedSubjects.length === 0;
        const hasNullTeacher = selectedSubjects.some(s => s.teacherId === null);

        if (hasMissingInfo || hasNullTeacher) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please fill out all fields and assign a teacher to each subject.',
            });
            return;
        }

        setIsSaving(true);
        const newStudentId = await getNextStudentId();
        const currentClassDetails = classes.find(c => c.id === selectedClassId);

        const studentSubjects: StudentSubject[] = selectedSubjects.map(s => ({
            subject_name: s.subject.name,
            teacher_id: s.teacherId!,
            fee_share: feeShare,
        }));

        const newStudent: Omit<Student, 'id'> & { id: string } = {
            id: newStudentId,
            name,
            fatherName,
            phone,
            college,
            address,
            gender,
            class: currentClassDetails?.name || '',
            subjects: studentSubjects,
            feeStatus: 'Pending' as const,
            totalFee: monthlyFee, // Initial outstanding balance is the monthly fee
            monthlyFee: monthlyFee,
        };

        const result = await addStudent(newStudent);

        if(result.success) {
            onStudentAdded();
            toast({
                title: 'Student Added',
                description: `${name} has been successfully added.`,
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: `Failed to add student: ${result.message}`,
            });
        }
        setIsSaving(false);
    };

    const currentClass = classes.find(c => c.id === selectedClassId);

  return (
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new student.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter student's full name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="fatherName">Father's Name</Label>
                <Input id="fatherName" placeholder="Enter father's name" value={fatherName} onChange={(e) => setFatherName(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="college">School / College Name</Label>
                <Input id="college" placeholder="Enter school or college name" value={college} onChange={(e) => setCollege(e.target.value)} />
            </div>
             <div className="grid gap-2">
                <Label>Gender</Label>
                 <RadioGroup defaultValue="male" onValueChange={setGender} value={gender} className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="font-normal">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="font-normal">Female</Label>
                    </div>
                </RadioGroup>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Enter student's address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>
          
          <div className="border-t my-2"></div>

          {/* Academic Info */}
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
                <Label htmlFor="monthlyFee">Total Monthly Fee (PKR)</Label>
                <Input 
                    id="monthlyFee" 
                    type="number" 
                    placeholder="Enter total monthly fee" 
                    value={monthlyFee || ''}
                    onChange={(e) => setMonthlyFee(Number(e.target.value))}
                />
            </div>
          </div>
          
          {currentClass && (
            <div className="grid gap-4">
                <Label>Subjects &amp; Teachers</Label>
                <div className="grid gap-3 rounded-md border p-4">
                    {currentClass.subjects.map(subject => {
                        const selection = selectedSubjects.find(s => s.subject.id === subject.id);
                        const availableTeachers = teachers.filter(t => (t.subjects || []).includes(subject.name));
                        
                        return (
                            <div key={subject.id} className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3">
                                <Checkbox 
                                    id={`subject-${subject.id}`} 
                                    onCheckedChange={() => handleSubjectCheckedChange(subject)}
                                    checked={!!selection}
                                />
                                <Label htmlFor={`subject-${subject.id}`} className="font-normal">{subject.name}</Label>
                                
                                {selection && (
                                  <>
                                    <Select 
                                        onValueChange={(teacherId) => handleTeacherChange(subject.id, teacherId)} 
                                        value={selection.teacherId || undefined}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Teacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableTeachers.length > 0 ? (
                                                availableTeachers.map(teacher => (
                                                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                                                ))
                                            ) : (
                                                <div className="text-sm text-muted-foreground p-2">No teacher for this subject.</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <div className="text-sm text-muted-foreground text-right">
                                        {feeShare > 0 ? `${feeShare.toFixed(0)} PKR` : ''}
                                    </div>
                                  </>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
          )}
        </div>
        <DialogFooter>
            <Button type="button" onClick={handleSubmit} disabled={isSaving}>
                {isSaving && <Loader2 className="animate-spin mr-2"/>}
                {isSaving ? 'Adding Student...' : 'Add Student'}
            </Button>
        </DialogFooter>
      </DialogContent>
  )
}

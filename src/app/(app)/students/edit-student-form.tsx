

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
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useMemo } from "react"
import { type Student, type StudentSubject, type Subject } from "@/lib/data"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { updateStudent } from "@/lib/firebase/firestore"
import { Loader2 } from "lucide-react"
import { useAppContext } from "@/hooks/use-app-context"

type SelectedSubjectInfo = {
    subject: Subject;
    teacherId: string | null;
}

export function EditStudentForm({ student, onStudentUpdated }: { student: Student, onStudentUpdated: () => void }) {
    const { classes, teachers } = useAppContext();
    const [name, setName] = useState(student.name);
    const [fatherName, setFatherName] = useState(student.fatherName);
    const [phone, setPhone] = useState(student.phone);
    const [college, setCollege] = useState(student.college);
    const [address, setAddress] = useState(student.address);
    const [gender, setGender] = useState(student.gender);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(() => {
        return classes.find(c => c.name === student.class)?.id || null
    });
    const [monthlyFee, setMonthlyFee] = useState(student.monthlyFee);
    const [selectedSubjects, setSelectedSubjects] = useState<SelectedSubjectInfo[]>(() => {
         const currentClass = classes.find(c => c.name === student.class);
         if (!currentClass) return [];
         return student.subjects.map(ss => {
             const subjectDetails = currentClass.subjects.find(s => s.name === ss.subject_name);
             return { subject: subjectDetails!, teacherId: ss.teacher_id };
         }).filter(item => item.subject);
    });
    
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
        const currentClassDetails = classes.find(c => c.id === selectedClassId);

        const studentSubjects: StudentSubject[] = selectedSubjects.map(s => ({
            subject_name: s.subject.name,
            teacher_id: s.teacherId!,
            fee_share: feeShare,
        }));

        const updatedStudentData = {
            name,
            fatherName,
            phone,
            college,
            address,
            gender,
            class: currentClassDetails?.name || '',
            subjects: studentSubjects,
            monthlyFee: monthlyFee,
        };

        const result = await updateStudent(student.id, updatedStudentData);

        if(result.success) {
            onStudentUpdated();
            toast({
                title: 'Student Updated',
                description: `${name} has been successfully updated.`,
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: `Failed to update student: ${result.message}`,
            });
        }
        setIsSaving(false);
    };

    const currentClass = classes.find(c => c.id === selectedClassId);

  return (
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Student: {student.name}</DialogTitle>
          <DialogDescription>
            Update the student's details below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
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
                    <RadioGroup onValueChange={setGender} value={gender} className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="edit-male" />
                            <Label htmlFor="edit-male" className="font-normal">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="edit-female" />
                            <Label htmlFor="edit-female" className="font-normal">Female</Label>
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
                                    id={`edit-subject-${subject.id}`} 
                                    onCheckedChange={() => handleSubjectCheckedChange(subject)}
                                    checked={!!selection}
                                />
                                <Label htmlFor={`edit-subject-${subject.id}`} className="font-normal">{subject.name}</Label>
                                
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
            <DialogClose asChild>
                <Button type="button" onClick={handleSubmit} disabled={isSaving}>
                    {isSaving && <Loader2 className="animate-spin mr-2"/>}
                    {isSaving ? 'Saving Changes...' : 'Save Changes'}
                </Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
  )
}

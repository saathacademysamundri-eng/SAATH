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
import { classes, students } from "@/lib/data"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export function AddStudentForm({ onStudentAdded }: { onStudentAdded: () => void }) {
    const [name, setName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [phone, setPhone] = useState('');
    const [college, setCollege] = useState('');
    const [address, setAddress] = useState('');
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [totalFee, setTotalFee] = useState(0);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const { toast } = useToast();

    const handleClassChange = (value: string) => {
        setSelectedClass(value);
        setSelectedSubjects([]);
    }

    const handleSubjectChange = (subjectId: string) => {
        setSelectedSubjects(prev => 
            prev.includes(subjectId) 
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
    }

    const distributedFee = useMemo(() => {
        if (selectedSubjects.length === 0 || totalFee === 0) {
            return 0;
        }
        return totalFee / selectedSubjects.length;
    }, [totalFee, selectedSubjects.length]);

    const handleSubmit = () => {
        if (!name || !fatherName || !phone || !college || !address || !selectedClass || totalFee <= 0 || selectedSubjects.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please fill out all fields.',
            });
            return;
        }

        const newStudentId = `S${(students.length + 1).toString().padStart(3, '0')}`;
        const currentClassDetails = classes.find(c => c.id === selectedClass);
        const newStudent = {
            id: newStudentId,
            name,
            class: currentClassDetails?.name || '',
            subjects: selectedSubjects.map(subjectId => currentClassDetails?.subjects.find(s => s.id === subjectId)?.name || '').join(', '),
            feeStatus: 'Pending',
            avatar: `https://picsum.photos/seed/${newStudentId}/40/40`,
        };

        students.push(newStudent);
        onStudentAdded();

        toast({
            title: 'Student Added',
            description: `${name} has been successfully added.`,
        });
    };


    const currentClass = classes.find(c => c.id === selectedClass);

  return (
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new student.
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
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="college">College Name</Label>
                <Input id="college" placeholder="Enter college name" value={college} onChange={(e) => setCollege(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" placeholder="Enter student's address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="class">Class</Label>
                <Select onValueChange={handleClassChange}>
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
                <Label htmlFor="totalFee">Total Fee (PKR)</Label>
                <Input 
                    id="totalFee" 
                    type="number" 
                    placeholder="Enter total monthly fee" 
                    value={totalFee}
                    onChange={(e) => setTotalFee(Number(e.target.value))}
                />
            </div>
          </div>
          
          {currentClass && (
            <div className="grid gap-4">
                <Label>Subjects</Label>
                <div className="grid gap-2 rounded-md border p-4">
                    {currentClass.subjects.map(subject => (
                        <div key={subject.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Checkbox 
                                    id={`subject-${subject.id}`} 
                                    onCheckedChange={() => handleSubjectChange(subject.id)}
                                    checked={selectedSubjects.includes(subject.id)}
                                />
                                <Label htmlFor={`subject-${subject.id}`} className="font-normal">{subject.name}</Label>
                            </div>
                             {selectedSubjects.includes(subject.id) && (
                                <div className="text-sm text-muted-foreground">
                                    {distributedFee > 0 ? `${distributedFee.toFixed(0)} PKR` : ''}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" onClick={handleSubmit}>Add Student</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
  )
}

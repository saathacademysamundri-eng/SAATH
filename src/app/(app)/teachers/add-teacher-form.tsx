"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle } from "lucide-react"
import { useState, useMemo } from "react"
import { classes, teachers } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

export function AddTeacherForm({ onTeacherAdded }: { onTeacherAdded: () => void }) {
  const [name, setName] = useState('');
  const [experience, setExperience] = useState('');
  const [earnings, setEarnings] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const { toast } = useToast();

  const allSubjects = useMemo(() => {
    const subjectSet = new Set<string>();
    classes.forEach(c => {
      c.subjects.forEach(s => {
        subjectSet.add(s.name);
      });
    });
    return Array.from(subjectSet);
  }, []);

  const handleSubjectChange = (subjectName: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectName)
        ? prev.filter(name => name !== subjectName)
        : [...prev, subjectName]
    );
  }

  const handleSubmit = () => {
    if (!name || !experience || !earnings || selectedSubjects.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill out all fields and select at least one subject.',
      });
      return;
    }

    const newTeacherId = `T${(teachers.length + 1).toString().padStart(2, '0')}`;
    const newTeacher = {
      id: newTeacherId,
      name,
      subject: selectedSubjects.join(', '),
      experience: `${experience} Years`,
      earnings: `${Number(earnings).toLocaleString()} PKR`,
      avatar: `https://picsum.photos/seed/${newTeacherId}/40/40`,
    };

    teachers.push(newTeacher);
    onTeacherAdded();

    // Reset form
    setName('');
    setExperience('');
    setEarnings('');
    setSelectedSubjects([]);

    toast({
      title: 'Teacher Added',
      description: `${name} has been successfully added.`,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle />
          Add Teacher
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new teacher.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Enter teacher's full name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Subjects</Label>
            <div className="grid gap-2 rounded-md border p-4 max-h-[200px] overflow-y-auto">
              {allSubjects.map(subject => (
                <div key={subject} className="flex items-center gap-2">
                  <Checkbox
                    id={`subject-${subject}`}
                    onCheckedChange={() => handleSubjectChange(subject)}
                    checked={selectedSubjects.includes(subject)}
                  />
                  <Label htmlFor={`subject-${subject}`} className="font-normal">{subject}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="experience">Experience (in years)</Label>
            <Input id="experience" type="number" placeholder="e.g., 5" value={experience} onChange={e => setExperience(e.target.value)} />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="earnings">Monthly Earnings (PKR)</Label>
            <Input id="earnings" type="number" placeholder="e.g., 100000" value={earnings} onChange={e => setEarnings(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" onClick={handleSubmit}>Add Teacher</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

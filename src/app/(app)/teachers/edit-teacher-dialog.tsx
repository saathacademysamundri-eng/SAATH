
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
import { updateTeacher, getAllSubjects } from "@/lib/firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Loader2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Subject, Teacher } from "@/lib/data"
import { cn } from "@/lib/utils"

export function EditTeacherDialog({ teacher, onTeacherUpdated }: { teacher: Teacher, onTeacherUpdated: () => void }) {
    const [name, setName] = useState(teacher.name)
    const [phone, setPhone] = useState(teacher.phone)
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>(teacher.subjects || [])
    const [allSubjects, setAllSubjects] = useState<Subject[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const { toast } = useToast()

     useEffect(() => {
        const fetchSubjects = async () => {
            const subjectsData = await getAllSubjects();
            setAllSubjects(subjectsData);
        };
        fetchSubjects();
    }, []);

    const handleSubjectSelect = (subjectName: string) => {
        if (!selectedSubjects.includes(subjectName)) {
            setSelectedSubjects([...selectedSubjects, subjectName]);
        }
    }

    const handleSubjectRemove = (subjectName: string) => {
        setSelectedSubjects(selectedSubjects.filter(s => s !== subjectName));
    }

    const handleSubmit = async () => {
        if (!name.trim() || !phone.trim() || selectedSubjects.length === 0) {
            toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please fill out all fields and select at least one subject.' });
            return;
        }

        setIsSaving(true);
        const result = await updateTeacher(teacher.id, { name: name.trim(), phone: phone.trim(), subjects: selectedSubjects });

        if (result.success) {
            toast({ title: 'Teacher Updated', description: 'The teacher details have been updated.' });
            onTeacherUpdated();
        } else {
            toast({ variant: 'destructive', title: 'Failed to Update', description: result.message });
        }
        setIsSaving(false);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Teacher: {teacher.name}</DialogTitle>
                <DialogDescription>Update the details for this teacher.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Teacher Name</Label>
                    <Input
                        id="name"
                        placeholder="e.g., Mr. Ahmed"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="e.g., 03001234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
                 <div className="space-y-2">
                    <Label>Subjects</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start font-normal h-auto min-h-10">
                                <div className="flex flex-wrap gap-1">
                                    {selectedSubjects.length > 0 ? (
                                        selectedSubjects.map(subject => (
                                            <Badge key={subject} variant="secondary" className="gap-1">
                                                {subject}
                                                <button onClick={(e) => { e.stopPropagation(); handleSubjectRemove(subject); }} className="rounded-full hover:bg-destructive/20 p-0.5">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-muted-foreground">Select subjects...</span>
                                    )}
                                </div>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search subject..." />
                                <CommandEmpty>No subject found.</CommandEmpty>
                                <CommandGroup className="max-h-48 overflow-y-auto">
                                    {allSubjects.map((subject) => (
                                        <CommandItem
                                            key={subject.id}
                                            value={subject.name}
                                            onSelect={() => handleSubjectSelect(subject.name)}
                                            className={cn(selectedSubjects.includes(subject.name) && "bg-accent")}
                                        >
                                            {subject.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                 </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin mr-2" /> : null}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

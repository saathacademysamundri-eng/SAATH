"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { classes } from "@/lib/data"

export function AddStudentForm() {
    const [selectedClass, setSelectedClass] = useState<string | null>(null);

    const handleClassChange = (value: string) => {
        setSelectedClass(value);
    }
    const currentClass = classes.find(c => c.id === selectedClass);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new student.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Enter student's full name" />
          </div>
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
          {currentClass && (
            <div className="grid gap-4">
                <Label>Subjects</Label>
                <div className="grid gap-2 rounded-md border p-4">
                    {currentClass.subjects.map(subject => (
                        <div key={subject.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Checkbox id={`subject-${subject.id}`} />
                                <Label htmlFor={`subject-${subject.id}`} className="font-normal">{subject.name}</Label>
                            </div>
                            <div className="text-sm text-muted-foreground">{subject.fee} PKR</div>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit">Add Student</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

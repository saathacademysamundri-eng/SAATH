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
import type { Class, Subject } from "@/lib/data"
import { updateClassSubjects } from "@/lib/firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, Trash2 } from "lucide-react"
import { useState } from "react"

export function EditSubjectsDialog({
  classData,
  onSubjectsUpdate,
}: {
  classData: Class
  onSubjectsUpdate: () => void
}) {
  const [subjects, setSubjects] = useState<Subject[]>(classData.subjects)
  const [newSubjectName, setNewSubjectName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast();

  const handleAddSubject = () => {
    if (newSubjectName.trim() === "") return
    const newSubject: Subject = {
      id: `S${Date.now()}`,
      name: newSubjectName.trim(),
    }
    setSubjects([...subjects, newSubject])
    setNewSubjectName("")
  }

  const handleRemoveSubject = (subjectId: string) => {
    setSubjects(subjects.filter((s) => s.id !== subjectId))
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    const result = await updateClassSubjects(classData.id, subjects);
    if (result.success) {
      toast({
        title: "Subjects Updated",
        description: `Subjects for ${classData.name} have been saved.`,
      })
      onSubjectsUpdate()
    } else {
       toast({
        variant: "destructive",
        title: "Update Failed",
        description: result.message,
      })
    }
    setIsSaving(false)
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit Subjects for {classData.name}</DialogTitle>
        <DialogDescription>
          Add or remove subjects for this class.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="New subject name..."
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubject();
                }
            }}
          />
          <Button onClick={handleAddSubject} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
        <Label>Subjects</Label>
        <div className="grid gap-2 rounded-md border p-4 max-h-[200px] overflow-y-auto">
          {subjects.length > 0 ? (
            subjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center justify-between"
              >
                <Label
                  htmlFor={`subject-${subject.id}`}
                  className="font-normal"
                >
                  {subject.name}
                </Label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleRemoveSubject(subject.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              No subjects added yet.
            </p>
          )}
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Done'}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}

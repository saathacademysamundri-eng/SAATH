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
import { Label } from "@/components/ui/label"
import type { Class } from "@/lib/data"

export function EditSubjectsDialog({ classData }: { classData: Class }) {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit Subjects for {classData.name}</DialogTitle>
        <DialogDescription>
          Add or remove subjects for this class.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <Label>Subjects</Label>
        <div className="grid gap-2 rounded-md border p-4 max-h-[200px] overflow-y-auto">
            {classData.subjects.map(subject => (
                <div key={subject.id} className="flex items-center justify-between">
                    <Label htmlFor={`subject-${subject.id}`} className="font-normal">{subject.name}</Label>
                </div>
            ))}
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button">Done</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}

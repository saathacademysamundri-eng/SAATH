
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
import type { Class } from "@/lib/data"
import { updateClass } from "@/lib/firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export function RenameClassDialog({
  classData,
  onClassRenamed,
}: {
  classData: Class
  onClassRenamed: () => void
}) {
  const [name, setName] = useState(classData.name)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast();

  const handleSaveChanges = async () => {
    if (!name.trim() || name.trim() === classData.name) return;

    setIsSaving(true);
    const result = await updateClass(classData.id, { name: name.trim() });
    if (result.success) {
      toast({
        title: "Class Renamed",
        description: `Class "${classData.name}" is now "${name.trim()}". All enrolled students have been updated.`,
      })
      onClassRenamed()
    } else {
       toast({
        variant: "destructive",
        title: "Update Failed",
        description: result.message,
      })
    }
    setIsSaving(false);
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Rename Class</DialogTitle>
        <DialogDescription>
          Change the name of this class. All students currently enrolled in "{classData.name}" will automatically be moved to the new class name.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
            <Label htmlFor="class-name">New Class Name</Label>
            <Input
                id="class-name"
                placeholder="e.g., 10th Grade"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveChanges();
                    }
                }}
            />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="ghost">Cancel</Button>
        </DialogClose>
        <Button type="button" onClick={handleSaveChanges} disabled={isSaving || !name.trim() || name.trim() === classData.name}>
          {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
          {isSaving ? 'Updating Students...' : 'Update Class Name'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}


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
import { addClass } from "@/lib/firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export function AddClassDialog({ onClassAdded }: { onClassAdded: () => void }) {
  const [name, setName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Name",
        description: "Please enter a name for the class.",
      })
      return
    }

    setIsSaving(true)
    const result = await addClass(name.trim())

    if (result.success) {
      toast({
        title: "Class Added",
        description: `The class "${name.trim()}" has been successfully created.`,
      })
      onClassAdded()
      setName("") // Reset form
    } else {
      toast({
        variant: "destructive",
        title: "Failed to Add Class",
        description: result.message,
      })
    }
    setIsSaving(false)
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add New Class</DialogTitle>
        <DialogDescription>
          Enter a name for the new class. You can add subjects later.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Class Name</Label>
          <Input
            id="name"
            placeholder="e.g., 8th Grade"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
              }
            }}
          />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="animate-spin mr-2" />}
            {isSaving ? "Adding..." : "Add Class"}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}


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
import { PlusCircle, Trash2 } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

export function EditSectionsDialog({
  classData,
  onSectionsUpdate,
}: {
  classData: Class
  onSectionsUpdate: () => void
}) {
  const [sections, setSections] = useState<string[]>(classData.sections || [])
  const [newSectionName, setNewSectionName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast();

  const handleAddSection = () => {
    if (newSectionName.trim() === "" || sections.includes(newSectionName.trim())) return
    setSections([...sections, newSectionName.trim()])
    setNewSectionName("")
  }

  const handleRemoveSection = (sectionName: string) => {
    setSections(sections.filter((s) => s !== sectionName))
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    const result = await updateClass(classData.id, { sections });
    if (result.success) {
      toast({
        title: "Sections Updated",
        description: `Sections for ${classData.name} have been saved.`,
      })
      onSectionsUpdate()
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
        <DialogTitle>Edit Sections for {classData.name}</DialogTitle>
        <DialogDescription>
          Add or remove sections for this class.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="New section name (e.g., A, B, Gold)"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSection();
                }
            }}
          />
          <Button onClick={handleAddSection} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
        <Label>Sections</Label>
        <div className="flex flex-wrap gap-2 rounded-md border p-4 min-h-[80px]">
          {sections.length > 0 ? (
            sections.map((section) => (
              <Badge
                key={section}
                variant="secondary"
                className="text-base"
              >
                {section}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1"
                  onClick={() => handleRemoveSection(section)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center w-full self-center">
              No sections defined yet.
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

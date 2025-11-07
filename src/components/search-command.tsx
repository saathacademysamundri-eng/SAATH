
"use client"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useAppContext } from "@/hooks/use-app-context"
import { Users, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"

export function SearchCommand({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { students } = useAppContext()
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const handleSelect = (studentId: string) => {
    router.push(`/students/${studentId}`)
    onOpenChange(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Search Students</DialogTitle>
      <DialogDescription className="sr-only">Search for a student by name or roll number and navigate to their profile.</DialogDescription>
      <CommandInput placeholder="Search for a student by name or roll number..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Students">
          {students.map((student) => (
            <CommandItem
              key={student.id}
              value={`${student.name} ${student.id}`}
              onSelect={() => handleSelect(student.id)}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>{student.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">({student.id})</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

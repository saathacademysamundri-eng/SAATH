
"use client"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Student } from "@/lib/data"
import { getStudentsPaged } from "@/lib/firebase/firestore"

export function SearchCommand({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    if (open) {
      const fetchInitialStudents = async () => {
        setLoading(true)
        try {
          const result = await getStudentsPaged(50)
          setStudents(result.students)
        } catch (error) {
          console.error("Failed to fetch students for search", error)
        } finally {
          setLoading(false)
        }
      }
      fetchInitialStudents()
    }
  }, [open])

  const handleSelect = (studentId: string) => {
    router.push(`/students/${studentId}`)
    onOpenChange(false)
  }

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(search.toLowerCase()) || 
    student.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search for a student by name or roll number..." 
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>{loading ? "Loading..." : "No results found."}</CommandEmpty>
        <CommandGroup heading="Students">
          {filteredStudents.map((student) => (
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

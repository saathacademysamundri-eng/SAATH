

"use client";

import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Student } from "@/lib/data";
import { updateStudent } from "@/lib/firebase/firestore";
import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { useAppContext } from "@/hooks/use-app-context";

export function PromoteStudentDialog({
  student,
  onStudentPromoted,
}: {
  student: Student;
  onStudentPromoted: () => void;
}) {
  const { classes } = useAppContext();
  const { toast } = useToast();
  const [newClassId, setNewClassId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const availableClasses = classes.filter(c => c.name !== student.class);

  const handlePromote = async () => {
    if (!newClassId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a new class to promote the student to.",
      });
      return;
    }

    setIsSaving(true);
    const newClass = classes.find(c => c.id === newClassId);
    if (!newClass) {
        setIsSaving(false);
        return;
    }

    const result = await updateStudent(student.id, { 
        class: newClass.name,
        // Reset subjects when promoting, as they will need to be re-assigned for the new class
        subjects: [], 
    });

    if (result.success) {
      toast({
        title: "Student Promoted",
        description: `${student.name} has been promoted to ${newClass.name}. Please edit the student's profile to assign new subjects.`,
      });
      onStudentPromoted();
    } else {
      toast({
        variant: "destructive",
        title: "Promotion Failed",
        description: result.message,
      });
    }
    setIsSaving(false);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Promote Student</DialogTitle>
        <DialogDescription>
          Promote {student.name} to a new class.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="flex items-center justify-center gap-4">
            <div className="rounded-md border p-4 text-center">
                <p className="text-sm text-muted-foreground">Current Class</p>
                <p className="font-semibold">{student.class}</p>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <div className="rounded-md border p-4 text-center">
                 <p className="text-sm text-muted-foreground">New Class</p>
                <p className="font-semibold">{classes.find(c => c.id === newClassId)?.name || 'Select a class'}</p>
            </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-class">Select New Class</Label>
          <Select value={newClassId || undefined} onValueChange={setNewClassId}>
            <SelectTrigger id="new-class">
              <SelectValue placeholder="Select a class..." />
            </SelectTrigger>
            <SelectContent>
              {availableClasses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Note: Promoting a student will clear their current subject enrollments. You will need to assign new subjects from the student's edit page.
          </p>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>
        <Button onClick={handlePromote} disabled={isSaving || !newClassId}>
          {isSaving && <Loader2 className="mr-2 animate-spin" />}
          {isSaving ? "Promoting..." : "Confirm & Promote"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

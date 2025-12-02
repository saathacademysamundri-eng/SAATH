
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
import { updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { doc } from "firebase/firestore";
import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { useAppContext } from "@/hooks/use-app-context";

export function BulkPromoteDialog({
  students,
  onStudentsPromoted,
}: {
  students: Student[];
  onStudentsPromoted: () => void;
}) {
  const { classes } = useAppContext();
  const { toast } = useToast();
  const [newClassId, setNewClassId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentClassNames = [...new Set(students.map(s => s.class))].join(', ');
  const availableClasses = classes.filter(c => !students.some(s => s.class === c.name));

  const handlePromote = async () => {
    if (!newClassId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a new class to promote the students to.",
      });
      return;
    }

    setIsSaving(true);
    const newClass = classes.find(c => c.id === newClassId);
    if (!newClass) {
        setIsSaving(false);
        return;
    }
    
    try {
        const batch = writeBatch(db);
        students.forEach(student => {
            const studentRef = doc(db, 'students', student.id);
            batch.update(studentRef, {
                class: newClass.name,
                subjects: [] // Reset subjects on promotion
            });
        });
        await batch.commit();

        toast({
            title: "Students Promoted",
            description: `${students.length} students have been promoted to ${newClass.name}. Please edit their profiles to assign new subjects.`,
        });
        onStudentsPromoted();
    } catch (e) {
        toast({
            variant: "destructive",
            title: "Promotion Failed",
            description: (e as Error).message,
        });
    }

    setIsSaving(false);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Bulk Promote Students</DialogTitle>
        <DialogDescription>
          Promote {students.length} selected students to a new class.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="flex items-center justify-center gap-4">
            <div className="rounded-md border p-4 text-center">
                <p className="text-sm text-muted-foreground">Current Class(es)</p>
                <p className="font-semibold">{currentClassNames}</p>
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
            Note: Promoting students will clear their current subject enrollments.
          </p>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>
        <Button onClick={handlePromote} disabled={isSaving || !newClassId}>
          {isSaving && <Loader2 className="mr-2 animate-spin" />}
          {isSaving ? "Promoting..." : `Promote ${students.length} Students`}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

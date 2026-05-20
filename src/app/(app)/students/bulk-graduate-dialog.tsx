
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
import { useToast } from "@/hooks/use-toast";
import { Student } from "@/lib/data";
import { graduateStudentsBulk } from "@/lib/firebase/firestore";
import { useState } from "react";
import { Loader2, GraduationCap } from "lucide-react";

export function BulkGraduateDialog({
  students,
  onStudentsGraduated,
}: {
  students: Student[];
  onStudentsGraduated: () => void;
}) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleGraduate = async () => {
    setIsSaving(true);
    const result = await graduateStudentsBulk(students.map(s => s.id));

    if (result.success) {
      toast({
        title: "Students Graduated",
        description: `${students.length} students have been moved to Alumni records.`,
      });
      onStudentsGraduated();
    } else {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: result.message,
      });
    }
    setIsSaving(false);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          Graduate Students
        </DialogTitle>
        <DialogDescription>
          You are about to graduate <strong>{students.length}</strong> selected students. They will be removed from active classes and their data will be saved in the <strong>Alumni</strong> section.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <p className="text-sm text-muted-foreground">
          This action is typically performed when students complete their final year (e.g., 2nd Year). Their academic and financial history will be preserved.
        </p>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>
        <Button onClick={handleGraduate} disabled={isSaving}>
          {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <GraduationCap className="mr-2 h-4 w-4" />}
          Confirm Graduation
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

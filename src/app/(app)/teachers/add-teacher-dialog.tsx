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
import { addTeacher } from "@/lib/firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export function AddTeacherDialog({ onTeacherAdded }: { onTeacherAdded: () => void }) {
    const [name, setName] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please provide a teacher name.' });
            return;
        }

        setIsSaving(true);
        const result = await addTeacher({ name: name.trim() });

        if (result.success) {
            toast({ title: 'Teacher Added', description: 'The new teacher has been saved.' });
            onTeacherAdded();
        } else {
            toast({ variant: 'destructive', title: 'Failed to Add', description: result.message });
        }
        setIsSaving(false);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
                <DialogDescription>Enter the details for the new teacher.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Teacher Name</Label>
                    <Input
                        id="name"
                        placeholder="e.g., Mr. Ahmed"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin mr-2" /> : null}
                        {isSaving ? 'Saving...' : 'Save Teacher'}
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle } from "lucide-react"

export function AddTeacherForm() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle />
          Add Teacher
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new teacher.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Enter teacher's full name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="e.g., Physics, Mathematics" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="experience">Experience</Label>
            <Input id="experience" placeholder="e.g., 5 Years" />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="earnings">Monthly Earnings</Label>
            <Input id="earnings" placeholder="e.g., 100,000 PKR" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Add Teacher</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

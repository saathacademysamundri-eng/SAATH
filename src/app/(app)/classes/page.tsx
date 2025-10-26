
"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { type Class } from '@/lib/data';
import { Book, Edit, PlusCircle } from 'lucide-react';
import { EditSubjectsDialog } from './edit-subjects-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppContext } from '@/hooks/use-app-context';
import { AddClassDialog } from './add-class-dialog';

export default function ClassesPage() {
  const { classes, loading, refreshData } = useAppContext();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">
            Manage classes and their subjects.
          </p>
        </div>
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle />
                    Add Class
                </Button>
            </DialogTrigger>
            <AddClassDialog onClassAdded={refreshData} />
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Class List</CardTitle>
          <CardDescription>
            A list of all classes and their subjects offered in the academy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          
            <Accordion type="single" collapsible className="w-full">
              {classes.map((c) => (
                <AccordionItem key={c.id} value={c.id}>
                  <AccordionTrigger className="text-lg font-medium">
                    {c.name}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-4 p-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-md font-semibold flex items-center gap-2">
                          <Book className="h-5 w-5" /> Subjects
                        </h3>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="mr-2 h-4 w-4" /> Edit Subjects
                            </Button>
                          </DialogTrigger>
                          <EditSubjectsDialog
                            classData={c}
                            onSubjectsUpdate={refreshData}
                          />
                        </Dialog>
                      </div>
                      <div className="grid gap-3">
                        {c.subjects.length > 0 ? (
                          c.subjects.map((subject) => (
                            <div
                              key={subject.id}
                              className="flex items-center justify-between rounded-md border p-3"
                            >
                              <span className="font-medium">{subject.name}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground p-3">
                            No subjects assigned to this class.
                          </p>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          
        </CardContent>
      </Card>
    </div>
  );
}

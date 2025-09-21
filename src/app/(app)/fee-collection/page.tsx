'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { students as initialStudents, type Student } from '@/lib/data';
import { Printer, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function FeeCollectionPage() {
  const [search, setSearch] = useState('');
  const [searchedStudent, setSearchedStudent] = useState<Student | null>(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  const handleSearch = () => {
    if (!search.trim()) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please enter a student roll number to search.',
        });
        setSearchedStudent(null);
        return;
    }
    const student = initialStudents.find(
      s => s.id.toLowerCase() === search.toLowerCase()
    );
    if (student) {
      setSearchedStudent(student);
      setPaidAmount(0); // Reset paid amount for new search
    } else {
      toast({
        variant: 'destructive',
        title: 'Not Found',
        description: 'No student found with that roll number.',
      });
      setSearchedStudent(null);
    }
  };

  const handlePrintReceipt = () => {
    if (searchedStudent) {
      if (paidAmount <= 0) {
        toast({
          variant: 'destructive',
          title: 'Cannot Print Receipt',
          description: 'No payment has been recorded.',
        });
        return;
      }
      
      const balance = searchedStudent.totalFee - paidAmount;
      const url = `/fee-collection/${searchedStudent.id}/receipt?amount=${paidAmount}&balance=${balance}&total=${searchedStudent.totalFee}`;
      window.open(url, '_blank');
    }
  };
  
  const balance = searchedStudent ? searchedStudent.totalFee - paidAmount : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fee Collection</h1>
        <p className="text-muted-foreground">
          Search for a student to collect fees and view outstanding dues.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Collect Fee</CardTitle>
          <CardDescription>
            Enter a student roll number to view outstanding dues and collect
            fees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter student roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchedStudent && (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Fee Details for {searchedStudent.name}</CardTitle>
                    <CardDescription>
                        Roll #: {searchedStudent.id} | Class: {searchedStudent.class}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                     <div className="grid grid-cols-2 gap-4 text-center">
                        <div className='p-4 bg-secondary rounded-lg'>
                            <p className='text-sm text-muted-foreground'>Total Fee</p>
                            <p className='text-2xl font-bold'>{searchedStudent.totalFee.toLocaleString()} PKR</p>
                        </div>
                         <div className='p-4 bg-secondary rounded-lg'>
                            <p className='text-sm text-muted-foreground'>Balance</p>
                            <p className='text-2xl font-bold'>{balance.toLocaleString()} PKR</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Collection</CardTitle>
                </CardHeader>
                 <CardContent className="grid md:grid-cols-3 gap-6">
                     <div className="space-y-2">
                        <Label>Total Dues (PKR)</Label>
                        <Input value={searchedStudent.totalFee.toLocaleString()} readOnly disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="paidAmount">Amount Paid (PKR)</Label>
                        <Input 
                            id="paidAmount" 
                            type="number"
                            placeholder="Enter amount being paid" 
                            value={paidAmount || ''}
                            onChange={(e) => setPaidAmount(Number(e.target.value))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Remaining Dues (PKR)</Label>
                        <Input value={balance.toLocaleString()} readOnly disabled />
                    </div>
                 </CardContent>
                 <CardContent className='flex gap-2'>
                    <Button onClick={() => toast({ title: 'Payment Recorded', description: `Paid ${paidAmount} for ${searchedStudent.name}`})}>Collect Fee</Button>
                    <Button variant="outline" onClick={handlePrintReceipt}>
                        <Printer className="mr-2"/>
                        Print Receipt
                    </Button>
                 </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}

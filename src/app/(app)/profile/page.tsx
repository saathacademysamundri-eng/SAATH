
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'New passwords do not match.',
      });
      return;
    }
    if (newPassword.length < 6) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Password must be at least 6 characters long.',
        });
        return;
    }

    setIsSaving(true);
    // In a real application, you would call your auth provider to update the password.
    // For this prototype, we'll simulate a successful update.
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Password Updated',
      description: 'Your password has been successfully changed.',
    });
    
    // Reset fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col gap-6">
       <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Profile</h1>
          <p className="text-muted-foreground">
            Manage your Super Admin profile and security settings.
          </p>
        </div>
      <form onSubmit={handlePasswordUpdate}>
        <Card className='max-w-2xl'>
            <CardHeader>
                <CardTitle>Admin Security</CardTitle>
                <CardDescription>Update the master password for the admin account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Admin Email</Label>
                    <Input id="email" type="email" value="admin@example.com" disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 animate-spin" />}
                  {isSaving ? 'Updating...' : 'Update Password'}
                </Button>
            </CardFooter>
        </Card>
      </form>
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';

export function ForgotPasswordDialog() {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSendLink = async () => {
        if (!email) {
            toast({ variant: 'destructive', title: 'Email Required', description: 'Please enter your email address.' });
            return;
        }
        setIsSending(true);
        try {
            await sendPasswordResetEmail(auth, email);
            toast({ title: 'Email Sent', description: 'A password reset link has been sent to your email address.' });
            setIsOpen(false);
        } catch (error: any) {
            let errorMessage = 'An unexpected error occurred.';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No user found with this email address.';
            }
            toast({ variant: 'destructive', title: 'Error', description: errorMessage });
        }
        setIsSending(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="link" size="sm" className="p-0 h-auto text-sm font-medium text-gray-300 hover:text-white">
                    Forgot password?
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 text-white border-gray-800">
                <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Enter your email address and we'll send you a link to reset your password.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="reset-email">Email Address</Label>
                        <Input
                            id="reset-email"
                            type="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-white/20 text-white placeholder:text-gray-300 border-white/30 focus:bg-white/30 focus:ring-white"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleSendLink} disabled={isSending} className="bg-white text-blue-600 hover:bg-gray-200">
                        {isSending && <Loader2 className="mr-2 animate-spin" />}
                        Send Reset Link
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

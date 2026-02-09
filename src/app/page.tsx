'use client';

import { useEffect, useState } from 'react';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Facebook, Instagram, MessageSquare, Award, Wallet, ArrowRight } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence, signOut } from 'firebase/auth';
import { getSettings } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import { ForgotPasswordDialog } from '@/components/login-form';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

const ADMIN_UID = "oiNKNvX9sQbdgjhxMP71eSiGkkH2";

export default function LandingPage() {
    const [isClient, setIsClient] = useState(false);
    const { settings, isSettingsLoading } = useSettings();
    const [loginType, setLoginType] = useState<'admin' | 'teacher'>('admin');
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [isAdminLoading, setIsAdminLoading] = useState(false);
    const { login: teacherLogin, loading: isTeacherLoading } = useTeacherAuth();
    
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleAdminLogin = async () => {
        setIsAdminLoading(true);
        try {
            await setPersistence(auth, browserSessionPersistence);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (user.uid !== ADMIN_UID) {
                await signOut(auth);
                toast({ variant: 'destructive', title: 'Access Denied', description: 'You do not have permission to access the admin panel.' });
                return;
            }

            const details = await getSettings('details');
            if (details) sessionStorage.setItem('cachedSettings', JSON.stringify(details));
            
            toast({ title: 'Login Successful', description: 'Welcome back, Admin!' });
            router.push('/dashboard');
        } catch (error: any) {
            let errorMessage = 'An unexpected error occurred.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMessage = 'Invalid email or password.';
            }
            toast({ variant: 'destructive', title: 'Login Failed', description: errorMessage });
        } finally {
            setIsAdminLoading(false);
        }
    };

    const handleTeacherLogin = async () => {
        const result = await teacherLogin(email, password);
        if (!result.success) {
            toast({ variant: 'destructive', title: 'Login Failed', description: result.message });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (loginType === 'admin') {
            handleAdminLogin();
        } else {
            handleTeacherLogin();
        }
    };

    if (!isClient) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    const isLoading = isAdminLoading || isTeacherLoading;

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
                
                {/* Left Side: Student Portal Gateway */}
                <div className="space-y-8">
                    <div className="space-y-4 text-center lg:text-left">
                        <div className="h-20 w-20 mx-auto lg:mx-0">
                            <Logo noText={true} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                            SAATH ACADEMY <br/>
                            <span className="text-[#059669]">SAMUNDRI</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Official Student Portal</p>
                    </div>

                    <div className="grid gap-4">
                        <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group">
                            <Link href="/p/results" className="block">
                                <CardContent className="p-0 flex items-stretch">
                                    <div className="bg-[#1e40af] p-6 text-white flex items-center justify-center">
                                        <Award className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1 p-6 text-left bg-white flex items-center justify-between">
                                        <div>
                                            <h3 className="font-black text-slate-900 text-lg uppercase">Academic Performance</h3>
                                            <p className="text-slate-500 text-sm font-medium">Check marks & board rankings</p>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-[#1e40af] transition-colors" />
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>

                        <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group">
                            <Link href="/p/ledger" className="block">
                                <CardContent className="p-0 flex items-stretch">
                                    <div className="bg-[#059669] p-6 text-white flex items-center justify-center">
                                        <Wallet className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1 p-6 text-left bg-white flex items-center justify-between">
                                        <div>
                                            <h3 className="font-black text-slate-900 text-lg uppercase">Financial Statement</h3>
                                            <p className="text-slate-500 text-sm font-medium">View fee payments & balance</p>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-[#059669] transition-colors" />
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                        <Button variant="outline" asChild className="w-full rounded-xl border-2 font-bold h-12 hover:bg-slate-900 hover:text-white transition-all uppercase">
                            <Link href="https://www.saathsamundri.com/">
                                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                                Back to Academy Website
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Right Side: Staff Login */}
                <Card className="shadow-2xl border-slate-200 rounded-[2rem] overflow-hidden">
                    <div className="p-8 sm:p-10">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Staff Login</h2>
                            <p className="text-slate-500 font-medium">Management & Faculty Access</p>
                        </div>

                        <div className="flex justify-center mb-8">
                            <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 w-full max-w-[280px]">
                                <button 
                                    onClick={() => setLoginType('admin')} 
                                    className={cn("flex-1 py-2 px-4 rounded-xl text-sm font-black transition-all uppercase", loginType === 'admin' ? "bg-white text-[#1e40af] shadow-md" : "text-slate-400 hover:text-slate-600")}
                                >
                                    Admin
                                </button>
                                <button 
                                    onClick={() => setLoginType('teacher')} 
                                    className={cn("flex-1 py-2 px-4 rounded-xl text-sm font-black transition-all uppercase", loginType === 'teacher' ? "bg-white text-[#1e40af] shadow-md" : "text-slate-400 hover:text-slate-600")}
                                >
                                    Teacher
                                </button>
                            </div>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-bold uppercase text-[10px] tracking-widest text-slate-400 ml-1">Email Address</Label>
                                <Input id="email" type="email" placeholder={`${loginType}@saath.edu`} value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-xl border-2 border-slate-100 focus:border-[#1e40af] font-bold text-slate-900" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="font-bold uppercase text-[10px] tracking-widest text-slate-400 ml-1">Password</Label>
                                <div className="relative">
                                    <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 rounded-xl border-2 border-slate-100 focus:border-[#1e40af] font-bold text-slate-900" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <ForgotPasswordDialog />
                            </div>
                            <Button type="submit" className="w-full h-14 rounded-2xl bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-black text-lg shadow-lg uppercase tracking-tight transition-all active:scale-95" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                                Sign In to Portal
                            </Button>
                        </form>
                    </div>
                </Card>
            </div>

            {/* Global Institutional Footer */}
            <div className="mt-16 text-center space-y-4">
                <p className="font-black text-slate-400 text-xs sm:text-sm tracking-tight uppercase">
                    © 2026 SAATH ACADEMY SAMUNDRI. All Rights Reserved.
                </p>
                <div className="space-y-1">
                    <p className="text-slate-300 font-mono text-[10px] uppercase tracking-[0.4em] font-bold">
                        POWERED BY SCHOOLUP PLATFORM
                    </p>
                    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.25em]">
                        DEVELOPED BY MIAN MUDASSAR
                    </p>
                </div>
            </div>
        </main>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Facebook, Instagram, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence, signOut } from 'firebase/auth';
import { getSettings } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import { ForgotPasswordDialog } from '@/components/login-form';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import Image from 'next/image';

const ADMIN_UID = "oiNKNvX9sQbdgjhxMP71eSiGkkH2";

export default function LoginPage() {
    const [isClient, setIsClient] = useState(false);
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
                toast({ variant: 'destructive', title: 'Access Denied', description: 'Unauthorized access.' });
                return;
            }

            const details = await getSettings('details');
            if (details) sessionStorage.setItem('cachedSettings', JSON.stringify(details));
            
            toast({ title: 'Login Successful', description: 'Welcome back, Admin!' });
            router.push('/dashboard');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid credentials.' });
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

    if (!isClient) return <div className="min-h-screen bg-slate-950" />;
    
    const isLoading = isAdminLoading || isTeacherLoading;

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden relative">
            {/* Background "Ingredients" - Animated Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
            <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-emerald-500/5 blur-[100px] rounded-full animate-pulse delay-1000" />

            <div className="w-full max-w-4xl rounded-2xl bg-slate-900/40 backdrop-blur-2xl shadow-2xl overflow-hidden grid md:grid-cols-2 border border-white/10 relative z-10">
                {/* Left Side: Brand Image (Hidden on mobile) */}
                <div className="relative hidden md:block border-r border-white/5">
                    <Image
                        src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwbGVhcm5pbmd8ZW58MHx8fHwxNzYxNDU1NTU2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="Students"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-indigo-950/40 backdrop-grayscale-[0.1]" />
                </div>

                {/* Right Side: Login Form */}
                <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
                    <div className="mb-8 text-center">
                        <div className="h-16 w-16 mx-auto mb-4 bg-white p-1.5 rounded-2xl shadow-xl ring-4 ring-white/10">
                            <Logo noText={true} />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight leading-tight">
                            SAATH &nbsp; ACADEMY &nbsp; <span className="text-emerald-400">SAMUNDRI</span>
                        </h2>
                    </div>
                    
                    <div className="flex justify-center mb-8">
                        <div className="bg-white/5 p-1 rounded-full flex gap-1 w-full max-w-[220px] border border-white/10">
                            <button 
                                type="button"
                                onClick={() => setLoginType('admin')}
                                className={cn("flex-1 py-2 px-4 rounded-full text-[10px] font-black transition-all uppercase tracking-wider", loginType === 'admin' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-slate-200")}
                            >
                                Admin
                            </button>
                            <button 
                                type="button"
                                onClick={() => setLoginType('teacher')}
                                className={cn("flex-1 py-2 px-4 rounded-full text-[10px] font-black transition-all uppercase tracking-wider", loginType === 'teacher' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-slate-200")}
                            >
                                Teacher
                            </button>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Login Portal</h3>
                        <p className="text-slate-500 text-[9px] uppercase font-bold tracking-[0.3em] mt-1">Institutional Access Only</p>
                    </div>
                    
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black ml-1">Email Address</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="Enter your email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 h-12 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black ml-1">Password</Label>
                            <div className="relative">
                                <Input 
                                    id="password" 
                                    type={showPassword ? 'text' : 'password'} 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 h-12 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="text-right">
                            <ForgotPasswordDialog />
                        </div>
                        <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl transition-all active:scale-95 disabled:opacity-70" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            AUTHENTICATE
                        </Button>
                    </form>
                </div>
            </div>

            <div className="mt-10 text-center space-y-4 relative z-10">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Developed by Mian Mudassar</p>
                <div className="flex justify-center gap-6">
                    <Link href="https://www.facebook.com/mianmudassar.in" target="_blank" className="text-slate-600 hover:text-indigo-400 transition-colors">
                        <Facebook size={20} />
                    </Link>
                    <Link href="https://api.whatsapp.com/send?phone=923099969535" target="_blank" className="text-slate-600 hover:text-emerald-400 transition-colors">
                        <MessageSquare size={20} />
                    </Link>
                    <Link href="https://www.instagram.com/mianmudassar_" target="_blank" className="text-slate-600 hover:text-pink-400 transition-colors">
                        <Instagram size={20} />
                    </Link>
                </div>
            </div>
        </main>
    );
}

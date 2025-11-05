

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useSettings } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';
import { Database, Loader2, Palette, Wifi, MessageSquarePlus, Send, Globe, LayoutTemplate, ShieldCheck, Trash2, History, Archive, GraduationCap, DollarSign } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { seedDatabase, clearActivityHistory, getRecentActivities, resetMonthlyFees } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAppContext } from '@/hooks/use-app-context';
import { Preloader } from '@/components/ui/preloader';
import { cn } from '@/lib/utils';
import { sendWhatsappMessage } from '@/ai/flows/send-whatsapp-flow';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity } from '@/lib/data';
import { format } from 'date-fns';

function ClearHistoryDialog({ onConfirm }: { onConfirm: (pin: string) => Promise<boolean> }) {
  const [pin, setPin] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = async () => {
    setIsClearing(true);
    const success = await onConfirm(pin);
    if (success) {
      setIsOpen(false);
    }
    setIsClearing(false);
    setPin('');
  }

  return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
              <Button variant="destructive">
                  <Trash2 className="mr-2" />
                  Clear Activity History
              </Button>
          </DialogTrigger>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Confirm History Deletion</DialogTitle>
                  <DialogDescription>
                      This action cannot be undone. To proceed, please enter your 4-digit security PIN.
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4 flex justify-center">
                  <InputOTP maxLength={4} value={pin} onChange={setPin}>
                      <InputOTPGroup>
                          <InputOTPSlot index={0} isPin />
                          <InputOTPSlot index={1} isPin />
                          <InputOTPSlot index={2} isPin />
                          <InputOTPSlot index={3} isPin />
                      </InputOTPGroup>
                  </InputOTP>
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                  <Button variant="destructive" onClick={handleConfirm} disabled={isClearing || pin.length !== 4}>
                      {isClearing && <Loader2 className="animate-spin mr-2" />}
                      Confirm & Delete
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
  )
}

function HistoryTab() {
    const { settings } = useSettings();
    const { toast } = useToast();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchActivities = async () => {
        setLoading(true);
        const data = await getRecentActivities(50); // Fetch more activities
        setActivities(data);
        setLoading(false);
    }

    useEffect(() => {
        fetchActivities();
    }, []);

    const handleClearHistory = async (pin: string) => {
        if (pin !== settings.securityPin) {
            toast({ variant: 'destructive', title: 'Invalid PIN', description: 'The provided PIN is incorrect.' });
            return false;
        }
        const result = await clearActivityHistory();
        if (result.success) {
            toast({ title: 'History Cleared', description: 'All activity logs have been deleted.' });
            fetchActivities(); // Refresh the list
            return true;
        } else {
            toast({ variant: 'destructive', title: 'Deletion Failed', description: result.message });
            return false;
        }
    };
    
    const filteredActivities = activities.filter(activity =>
        activity.message.toLowerCase().includes(search.toLowerCase()) ||
        activity.type.toLowerCase().includes(search.toLowerCase())
    );

    return (
         <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Activity Log</CardTitle>
                        <CardDescription>A complete log of all actions performed in the application.</CardDescription>
                    </div>
                     <ClearHistoryDialog onConfirm={handleClearHistory} />
                </div>
                 <div className="relative pt-4">
                    <Input 
                        placeholder="Search activity log..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Activity Type</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredActivities.length > 0 ? (
                             filteredActivities.map(activity => (
                                <TableRow key={activity.id}>
                                    <TableCell>{format(activity.date, 'Pp')}</TableCell>
                                    <TableCell className="capitalize">{activity.type.replace(/_/g, ' ')}</TableCell>
                                    <TableCell>{activity.message}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                    No activities found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default function SettingsPage() {
  const { settings, updateSettings, isSettingsLoading } = useSettings();
  const { classes, teachers, students, loading: appLoading, refreshData } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isGeneratingFees, setIsGeneratingFees] = useState(false);

  // General State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [logo, setLogo] = useState('');
  const [academicSession, setAcademicSession] = useState('');

  // Appearance State
  const [preloaderStyle, setPreloaderStyle] = useState('style-1');

  // Security State
  const [autoLockEnabled, setAutoLockEnabled] = useState(false);
  const [autoLockTimeout, setAutoLockTimeout] = useState(300);
  const [securityPin, setSecurityPin] = useState('');

  // WhatsApp State
  const [whatsappProvider, setWhatsappProvider] = useState('none');
  const [ultraMsgApiUrl, setUltraMsgApiUrl] = useState('');
  const [ultraMsgToken, setUltraMsgToken] = useState('');
  const [officialApiUrl, setOfficialApiUrl] = useState('');
  const [officialApiToken, setOfficialApiToken] = useState('');
  
  const [newAdmissionMsg, setNewAdmissionMsg] = useState(false);
  const [absentMsg, setAbsentMsg] = useState(false);
  const [paymentReceiptMsg, setPaymentReceiptMsg] = useState(false);
  const [teacherAbsentMsg, setTeacherAbsentMsg] = useState(false);
  const [newAdmissionTemplate, setNewAdmissionTemplate] = useState('');
  const [absentTemplate, setAbsentTemplate] = useState('');
  const [paymentReceiptTemplate, setPaymentReceiptTemplate] = useState('');
  const [teacherAbsentTemplate, setTeacherAbsentTemplate] = useState('');

  const [isTestingApi, setIsTestingApi] = useState(false);
  const [isSendingCustom, setIsSendingCustom] = useState(false);
  const [testResult, setTestResult] = useState<{status: 'success' | 'error', message: string} | null>(null);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');

  const [customMessageTarget, setCustomMessageTarget] = useState<any>('all_classes');
  const [customMessage, setCustomMessage] = useState('');
  const [specificClass, setSpecificClass] = useState('');
  const [specificStudent, setSpecificStudent] = useState('');
  const [specificTeacher, setSpecificTeacher] = useState('');
  const [customNumbers, setCustomNumbers] = useState('');

  useEffect(() => {
    if (!isSettingsLoading) {
      setName(settings.name);
      setAddress(settings.address);
      setPhone(settings.phone);
      setLogo(settings.logo);
      setAcademicSession(settings.academicSession);
      setPreloaderStyle(settings.preloaderStyle);

      setAutoLockEnabled(settings.autoLockEnabled);
      setAutoLockTimeout(settings.autoLockTimeout);
      setSecurityPin(settings.securityPin);

      // WhatsApp settings
      setWhatsappProvider(settings.whatsappProvider);
      setUltraMsgApiUrl(settings.ultraMsgApiUrl);
      setUltraMsgToken(settings.ultraMsgToken);
      setOfficialApiUrl(settings.officialApiUrl);
      setOfficialApiToken(settings.officialApiToken);
      
      setNewAdmissionMsg(settings.newAdmissionMsg);
      setAbsentMsg(settings.absentMsg);
      setPaymentReceiptMsg(settings.paymentReceiptMsg);
      setTeacherAbsentMsg(settings.teacherAbsentMsg || false);
      setNewAdmissionTemplate(settings.newAdmissionTemplate);
      setAbsentTemplate(settings.absentTemplate);
      setPaymentReceiptTemplate(settings.paymentReceiptTemplate);
      setTeacherAbsentTemplate(settings.teacherAbsentTemplate || 'Dear {teacher_name}, you were marked absent today. Please contact administration if this is an error.');
    }
  }, [isSettingsLoading, settings]);

  const academicSessions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -5; i < 10; i++) {
        const startYear = currentYear + i;
        const endYear = startYear + 1;
        years.push(`${startYear}-${endYear}`);
    }
    return years;
  }, []);

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    await updateSettings({ name, address, phone, logo, academicSession }, "Updated general academy settings.");
    setIsSaving(false);
    toast({
      title: 'Settings Saved',
      description: 'Your general settings have been updated.',
    });
  };

  const handleSaveAppearance = async () => {
    setIsSaving(true);
    await updateSettings({ preloaderStyle }, "Updated application appearance settings.");
    setIsSaving(false);
    toast({
      title: 'Appearance Saved',
      description: 'Your appearance settings have been updated.',
    });
  }
  
  const handleSaveSecurity = async () => {
    if (securityPin && securityPin.length !== 4) {
      toast({
        variant: 'destructive',
        title: 'Invalid PIN',
        description: 'Security PIN must be 4 digits long.',
      });
      return;
    }
    setIsSaving(true);
    await updateSettings({ autoLockEnabled, autoLockTimeout, securityPin }, "Updated security settings.");
    setIsSaving(false);
    toast({
      title: 'Security Saved',
      description: 'Your security settings have been updated.',
    });
  };

  const handleSaveWhatsApp = async () => {
    setIsSaving(true);
    await updateSettings({
        whatsappProvider,
        ultraMsgApiUrl,
        ultraMsgToken,
        officialApiUrl,
        officialApiToken,
        newAdmissionMsg,
        absentMsg,
        paymentReceiptMsg,
        teacherAbsentMsg,
        newAdmissionTemplate,
        absentTemplate,
        paymentReceiptTemplate,
        teacherAbsentTemplate,
    }, "Updated WhatsApp integration and template settings.");
    setIsSaving(false);
    toast({
      title: 'Settings Saved',
      description: 'Your WhatsApp settings have been updated.',
    });
  };
  
  const handleSeedDatabase = async () => {
      setIsSeeding(true);
      const result = await seedDatabase();
      if (result.success) {
          toast({
              title: "Database Seeding",
              description: result.message,
          });
      } else {
          toast({
              variant: "destructive",
              title: "Database Seeding Failed",
              description: result.message,
          });
      }
      setIsSeeding(false);
  }

  const handleGenerateFees = async () => {
    setIsGeneratingFees(true);
    const result = await resetMonthlyFees();
    if (result.success) {
        toast({
            title: "Monthly Fees Generated",
            description: result.message,
        });
        refreshData();
    } else {
        toast({
            variant: "destructive",
            title: "Fee Generation Failed",
            description: result.message,
        });
    }
    setIsGeneratingFees(false);
  };

  const handleTestApi = async () => {
    if (!testPhoneNumber.trim()) {
        toast({ variant: 'destructive', title: 'API Test Failed', description: 'Please enter a phone number to send a test message to.' });
        return;
    }

    setIsTestingApi(true);
    setTestResult(null);

    const academyName = settings.name || 'My Academy';
    const apiUrl = whatsappProvider === 'ultramsg' ? ultraMsgApiUrl : officialApiUrl;
    const token = whatsappProvider === 'ultramsg' ? ultraMsgToken : officialApiToken;
    
    try {
        const result = await sendWhatsappMessage({
            to: testPhoneNumber,
            body: `This is a test message from your ${academyName} setup.`,
            apiUrl: apiUrl,
            token: token
        });

        if (result.success) {
            setTestResult({ status: 'success', message: `Test message sent to ${testPhoneNumber}. API connected successfully!`});
            toast({ title: 'API Test Successful', description: `A test message has been sent to ${testPhoneNumber}.` });
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred.';
        setTestResult({ status: 'error', message: `Connection failed: ${errorMessage}`});
        toast({ variant: 'destructive', title: 'API Test Failed', description: errorMessage });
    }

    setIsTestingApi(false);
  }

  const handleSendCustomMessage = async () => {
    if (!customMessage.trim()) {
      toast({ variant: 'destructive', title: 'Message Empty', description: 'Cannot send an empty message.' });
      return;
    }

    setIsSendingCustom(true);
    let targetNumbers: string[] = [];

    switch (customMessageTarget) {
      case 'all_classes':
        targetNumbers = students.map(s => s.phone).filter(Boolean);
        break;
      case 'specific_class':
        if (!specificClass) {
          toast({ variant: 'destructive', title: 'No Class Selected', description: 'Please select a class to send the message to.' });
          setIsSendingCustom(false);
          return;
        }
        const className = classes.find(c => c.id === specificClass)?.name;
        targetNumbers = students.filter(s => s.class === className).map(s => s.phone).filter(Boolean);
        break;
      case 'specific_student':
        const student = students.find(s => s.id.toLowerCase() === specificStudent.toLowerCase());
        if (!student || !student.phone) {
          toast({ variant: 'destructive', title: 'Student Not Found', description: 'Could not find a student with that roll number or the student has no phone number.' });
          setIsSendingCustom(false);
          return;
        }
        targetNumbers = [student.phone];
        break;
      case 'all_teachers':
        targetNumbers = teachers.map(t => t.phone).filter(Boolean);
        break;
      case 'specific_teacher':
        const teacher = teachers.find(t => t.id === specificTeacher);
        if (!teacher || !teacher.phone) {
          toast({ variant: 'destructive', title: 'Teacher Not Found', description: 'Could not find the selected teacher or the teacher has no phone number.' });
          setIsSendingCustom(false);
          return;
        }
        targetNumbers = [teacher.phone];
        break;
      case 'custom_numbers':
        targetNumbers = customNumbers.split(',').map(n => n.trim()).filter(Boolean);
        break;
    }
    
    const uniqueNumbers = [...new Set(targetNumbers)];

    if (uniqueNumbers.length === 0) {
      toast({ variant: 'destructive', title: 'No Recipients', description: 'No valid phone numbers found for the selected target.' });
      setIsSendingCustom(false);
      return;
    }

    const apiUrl = whatsappProvider === 'ultramsg' ? ultraMsgApiUrl : officialApiUrl;
    const token = whatsappProvider === 'ultramsg' ? ultraMsgToken : officialApiToken;

    toast({ title: `Sending ${uniqueNumbers.length} messages...`, description: 'This may take a moment.' });
    
    let successCount = 0;
    let errorCount = 0;

    for (const number of uniqueNumbers) {
      try {
        const result = await sendWhatsappMessage({ to: number, body: customMessage, apiUrl, token });
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch {
        errorCount++;
      }
    }

    toast({
      title: 'Bulk Messaging Complete',
      description: `${successCount} messages sent successfully. ${errorCount} failed.`,
    });

    setIsSendingCustom(false);
  }
  
  return (
    <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your academy's settings and preferences.
          </p>
        </div>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-7">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance"> <Palette className="mr-2 h-4 w-4"/> Appearance</TabsTrigger>
            <TabsTrigger value="security"> <ShieldCheck className="mr-2 h-4 w-4"/> Security</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="history"> <History className="mr-2 h-4 w-4"/> History</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <Card className='max-w-2xl'>
                <CardHeader>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>Update your academy's public details and appearance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isSettingsLoading ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                       <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                          <Label htmlFor="name">Academy Name</Label>
                          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                       <div className="space-y-2">
                          <Label>Academic Session</Label>
                          <Select value={academicSession} onValueChange={setAcademicSession}>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select session" />
                              </SelectTrigger>
                              <SelectContent>
                                  {academicSessions.map(session => (
                                      <SelectItem key={session} value={session}>{session}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="logo-url">Academy Logo URL</Label>
                           <div className='flex items-center gap-4'>
                              <div className='w-20 h-20 rounded-full border flex items-center justify-center bg-muted overflow-hidden'>
                                  {logo ? <img src={logo} alt="logo" className='object-cover w-full h-full' /> : <span className="text-xs text-muted-foreground">No Logo</span>}
                              </div>
                              <Input id="logo-url" placeholder="https://example.com/logo.png" value={logo} onChange={(e) => setLogo(e.target.value)} />
                          </div>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveGeneral} disabled={isSaving || isSettingsLoading}>
                      {isSaving && <Loader2 className="mr-2 animate-spin" />}
                      {isSaving ? 'Saving...' : 'Save General Settings'}
                    </Button>
                </CardFooter>
            </Card>
          </TabsContent>
           <TabsContent value="appearance">
            <Card className='max-w-4xl'>
                <CardHeader>
                    <CardTitle>Application Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div>
                        <Label className="text-base font-semibold">Preloader Style</Label>
                        <p className="text-sm text-muted-foreground mb-4">Select the loading animation that appears when the application is loading data.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {Array.from({ length: 15 }, (_, i) => `style-${i + 1}`).map(style => (
                                <Card 
                                    key={style} 
                                    className={cn(
                                        "cursor-pointer hover:border-primary",
                                        preloaderStyle === style && "border-primary border-2"
                                    )}
                                    onClick={() => setPreloaderStyle(style)}
                                >
                                    <CardContent className="flex items-center justify-center p-6 h-32">
                                        <Preloader style={style as any} />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveAppearance} disabled={isSaving || isSettingsLoading}>
                        {isSaving && <Loader2 className="mr-2 animate-spin" />}
                        Save Appearance Settings
                    </Button>
                </CardFooter>
            </Card>
          </TabsContent>
           <TabsContent value="security">
            <Card className='max-w-2xl'>
                <CardHeader>
                    <CardTitle>Auto-Lock Security</CardTitle>
                    <CardDescription>Protect your application from unauthorized access by enabling an automatic lock screen.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label htmlFor="auto-lock-switch" className="font-semibold">Enable Auto-Lock</Label>
                        <p className="text-sm text-muted-foreground">Automatically lock the application after a period of inactivity.</p>
                      </div>
                      <Switch id="auto-lock-switch" checked={autoLockEnabled} onCheckedChange={setAutoLockEnabled} />
                    </div>
                    {autoLockEnabled && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="security-pin">Security PIN (4 digits)</Label>
                          <InputOTP
                            maxLength={4}
                            value={securityPin}
                            onChange={(value) => {
                                if (/^\d*$/.test(value) && value.length <= 4) {
                                    setSecurityPin(value);
                                }
                            }}
                           >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} isPin />
                                <InputOTPSlot index={1} isPin />
                                <InputOTPSlot index={2} isPin />
                                <InputOTPSlot index={3} isPin />
                            </InputOTPGroup>
                          </InputOTP>
                          <p className="text-xs text-muted-foreground">This PIN will be required to unlock the application.</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lock-timeout">Inactivity Timeout (seconds)</Label>
                          <Input id="lock-timeout" type="number" value={autoLockTimeout} onChange={(e) => setAutoLockTimeout(Number(e.target.value))} placeholder="e.g., 300" />
                          <p className="text-xs text-muted-foreground">The time in seconds before the application locks automatically.</p>
                        </div>
                      </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveSecurity} disabled={isSaving || isSettingsLoading}>
                      {isSaving && <Loader2 className="mr-2 animate-spin" />}
                      {isSaving ? 'Saving...' : 'Save Security Settings'}
                    </Button>
                </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="data">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Access and manage historical student data and other data-related tasks.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Link href="/alumni" className="block">
                  <div className="rounded-lg border p-4 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-2 rounded-md">
                        <GraduationCap className="h-6 w-6"/>
                      </div>
                      <div>
                        <h3 className="font-semibold">Alumni Records</h3>
                        <p className="text-sm text-muted-foreground">View students who have graduated.</p>
                      </div>
                    </div>
                  </div>
                </Link>
                <Link href="/archive" className="block">
                  <div className="rounded-lg border p-4 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-2 rounded-md">
                        <Archive className="h-6 w-6"/>
                      </div>
                      <div>
                        <h3 className="font-semibold">Archived Students</h3>
                        <p className="text-sm text-muted-foreground">Manage students pending deletion.</p>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                          <div className="bg-primary/10 text-primary p-2 rounded-md">
                            <DollarSign className="h-6 w-6"/>
                          </div>
                          <div>
                            <h3 className="font-semibold">Generate Monthly Fees</h3>
                            <p className="text-sm text-muted-foreground">Add monthly fee to all active students' balances.</p>
                          </div>
                        </div>
                        <Button onClick={handleGenerateFees} disabled={isGeneratingFees}>
                            {isGeneratingFees && <Loader2 className="mr-2 animate-spin" />}
                            Generate Fees
                        </Button>
                    </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="whatsapp">
            <div className="grid gap-6 max-w-4xl">
              <Card>
                <CardHeader>
                    <CardTitle>WhatsApp API Integration</CardTitle>
                    <CardDescription>Connect to a WhatsApp provider to send automated messages. Choose one provider to be active at a time.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <RadioGroup value={whatsappProvider} onValueChange={setWhatsappProvider} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Label htmlFor="provider-ultramsg" className={cn("rounded-lg border p-4 cursor-pointer", whatsappProvider === 'ultramsg' && 'border-primary ring-2 ring-primary')}>
                          <div className="flex items-center justify-between">
                              <span className="font-bold">UltraMSG API</span>
                              <RadioGroupItem value="ultramsg" id="provider-ultramsg" />
                          </div>
                      </Label>
                      <Label htmlFor="provider-official" className={cn("rounded-lg border p-4 cursor-pointer", whatsappProvider === 'official' && 'border-primary ring-2 ring-primary')}>
                          <div className="flex items-center justify-between">
                               <span className="font-bold">Official WhatsApp API</span>
                              <RadioGroupItem value="official" id="provider-official" />
                          </div>
                      </Label>
                    </RadioGroup>

                    {whatsappProvider === 'ultramsg' && (
                        <Card>
                            <CardHeader><CardTitle>UltraMSG API Settings</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ultra-api-url">API Url</Label>
                                    <Input id="ultra-api-url" value={ultraMsgApiUrl} onChange={e => setUltraMsgApiUrl(e.target.value)} placeholder="e.g., https://api.ultramsg.com/instance12345" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ultra-token">Token</Label>
                                    <Input id="ultra-token" type="password" value={ultraMsgToken} onChange={e => setUltraMsgToken(e.target.value)} placeholder="Enter your UltraMSG token" />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                    {whatsappProvider === 'official' && (
                         <Card>
                            <CardHeader><CardTitle>Official WhatsApp API Settings</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="official-api-url">API URL / Account SID</Label>
                                    <Input id="official-api-url" value={officialApiUrl} onChange={e => setOfficialApiUrl(e.target.value)} placeholder="Enter Account SID or API endpoint" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="official-token">Auth Token</Label>
                                    <Input id="official-token" type="password" value={officialApiToken} onChange={e => setOfficialApiToken(e.target.value)} placeholder="Enter your Auth Token" />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {whatsappProvider !== 'none' && (
                      <>
                        <div className="space-y-2">
                            <Label htmlFor="test-phone-ultra">Test Phone Number</Label>
                            <Input id="test-phone-ultra" value={testPhoneNumber} onChange={e => setTestPhoneNumber(e.target.value)} placeholder="e.g., 923001234567" />
                        </div>
                        <Button onClick={handleTestApi} disabled={isTestingApi}>
                            {isTestingApi ? <Loader2 className="mr-2 animate-spin" /> : <Wifi className='mr-2'/>}
                            Test API
                        </Button>
                      </>
                    )}
                    
                    {testResult && (
                        <Alert variant={testResult.status === 'error' ? 'destructive' : 'default'}>
                            <Wifi className="h-4 w-4" />
                            <AlertTitle>{testResult.status === 'success' ? 'Connection Successful' : 'Connection Failed'}</AlertTitle>
                            <AlertDescription>{testResult.message}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveWhatsApp} disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 animate-spin" />}
                      {isSaving ? 'Saving...' : 'Save API Settings'}
                    </Button>
                </CardFooter>
              </Card>

               <Card>
                <CardHeader>
                  <CardTitle>Custom Messaging</CardTitle>
                  <CardDescription>Send bulk custom messages to selected groups.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Send To:</Label>
                        <RadioGroup value={customMessageTarget} onValueChange={(v) => setCustomMessageTarget(v as any)} className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all_classes" id="all_classes" />
                                <Label htmlFor="all_classes">All Classes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="specific_class" id="specific_class" />
                                <Label htmlFor="specific_class">Specific Class</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="specific_student" id="specific_student" />
                                <Label htmlFor="specific_student">Specific Student</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all_teachers" id="all_teachers" />
                                <Label htmlFor="all_teachers">All Teachers</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="specific_teacher" id="specific_teacher" />
                                <Label htmlFor="specific_teacher">Specific Teacher</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="custom_numbers" id="custom_numbers" />
                                <Label htmlFor="custom_numbers">Custom Numbers</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {customMessageTarget === 'specific_class' && (
                        <div className="space-y-2">
                            <Label htmlFor="specific-class-select">Select Class</Label>
                            <Select value={specificClass} onValueChange={setSpecificClass}>
                                <SelectTrigger id="specific-class-select">
                                    <SelectValue placeholder="Select a class..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {customMessageTarget === 'specific_student' && (
                        <div className="space-y-2">
                            <Label htmlFor="specific-student-input">Student Roll Number</Label>
                            <Input id="specific-student-input" value={specificStudent} onChange={(e) => setSpecificStudent(e.target.value)} placeholder="Enter student roll number..." />
                        </div>
                    )}
                    {customMessageTarget === 'specific_teacher' && (
                         <div className="space-y-2">
                            <Label htmlFor="specific-teacher-select">Select Teacher</Label>
                            <Select value={specificTeacher} onValueChange={setSpecificTeacher}>
                                <SelectTrigger id="specific-teacher-select">
                                    <SelectValue placeholder="Select a teacher..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                     {customMessageTarget === 'custom_numbers' && (
                        <div className="space-y-2">
                            <Label htmlFor="custom-numbers-input">Custom Phone Numbers</Label>
                             <Textarea id="custom-numbers-input" value={customNumbers} onChange={(e) => setCustomNumbers(e.target.value)} placeholder="Enter phone numbers, separated by commas..."/>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="custom-message">Message</Label>
                        <Textarea id="custom-message" value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="Type your message here..." className="min-h-[120px]" />
                        <p className="text-xs text-muted-foreground">Variables: {'{student_name}'}, {'{father_name}'}, {'{teacher_name}'}, {'{class}'}, {'{school_name}'}</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Quick Templates</Label>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCustomMessage(absentTemplate)}>Absentee Notice</Button>
                            <Button variant="outline" size="sm" onClick={() => setCustomMessage(paymentReceiptTemplate)}>Fee Payment Receipt</Button>
                            <Button variant="outline" size="sm" onClick={() => setCustomMessage(newAdmissionTemplate)}>Admission Confirmation</Button>
                            <Button variant="outline" size="sm" onClick={() => setCustomMessage('Your child {student_name} has been marked inactive.')}>Student Deactivation Notice</Button>
                            <Button variant="outline" size="sm" onClick={() => setCustomMessage('Dear {teacher_name}, your account has been deactivated.')}>Teacher Deactivation Notice</Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSendCustomMessage} disabled={isSendingCustom}>
                        {isSendingCustom && <Loader2 className="mr-2 animate-spin" />}
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                    </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Automated Notifications</CardTitle>
                  <CardDescription>Enable/disable and customize automated messages for specific events.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="space-y-4 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base font-semibold">Admission Confirmation</Label>
                                <p className="text-sm text-muted-foreground">Sent to the parent/student upon new admission.</p>
                            </div>
                            <Switch checked={newAdmissionMsg} onCheckedChange={setNewAdmissionMsg} />
                        </div>
                        {newAdmissionMsg && <Textarea value={newAdmissionTemplate} onChange={e => setNewAdmissionTemplate(e.target.value)} placeholder="e.g. Welcome {student_name} to {academy_name}! Your Roll No is {student_id}." />}
                    </div>

                    <div className="space-y-4 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base font-semibold">Student Absentee Notice</Label>
                                <p className="text-sm text-muted-foreground">Sent when a student is marked absent.</p>
                            </div>
                            <Switch checked={absentMsg} onCheckedChange={setAbsentMsg} />
                        </div>
                        {absentMsg && <Textarea value={absentTemplate} onChange={e => setAbsentTemplate(e.target.value)} placeholder="e.g. Dear parent, your child {student_name} (Roll No: {student_id}) was absent today." />}
                    </div>
                    
                    <div className="space-y-4 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base font-semibold">Teacher Absentee Notice</Label>
                                <p className="text-sm text-muted-foreground">Sent when a teacher is marked absent.</p>
                            </div>
                            <Switch checked={teacherAbsentMsg} onCheckedChange={setTeacherAbsentMsg} />
                        </div>
                        {teacherAbsentMsg && <Textarea value={teacherAbsentTemplate} onChange={e => setTeacherAbsentTemplate(e.target.value)} placeholder="e.g. Dear {teacher_name}, you were marked absent today. Please contact administration if this is an error." />}
                    </div>

                    <div className="space-y-4 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base font-semibold">Fee Payment Receipt</Label>
                                <p className="text-sm text-muted-foreground">Sent after a fee payment is collected.</p>
                            </div>
                            <Switch checked={paymentReceiptMsg} onCheckedChange={setPaymentReceiptMsg} />
                        </div>
                        {paymentReceiptMsg && <Textarea value={paymentReceiptTemplate} onChange={e => setPaymentReceiptTemplate(e.target.value)} placeholder="e.g. Dear parent, we have received a payment of {amount} for {student_name}. Thank you!" />}
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button onClick={handleSaveWhatsApp} disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 animate-spin" />}
                      {isSaving ? 'Saving...' : 'Save Template Settings'}
                    </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="history">
            <HistoryTab />
          </TabsContent>
           <TabsContent value="database">
             <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Database Management</CardTitle>
                    <CardDescription>Handle database-related administrative tasks.</CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label className="font-semibold">Seed Database</Label>
                        <div className="flex items-center justify-between rounded-md border p-3">
                           <p className="text-sm text-muted-foreground">Populate your Firestore database with initial dummy data. This is useful for first-time setup or for testing purposes. This action is not reversible.</p>
                            <Button variant="secondary" onClick={handleSeedDatabase} disabled={isSeeding}>
                                <Database className='mr-2'/>
                                {isSeeding ? 'Seeding...' : 'Seed Database'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
    </div>
  )
}

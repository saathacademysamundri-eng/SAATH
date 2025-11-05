

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
import { Database, Loader2, Palette, Wifi, MessageSquarePlus, Send, Globe, LayoutTemplate, ShieldCheck } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { seedDatabase } from '@/lib/firebase/firestore';
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

export default function SettingsPage() {
  const { settings, updateSettings, isSettingsLoading } = useSettings();
  const { classes, loading: appLoading } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

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
  const [newAdmissionTemplate, setNewAdmissionTemplate] = useState('');
  const [absentTemplate, setAbsentTemplate] = useState('');
  const [paymentReceiptTemplate, setPaymentReceiptTemplate] = useState('');
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [testResult, setTestResult] = useState<{status: 'success' | 'error', message: string} | null>(null);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');


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
      setNewAdmissionTemplate(settings.newAdmissionTemplate);
      setAbsentTemplate(settings.absentTemplate);
      setPaymentReceiptTemplate(settings.paymentReceiptTemplate);
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
    await updateSettings({ name, address, phone, logo, academicSession });
    setIsSaving(false);
    toast({
      title: 'Settings Saved',
      description: 'Your general settings have been updated.',
    });
  };

  const handleSaveAppearance = async () => {
    setIsSaving(true);
    await updateSettings({ preloaderStyle });
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
    await updateSettings({ autoLockEnabled, autoLockTimeout, securityPin });
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
        newAdmissionTemplate,
        absentTemplate,
        paymentReceiptTemplate,
    });
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
  
  return (
    <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your academy's settings and preferences.
          </p>
        </div>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full max-w-xl grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance"> <Palette className="mr-2 h-4 w-4"/> Appearance</TabsTrigger>
            <TabsTrigger value="security"> <ShieldCheck className="mr-2 h-4 w-4"/> Security</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
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
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
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
                        <RadioGroup defaultValue="all_families" className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all_families" id="all_families" />
                                <Label htmlFor="all_families">All Families</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="specific_class" id="specific_class" />
                                <Label htmlFor="specific_class">Specific Class</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="specific_family" id="specific_family" />
                                <Label htmlFor="specific_family">Specific Family</Label>
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
                    <div className="space-y-2">
                        <Label htmlFor="custom-message">Message</Label>
                        <Textarea id="custom-message" placeholder="Type your message here..." className="min-h-[120px]" />
                        <p className="text-xs text-muted-foreground">Variables: {'{student_name}'}, {'{father_name}'}, {'{teacher_name}'}, {'{class}'}, {'{school_name}'}</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Quick Templates</Label>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm">Absentee Notice</Button>
                            <Button variant="outline" size="sm">Fee Payment Receipt</Button>
                            <Button variant="outline" size="sm">Admission Confirmation</Button>
                            <Button variant="outline" size="sm">Student Deactivation Notice</Button>
                            <Button variant="outline" size="sm">Teacher Deactivation Notice</Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button>
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
                <CardContent className="space-y-2">
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
                                <Label className="text-base font-semibold">Absentee Notice</Label>
                                <p className="text-sm text-muted-foreground">Sent when a student is marked absent.</p>
                            </div>
                            <Switch checked={absentMsg} onCheckedChange={setAbsentMsg} />
                        </div>
                        {absentMsg && <Textarea value={absentTemplate} onChange={e => setAbsentTemplate(e.target.value)} placeholder="e.g. Dear parent, your child {student_name} (Roll No: {student_id}) was absent today." />}
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
           <TabsContent value="database">
             <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Database Management</CardTitle>
                    <CardDescription>Handle database-related administrative tasks.</CardDescription>
                </CardHeader>
                 <CardContent>
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

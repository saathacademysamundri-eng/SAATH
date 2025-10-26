

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
import { Database, Loader2, TestTube2, Wifi, MessageSquarePlus, Send, Palette } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { seedDatabase } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAppContext } from '@/hooks/use-app-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Preloader } from '@/components/ui/preloader';
import { cn } from '@/lib/utils';
import { sendWhatsappMessage } from '@/ai/flows/send-whatsapp-flow';
import { ColorPicker } from '@/components/color-picker';
import Link from 'next/link';

export default function SettingsPage() {
  const { settings, updateSettings, isSettingsLoading } = useSettings();
  const { classes, loading: appLoading } = useAppContext();
  const { toast } = useToast();

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
  const [sidebarBg, setSidebarBg] = useState('');
  const [sidebarFg, setSidebarFg] = useState('');
  const [sidebarAccent, setSidebarAccent] = useState('');
  const [sidebarAccentFg, setSidebarAccentFg] = useState('');


  // WhatsApp State
  const [ultraMsgEnabled, setUltraMsgEnabled] = useState(false);
  const [officialApiEnabled, setOfficialApiEnabled] = useState(false);
  const [ultraMsgApiUrl, setUltraMsgApiUrl] = useState('');
  const [ultraMsgToken, setUltraMsgToken] = useState('');
  const [officialApiNumberId, setOfficialApiNumberId] = useState('');
  const [officialApiToken, setOfficialApiToken] = useState('');
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [testResult, setTestResult] = useState<{status: 'success' | 'error', message: string} | null>(null);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');

  const [newAdmissionMsg, setNewAdmissionMsg] = useState(true);
  const [absentMsg, setAbsentMsg] = useState(true);
  const [paymentReceiptMsg, setPaymentReceiptMsg] = useState(true);

  const [newAdmissionTemplate, setNewAdmissionTemplate] = useState('');
  const [absentTemplate, setAbsentTemplate] = useState('');
  const [paymentReceiptTemplate, setPaymentReceiptTemplate] = useState('');
  
  const [customMessage, setCustomMessage] = useState('');
  const [customMessageAudience, setCustomMessageAudience] = useState('all_students');
  const [specificSearch, setSpecificSearch] = useState('');
  const [customNumbers, setCustomNumbers] = useState('');
  const [selectedClassForCustomMessage, setSelectedClassForCustomMessage] = useState('');
  const [isSendingCustom, setIsSendingCustom] = useState(false);


  useEffect(() => {
    if (!isSettingsLoading) {
      setName(settings.name);
      setAddress(settings.address);
      setPhone(settings.phone);
      setLogo(settings.logo);
      setAcademicSession(settings.academicSession);
      setPreloaderStyle(settings.preloaderStyle);

      // Appearance
      setSidebarBg(settings.sidebarBg || '240 10% 10%');
      setSidebarFg(settings.sidebarFg || '0 0% 98%');
      setSidebarAccent(settings.sidebarAccent || '240 10% 20%');
      setSidebarAccentFg(settings.sidebarAccentFg || '0 0% 98%');
      
      // WhatsApp settings
      setUltraMsgEnabled(settings.ultraMsgEnabled);
      setOfficialApiEnabled(settings.officialApiEnabled);
      setUltraMsgApiUrl(settings.ultraMsgApiUrl);
      setUltraMsgToken(settings.ultraMsgToken);
      setOfficialApiNumberId(settings.officialApiNumberId);
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

    document.documentElement.style.setProperty('--sidebar-background', sidebarBg);
    document.documentElement.style.setProperty('--sidebar-foreground', sidebarFg);
    document.documentElement.style.setProperty('--sidebar-accent', sidebarAccent);
    document.documentElement.style.setProperty('--sidebar-accent-foreground', sidebarAccentFg);

    await updateSettings({ 
        preloaderStyle,
        sidebarBg,
        sidebarFg,
        sidebarAccent,
        sidebarAccentFg
    });
    setIsSaving(false);
    toast({
      title: 'Appearance Saved',
      description: 'Your appearance settings have been updated.',
    });
  }

  const handleSaveWhatsApp = async () => {
    setIsSaving(true);
    await updateSettings({
        ultraMsgEnabled,
        officialApiEnabled,
        ultraMsgApiUrl,
        ultraMsgToken,
        officialApiNumberId,
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

  const handleTestApi = async (api: 'ultra' | 'official') => {
    if (!testPhoneNumber.trim()) {
        toast({ variant: 'destructive', title: 'API Test Failed', description: 'Please enter a phone number to send a test message to.' });
        return;
    }

    setIsTestingApi(true);
    setTestResult(null);

    const apiUrl = api === 'ultra' ? ultraMsgApiUrl : ''; // Official API URL is not needed for this simplified logic
    const token = api === 'ultra' ? ultraMsgToken : officialApiToken;
    const academyName = settings.name || 'My Academy';
    
    try {
        const result = await sendWhatsappMessage({
            to: testPhoneNumber,
            body: `This is a test message from your ${academyName} setup.`,
            apiUrl,
            token
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
      toast({ variant: 'destructive', title: 'Error', description: 'Message cannot be empty.' });
      return;
    }
    
    // For now, only implementing for "Custom Numbers" to prove the concept.
    if (customMessageAudience !== 'custom_numbers' || !customNumbers.trim()) {
      toast({ variant: 'destructive', title: 'Not Implemented', description: 'Custom messaging is currently only implemented for the "Custom Numbers" option.' });
      return;
    }

    setIsSendingCustom(true);
    
    const numbers = customNumbers.split(',').map(n => n.trim()).filter(n => n);
    let successCount = 0;
    let errorCount = 0;

    const apiUrl = ultraMsgEnabled ? ultraMsgApiUrl : '';
    const token = ultraMsgEnabled ? ultraMsgToken : officialApiToken;

    for (const number of numbers) {
      try {
        const result = await sendWhatsappMessage({
            to: number,
            body: customMessage,
            apiUrl,
            token
        });
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    toast({
      title: "Bulk Message Sent",
      description: `Successfully sent ${successCount} messages. Failed to send ${errorCount} messages.`,
    });

    setIsSendingCustom(false);
  }
  
  const initialAdmissionTemplate = 'Welcome {student_name} to {academy_name}! Your Roll No is {student_id}.';
  const initialAbsentTemplate = 'Dear parent, your child {student_name} (Roll No: {student_id}) was absent today.';
  const initialPaymentReceiptTemplate = 'Dear parent, we have received a payment of {amount} for {student_name}. Thank you!';

  const quickTemplates = {
    'Absentee Notice': initialAbsentTemplate,
    'Fee Payment Receipt': initialPaymentReceiptTemplate,
    'Admission Confirmation': initialAdmissionTemplate,
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
          <TabsList className="grid w-full max-w-lg grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="api">API & Database</TabsTrigger>
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
          <TabsContent value="whatsapp">
            <div className="grid gap-6 max-w-4xl">
              <Card>
                <CardHeader>
                    <CardTitle>WhatsApp API Integration</CardTitle>
                    <CardDescription>Connect to a WhatsApp provider to send automated messages.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Card className={ultraMsgEnabled ? 'border-primary' : ''}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>UltraMSG API</CardTitle>
                                <Switch checked={ultraMsgEnabled} onCheckedChange={(checked) => { setUltraMsgEnabled(checked); if(checked) setOfficialApiEnabled(false); }} />
                            </div>
                        </CardHeader>
                        {ultraMsgEnabled && (
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ultra-api-url">API Url</Label>
                                    <Input id="ultra-api-url" value={ultraMsgApiUrl} onChange={e => setUltraMsgApiUrl(e.target.value)} placeholder="e.g., https://api.ultramsg.com/instance12345" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ultra-token">Token</Label>
                                    <Input id="ultra-token" type="password" value={ultraMsgToken} onChange={e => setUltraMsgToken(e.target.value)} placeholder="Enter your UltraMSG token" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="test-phone-ultra">Test Phone Number</Label>
                                    <Input id="test-phone-ultra" value={testPhoneNumber} onChange={e => setTestPhoneNumber(e.target.value)} placeholder="e.g., 923001234567" />
                                </div>
                                <Button onClick={() => handleTestApi('ultra')} disabled={isTestingApi}>
                                    {isTestingApi ? <Loader2 className="mr-2 animate-spin" /> : <TestTube2 className='mr-2'/>}
                                    Test API
                                </Button>
                            </CardContent>
                        )}
                    </Card>
                     <Card className={officialApiEnabled ? 'border-primary' : ''}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Official WhatsApp API</CardTitle>
                                <Switch checked={officialApiEnabled} onCheckedChange={(checked) => { setOfficialApiEnabled(checked); if(checked) setUltraMsgEnabled(false); }} />
                            </div>
                        </CardHeader>
                        {officialApiEnabled && (
                             <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="official-number-id">Phone Number ID</Label>
                                    <Input id="official-number-id" value={officialApiNumberId} onChange={e => setOfficialApiNumberId(e.target.value)} placeholder="e.g., 1029384756" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="official-token">Permanent Access Token</Label>
                                    <Input id="official-token" type="password" value={officialApiToken} onChange={e => setOfficialApiToken(e.target.value)} placeholder="Enter your permanent access token" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="test-phone-official">Test Phone Number</Label>
                                    <Input id="test-phone-official" value={testPhoneNumber} onChange={e => setTestPhoneNumber(e.target.value)} placeholder="e.g., 923001234567" />
                                </div>
                                <Button onClick={() => handleTestApi('official')} disabled={isTestingApi}>
                                     {isTestingApi ? <Loader2 className="mr-2 animate-spin" /> : <TestTube2 className='mr-2'/>}
                                    Test API
                                </Button>
                            </CardContent>
                        )}
                    </Card>

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
                    <CardTitle>Automated Notifications</CardTitle>
                    <CardDescription>Enable/disable automated messages for specific events. Use placeholders like {"{student_name}"}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="new-admission-switch" className="font-medium">Admission Confirmation</Label>
                                <p className="text-sm text-muted-foreground">Sent on new admission.</p>
                            </div>
                            <Switch id="new-admission-switch" checked={newAdmissionMsg} onCheckedChange={setNewAdmissionMsg} />
                        </div>
                        {newAdmissionMsg && (
                            <div className="space-y-2 pt-4 border-t">
                                <Label htmlFor="new-admission-template">Message Template</Label>
                                <Textarea id="new-admission-template" value={newAdmissionTemplate} onChange={e => setNewAdmissionTemplate(e.target.value)} />
                            </div>
                        )}
                    </div>
                     <div className="space-y-4 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="absent-switch" className="font-medium">Absentee Notice</Label>
                                <p className="text-sm text-muted-foreground">Sent when a student is marked absent.</p>
                            </div>
                            <Switch id="absent-switch" checked={absentMsg} onCheckedChange={setAbsentMsg} />
                        </div>
                        {absentMsg && (
                            <div className="space-y-2 pt-4 border-t">
                                <Label htmlFor="absent-template">Message Template</Label>
                                <Textarea id="absent-template" value={absentTemplate} onChange={e => setAbsentTemplate(e.target.value)} />
                            </div>
                        )}
                    </div>
                     <div className="space-y-4 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="payment-receipt-switch" className="font-medium">Payment Receipt</Label>
                                <p className="text-sm text-muted-foreground">Sent after a fee payment is recorded.</p>
                            </div>
                            <Switch id="payment-receipt-switch" checked={paymentReceiptMsg} onCheckedChange={setPaymentReceiptMsg} />
                        </div>
                        {paymentReceiptMsg && (
                            <div className="space-y-2 pt-4 border-t">
                                <Label htmlFor="payment-receipt-template">Message Template</Label>
                                <Textarea id="payment-receipt-template" value={paymentReceiptTemplate} onChange={e => setPaymentReceiptTemplate(e.target.value)} />
                            </div>
                        )}
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button onClick={handleSaveWhatsApp} disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 animate-spin" />}
                      {isSaving ? 'Saving...' : 'Save Notification Settings'}
                    </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquarePlus />
                        Custom Messaging
                    </CardTitle>
                    <CardDescription>Send a one-time message to a specific group of users.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label className="mb-2 block">Send To:</Label>
                        <RadioGroup value={customMessageAudience} onValueChange={setCustomMessageAudience} className="flex flex-wrap gap-x-6 gap-y-2">
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all_students" id="all_students" />
                                <Label htmlFor="all_students" className="font-normal">All Students</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="specific_class" id="specific_class" />
                                <Label htmlFor="specific_class" className="font-normal">Specific Class</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="specific_student" id="specific_student" />
                                <Label htmlFor="specific_student" className="font-normal">Specific Student</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all_teachers" id="all_teachers" />
                                <Label htmlFor="all_teachers" className="font-normal">All Teachers</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="specific_teacher" id="specific_teacher" />
                                <Label htmlFor="specific_teacher" className="font-normal">Specific Teacher</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="custom_numbers" id="custom_numbers" />
                                <Label htmlFor="custom_numbers" className="font-normal">Custom Numbers</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {customMessageAudience === 'specific_class' && (
                        <div className="space-y-2">
                            <Label>Select Class</Label>
                            <Select onValueChange={setSelectedClassForCustomMessage} disabled={appLoading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a class..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {customMessageAudience === 'specific_student' && (
                        <div className="space-y-2">
                            <Label>Search Student</Label>
                            <Input value={specificSearch} onChange={e => setSpecificSearch(e.target.value)} placeholder="Enter student name or roll #..." />
                        </div>
                    )}
                    {customMessageAudience === 'specific_teacher' && (
                        <div className="space-y-2">
                            <Label>Search Teacher</Label>
                            <Input value={specificSearch} onChange={e => setSpecificSearch(e.target.value)} placeholder="Enter teacher name or ID..." />
                        </div>
                    )}
                    {customMessageAudience === 'custom_numbers' && (
                        <div className="space-y-2">
                            <Label>Custom Numbers</Label>
                            <Textarea value={customNumbers} onChange={e => setCustomNumbers(e.target.value)} placeholder="Enter numbers separated by commas, e.g., 923001234567,923017654321" />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="custom-message">Message</Label>
                        <Textarea id="custom-message" value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="Type your message here..." className="min-h-[150px]"/>
                         <p className="text-xs text-muted-foreground">
                            Variables: {"{student_name}, {father_name}, {teacher_name}, {class}, {academy_name}"}
                        </p>
                    </div>

                    <div>
                        <Label>Quick Templates</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(quickTemplates).map(([name, template]) => (
                                <Button key={name} variant="outline" size="sm" onClick={() => setCustomMessage(template)}>
                                    {name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleSendCustomMessage} disabled={isSendingCustom}>
                        {isSendingCustom ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        {isSendingCustom ? 'Sending...' : 'Send Message'}
                    </Button>
                </CardFooter>
              </Card>

            </div>
          </TabsContent>
          <TabsContent value="admin">
              <Card className='max-w-2xl'>
                <CardHeader>
                    <CardTitle>Admin Settings</CardTitle>
                    <CardDescription>This section is for managing administrator credentials. For enhanced security, these actions should be performed directly in your Firebase Authentication console.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild variant="outline">
                        <Link href="/profile">Change Admin Password</Link>
                    </Button>
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="api">
             <Card className='max-w-2xl'>
                <CardHeader>
                    <CardTitle>API & Database</CardTitle>
                    <CardDescription>Manage API keys and database settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label>Database</Label>
                        <div className="flex items-center justify-between rounded-md border p-3">
                           <p className="text-sm">Seed your Firestore database with initial dummy data. This is useful for first-time setup or for testing.</p>
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

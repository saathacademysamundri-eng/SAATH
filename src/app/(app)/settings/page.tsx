
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
import { Database, Loader2, TestTube2, Wifi } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { seedDatabase } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SettingsPage() {
  const { settings, updateSettings, isSettingsLoading } = useSettings();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [logo, setLogo] = useState('');
  const [academicSession, setAcademicSession] = useState('');
  const [preloaderStyle, setPreloaderStyle] = useState('default');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // WhatsApp State
  const [ultraMsgEnabled, setUltraMsgEnabled] = useState(false);
  const [officialApiEnabled, setOfficialApiEnabled] = useState(false);
  const [ultraMsgInstance, setUltraMsgInstance] = useState('');
  const [ultraMsgToken, setUltraMsgToken] = useState('');
  const [officialApiNumberId, setOfficialApiNumberId] = useState('');
  const [officialApiToken, setOfficialApiToken] = useState('');
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [testResult, setTestResult] = useState<{status: 'success' | 'error', message: string} | null>(null);

  const [newAdmissionMsg, setNewAdmissionMsg] = useState(true);
  const [absentMsg, setAbsentMsg] = useState(true);
  const [newAdmissionTemplate, setNewAdmissionTemplate] = useState('Welcome {student_name} to {academy_name}! Your Roll No is {student_id}.');
  const [absentTemplate, setAbsentTemplate] = useState('Dear parent, your child {student_name} (Roll No: {student_id}) was absent today.');


  useEffect(() => {
    if (!isSettingsLoading) {
      setName(settings.name);
      setAddress(settings.address);
      setPhone(settings.phone);
      setLogo(settings.logo);
      setAcademicSession(settings.academicSession);
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

  const handleSaveChanges = async () => {
    setIsSaving(true);
    await updateSettings({ name, address, phone, logo, academicSession });
    setIsSaving(false);
    toast({
      title: 'Settings Saved',
      description: 'Your academy details have been updated.',
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
    setIsTestingApi(true);
    setTestResult(null);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (api === 'ultra' && ultraMsgInstance && ultraMsgToken) {
        setTestResult({ status: 'success', message: 'UltraMSG API connected successfully!'});
        toast({ title: 'API Test', description: 'Connection to UltraMSG was successful.' });
    } else if (api === 'official' && officialApiNumberId && officialApiToken) {
        setTestResult({ status: 'success', message: 'Official WhatsApp API connected successfully!'});
        toast({ title: 'API Test', description: 'Connection to Official WhatsApp API was successful.' });
    } else {
        setTestResult({ status: 'error', message: 'Connection failed. Please check your credentials.'});
        toast({ variant: 'destructive', title: 'API Test Failed', description: 'Please check your credentials and try again.' });
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
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
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
                       <div className="space-y-2">
                          <Label>Application Preloader Style</Label>
                          <Select value={preloaderStyle} onValueChange={setPreloaderStyle}>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select preloader" />
                              </SelectTrigger>
                              <SelectContent>
                                  {Array.from({length: 10}, (_, i) => `Style ${i + 1}`).map(style => (
                                      <SelectItem key={style} value={style.toLowerCase().replace(' ', '-')}>{style}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveChanges} disabled={isSaving || isSettingsLoading}>
                      {isSaving && <Loader2 className="mr-2 animate-spin" />}
                      {isSaving ? 'Saving...' : 'Save Changes'}
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
                                    <Label htmlFor="ultra-instance">Instance ID</Label>
                                    <Input id="ultra-instance" value={ultraMsgInstance} onChange={e => setUltraMsgInstance(e.target.value)} placeholder="e.g., instance12345" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ultra-token">Token</Label>
                                    <Input id="ultra-token" type="password" value={ultraMsgToken} onChange={e => setUltraMsgToken(e.target.value)} placeholder="Enter your UltraMSG token" />
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
                                <Button onClick={() => handleTestApi('official')} disabled={isTestingApi}>
                                     {isTestingApi ? <Loader2 className="mr-2 animate-spin" /> : <TestTube2 className='mr-2'/>}
                                    Test API
                                </Button>
                            </CardContent>
                        )}
                    </Card>

                    {testResult && (
                        <Alert variant={testResult.status === 'error' ? 'destructive' : 'default'}>
                            <Wifi />
                            <AlertTitle>{testResult.status === 'success' ? 'Connection Successful' : 'Connection Failed'}</AlertTitle>
                            <AlertDescription>{testResult.message}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
              </Card>

               <Card>
                <CardHeader>
                    <CardTitle>Automated Messages</CardTitle>
                    <CardDescription>Enable and customize automated messages sent via WhatsApp. Use placeholders like {"{student_name}"}.</CardDescription>
                </CardHeader>
                 <CardContent className="space-y-6">
                    <div className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="new-admission-switch" className="text-base font-medium">New Student Admission</Label>
                            <Switch id="new-admission-switch" checked={newAdmissionMsg} onCheckedChange={setNewAdmissionMsg} />
                        </div>
                        {newAdmissionMsg && (
                            <div className="space-y-2">
                                <Label htmlFor="new-admission-template">Message Template</Label>
                                <Textarea id="new-admission-template" value={newAdmissionTemplate} onChange={e => setNewAdmissionTemplate(e.target.value)} />
                            </div>
                        )}
                    </div>
                     <div className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="absent-switch" className="text-base font-medium">Absent Student Notification</Label>
                            <Switch id="absent-switch" checked={absentMsg} onCheckedChange={setAbsentMsg} />
                        </div>
                        {absentMsg && (
                            <div className="space-y-2">
                                <Label htmlFor="absent-template">Message Template</Label>
                                <Textarea id="absent-template" value={absentTemplate} onChange={e => setAbsentTemplate(e.target.value)} />
                            </div>
                        )}
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button disabled={isSaving}>Save WhatsApp Settings</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="admin">
              <Card className='max-w-2xl'>
                <CardHeader>
                    <CardTitle>Admin Settings</CardTitle>
                    <CardDescription>Manage administrator credentials.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button>Update Password</Button>
                </CardFooter>
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
                        <Label htmlFor="api-key">Your API Key</Label>
                        <Input id="api-key" defaultValue="******************" readOnly />
                    </div>
                     <div className="space-y-2">
                        <Label>Database</Label>
                        <div className="flex items-center justify-between rounded-md border p-3">
                           <p className="text-sm">Seed your Firestore database with the initial dummy data.</p>
                            <Button variant="secondary" onClick={handleSeedDatabase} disabled={isSeeding}>
                                <Database className='mr-2'/>
                                {isSeeding ? 'Seeding...' : 'Seed Database'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button>Generate New API Key</Button>
                </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  )
}

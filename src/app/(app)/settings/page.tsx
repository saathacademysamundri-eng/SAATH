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
import { Upload } from 'lucide-react';
import { useState, ChangeEvent, useMemo } from 'react';

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();
  const { toast } = useToast();

  const [name, setName] = useState(settings.name);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [logo, setLogo] = useState(settings.logo);
  const [academicSession, setAcademicSession] = useState(settings.academicSession);

  const academicSessions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 15; i++) {
        const startYear = currentYear + i;
        const endYear = startYear + 1;
        years.push(`${startYear}-${endYear}`);
    }
    return years;
  }, []);

  const handleSaveChanges = () => {
    setSettings({ name, address, phone, logo, academicSession });
    toast({
      title: 'Settings Saved',
      description: 'Your academy details have been updated.',
    });
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your academy's settings and preferences.
          </p>
        </div>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="api">API Integration</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <Card className='max-w-2xl'>
                <CardHeader>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>Update your academy's public details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Academy Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
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
                        <Label htmlFor="logo">Academy Logo</Label>
                        <div className='flex items-center gap-4'>
                            <div className='w-20 h-20 rounded-full border flex items-center justify-center bg-muted overflow-hidden'>
                                <img src={logo} alt="logo" className='object-cover w-full h-full' />
                            </div>
                            <Button variant="outline" asChild>
                               <label htmlFor="logo-upload" className='cursor-pointer'>
                                    <Upload className='mr-2'/>
                                    Upload Logo
                                    <input id="logo-upload" type="file" className='sr-only' accept="image/*" onChange={handleLogoUpload} />
                               </label>
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                </CardFooter>
            </Card>
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
                    <CardTitle>API Integration</CardTitle>
                    <CardDescription>Manage API keys for integrations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="api-key">Your API Key</Label>
                        <Input id="api-key" defaultValue="******************" readOnly />
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button>Generate New Key</Button>
                </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  )
}

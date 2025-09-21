'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSettings } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';
import { useState, ChangeEvent } from 'react';

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();
  const { toast } = useToast();

  const [name, setName] = useState(settings.name);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [logo, setLogo] = useState(settings.logo);

  const handleSaveChanges = () => {
    setSettings({ name, address, phone, logo });
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
            Manage your academy's general settings.
          </p>
        </div>
        <Card className='max-w-2xl'>
            <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Update your academy's details here.</CardDescription>
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
                    <Label htmlFor="logo">Academy Logo</Label>
                    <div className='flex items-center gap-4'>
                        <div className='w-20 h-20 rounded-md border flex items-center justify-center bg-muted'>
                            <img src={logo} alt="logo" className='object-contain p-2' />
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
    </div>
  )
}

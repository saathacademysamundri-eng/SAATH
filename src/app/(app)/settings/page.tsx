import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';

export default function SettingsPage() {
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
                    <Input id="name" defaultValue="The Spirit School Samundri" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" defaultValue="Housing Colony 2, Samundri Faisalabad" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue="0333 9114333" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="logo">Academy Logo</Label>
                    <div className='flex items-center gap-4'>
                        <div className='w-20 h-20 rounded-md border flex items-center justify-center bg-muted'>
                            <img src="/logo.png" alt="logo" className='object-contain p-2' />
                        </div>
                        <Button variant="outline" asChild>
                           <label htmlFor="logo-upload" className='cursor-pointer'>
                                <Upload className='mr-2'/>
                                Upload Logo
                                <input id="logo-upload" type="file" className='sr-only' />
                           </label>
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button>Save Changes</Button>
            </CardFooter>
        </Card>
    </div>
  )
}

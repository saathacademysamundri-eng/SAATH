
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
       <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            View and manage your profile settings.
          </p>
        </div>
      <Card>
        <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>This page is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Your profile management page will be available here soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}

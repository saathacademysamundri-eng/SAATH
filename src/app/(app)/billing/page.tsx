
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-6">
       <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">
            Manage your billing and subscription details.
          </p>
        </div>
      <Card>
        <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>This page is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Your billing and subscription management page will be available here soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}

import { LoginForm } from '@/components/login/login-form';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useSettings } from '@/hooks/use-settings';

export default function LoginPage() {
  
  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Card className="shadow-2xl">
          <CardHeader>
            <div className="flex h-20 w-full justify-center">
              <Logo onLogin={true} />
            </div>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
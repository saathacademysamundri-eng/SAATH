import { LoginForm } from '@/components/login-form';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Card className="shadow-2xl">
          <CardHeader>
            <div className="flex w-full justify-center">
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

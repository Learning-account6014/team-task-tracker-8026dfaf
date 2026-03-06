import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = login(email);
    if (err) setError(err);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">TaskFlow</CardTitle>
          <CardDescription>
            Sign in with your company email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                className="h-11"
                required
              />
              {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            </div>
            <Button type="submit" className="w-full h-11 font-semibold">
              Sign In
            </Button>
          </form>
          <div className="mt-6 p-3 rounded-lg bg-muted text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Demo accounts:</p>
            <p>Admin: <span className="font-mono text-xs">admin@company.com</span></p>
            <p>Employee: <span className="font-mono text-xs">alice@company.com</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

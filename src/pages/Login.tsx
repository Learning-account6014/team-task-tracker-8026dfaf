import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = login(email, password);
    if (err) setError(err);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center space-y-3">
          <img src="/logo.png" alt="TaskFlow logo" className="mx-auto w-12 h-12" />
          <CardTitle className="text-2xl font-bold">TaskFlow</CardTitle>
          <CardDescription>Sign in with your company credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              className="h-11"
              required
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                className="h-11 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full h-11 font-semibold">
              Sign In
            </Button>
          </form>
          <div className="mt-6 p-3 rounded-lg bg-muted text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Demo accounts:</p>
            <p>Admin: <span className="font-mono text-xs">admin@company.com</span> / <span className="font-mono text-xs">admin123</span></p>
            <p>Employee: <span className="font-mono text-xs">alice@company.com</span> / <span className="font-mono text-xs">alice123</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

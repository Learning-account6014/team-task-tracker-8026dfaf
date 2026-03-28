import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { getSession, setSession, getUsers, type User } from "@/lib/store";

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getSession);

  const login = useCallback((email: string, password: string): string | null => {
    const users = getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return "User not found.";
    if (found.password !== password) return "Incorrect password.";
    setSession(found);
    setUser(found);
    return null;
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

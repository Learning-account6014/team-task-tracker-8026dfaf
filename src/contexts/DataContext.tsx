import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchTasks, fetchUsers, type Task, type User } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";

interface DataCtx {
  users: User[];
  tasks: Task[];
  refresh: () => Promise<void>;
  loading: boolean;
}

const Ctx = createContext<DataCtx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    const [u, t] = await Promise.all([fetchUsers(), fetchTasks()]);
    setUsers(u);
    setTasks(t);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUsers([]);
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh();

    const channel = supabase
      .channel("data-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "task_comments" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "user_roles" }, () => refresh())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refresh]);

  return <Ctx.Provider value={{ users, tasks, refresh, loading }}>{children}</Ctx.Provider>;
}

export function useData() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useData must be used within DataProvider");
  return c;
}
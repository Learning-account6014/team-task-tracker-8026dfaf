import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "manager" | "employee";
export type TaskStatus = "todo" | "in_progress" | "done";
export type Priority = "low" | "medium" | "high";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

function roleRank(r: Role): number {
  return r === "admin" ? 1 : r === "manager" ? 2 : 3;
}

export async function fetchUsers(): Promise<User[]> {
  const [profilesRes, rolesRes] = await Promise.all([
    supabase.from("profiles").select("id,name,email"),
    supabase.from("user_roles").select("user_id,role"),
  ]);
  if (profilesRes.error) throw profilesRes.error;
  if (rolesRes.error) throw rolesRes.error;
  const rolesByUser = new Map<string, Role>();
  for (const r of rolesRes.data ?? []) {
    const existing = rolesByUser.get(r.user_id);
    const next = r.role as Role;
    if (!existing || roleRank(next) < roleRank(existing)) rolesByUser.set(r.user_id, next);
  }
  return (profilesRes.data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    role: rolesByUser.get(p.id) ?? "employee",
  }));
}

export async function fetchTasks(): Promise<Task[]> {
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const ids = (tasks ?? []).map((t) => t.id);
  const commentsByTask = new Map<string, Comment[]>();
  if (ids.length) {
    const { data: comments, error: cErr } = await supabase
      .from("task_comments")
      .select("*")
      .in("task_id", ids)
      .order("created_at", { ascending: true });
    if (cErr) throw cErr;
    for (const c of comments ?? []) {
      const list = commentsByTask.get(c.task_id) ?? [];
      list.push({ id: c.id, taskId: c.task_id, userId: c.user_id, text: c.text, createdAt: c.created_at });
      commentsByTask.set(c.task_id, list);
    }
  }
  return (tasks ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status as TaskStatus,
    priority: t.priority as Priority,
    assigneeId: t.assigned_to,
    createdBy: t.assigned_by,
    createdAt: (t.created_at as string).split("T")[0],
    updatedAt: (t.updated_at as string).split("T")[0],
    comments: commentsByTask.get(t.id) ?? [],
  }));
}

export async function createTask(input: {
  title: string;
  description: string;
  priority: Priority;
  assigneeId: string;
  createdBy: string;
}) {
  const { error } = await supabase.from("tasks").insert({
    title: input.title,
    description: input.description,
    priority: input.priority,
    status: "todo",
    assigned_to: input.assigneeId,
    assigned_by: input.createdBy,
  });
  if (error) throw error;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
  if (error) throw error;
}

export async function updateTaskPriority(taskId: string, priority: Priority) {
  const { error } = await supabase.from("tasks").update({ priority }).eq("id", taskId);
  if (error) throw error;
}

export async function deleteTask(taskId: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw error;
}

export async function addComment(taskId: string, userId: string, text: string) {
  const { error } = await supabase.from("task_comments").insert({ task_id: taskId, user_id: userId, text });
  if (error) throw error;
}

export async function adminCreateUser(name: string, email: string, password: string, role: Role): Promise<string | null> {
  const { data, error } = await supabase.functions.invoke("admin-create-user", {
    body: { name, email, password, role },
  });
  if (error) return error.message;
  if ((data as { error?: string })?.error) return (data as { error: string }).error;
  return null;
}

export async function adminDeleteUser(userId: string): Promise<string | null> {
  const { data, error } = await supabase.functions.invoke("admin-delete-user", { body: { userId } });
  if (error) return error.message;
  if ((data as { error?: string })?.error) return (data as { error: string }).error;
  return null;
}

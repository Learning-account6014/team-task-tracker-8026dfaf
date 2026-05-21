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
  createdBy: string; // assigned_by
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
  let commentsByTask = new Map<string, Comment[]>();
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
  if ((data as any)?.error) return (data as any).error;
  return null;
}

export async function adminDeleteUser(userId: string): Promise<string | null> {
  const { data, error } = await supabase.functions.invoke("admin-delete-user", { body: { userId } });
  if (error) return error.message;
  if ((data as any)?.error) return (data as any).error;
  return null;
}

const USERS_KEY = "tasktracker_users";
const TASKS_KEY = "tasktracker_tasks";
const SESSION_KEY = "tasktracker_session";

const defaultUsers: User[] = [
  { id: "1", name: "Admin User", email: "admin@company.com", password: "admin123", role: "admin" },
  { id: "2", name: "Alice Johnson", email: "alice@company.com", password: "alice123", role: "employee" },
  { id: "3", name: "Bob Smith", email: "bob@company.com", password: "bob123", role: "employee" },
  { id: "4", name: "Carol Williams", email: "carol@company.com", password: "carol123", role: "employee" },
  { id: "5", name: "David Brown", email: "david@company.com", password: "david123", role: "employee" },
  { id: "6", name: "Eve Davis", email: "eve@company.com", password: "eve123", role: "employee" },
  { id: "7", name: "Frank Miller", email: "frank@company.com", password: "frank123", role: "employee" },
  { id: "8", name: "Grace Wilson", email: "grace@company.com", password: "grace123", role: "employee" },
  { id: "9", name: "Henry Moore", email: "henry@company.com", password: "henry123", role: "employee" },
  { id: "10", name: "Ivy Taylor", email: "ivy@company.com", password: "ivy123", role: "employee" },
];

const defaultTasks: Task[] = [
  { id: "t1", title: "Design homepage mockup", description: "Create wireframes and high-fidelity mockups for the new homepage", status: "in_progress", priority: "high", assigneeId: "2", createdBy: "1", createdAt: "2026-03-01", updatedAt: "2026-03-04", comments: [] },
  { id: "t2", title: "Fix login bug", description: "Users report intermittent login failures on mobile", status: "todo", priority: "high", assigneeId: "3", createdBy: "1", createdAt: "2026-03-02", updatedAt: "2026-03-02", comments: [] },
  { id: "t3", title: "Write API documentation", description: "Document all REST endpoints for the v2 API", status: "done", priority: "medium", assigneeId: "4", createdBy: "1", createdAt: "2026-02-28", updatedAt: "2026-03-05", comments: [] },
  { id: "t4", title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automated testing and deployment", status: "in_progress", priority: "medium", assigneeId: "5", createdBy: "1", createdAt: "2026-03-03", updatedAt: "2026-03-05", comments: [] },
  { id: "t5", title: "Update dependencies", description: "Audit and update all npm packages to latest stable versions", status: "todo", priority: "low", assigneeId: "6", createdBy: "1", createdAt: "2026-03-04", updatedAt: "2026-03-04", comments: [] },
];

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getUsers(): User[] {
  const users = load(USERS_KEY, defaultUsers);
  // Migrate: if stored users lack password field, reset to defaults
  if (users.length > 0 && !users[0].password) {
    save(USERS_KEY, defaultUsers);
    return defaultUsers;
  }
  return users;
}

export function getTasks(): Task[] {
  return load(TASKS_KEY, defaultTasks);
}

export function saveTasks(tasks: Task[]) {
  save(TASKS_KEY, tasks);
}

export function getSession(): User | null {
  return load<User | null>(SESSION_KEY, null);
}

export function setSession(user: User | null) {
  save(SESSION_KEY, user);
}

export function addTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Task {
  const tasks = getTasks();
  const newTask: Task = {
    ...task,
    id: "t" + Date.now(),
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

export function updateTaskStatus(taskId: string, status: TaskStatus) {
  const tasks = getTasks();
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx !== -1) {
    tasks[idx].status = status;
    tasks[idx].updatedAt = new Date().toISOString().split("T")[0];
    saveTasks(tasks);
  }
  return tasks;
}

export function deleteTask(taskId: string) {
  const tasks = getTasks().filter((t) => t.id !== taskId);
  saveTasks(tasks);
  return tasks;
}

export function updateTaskPriority(taskId: string, priority: Priority) {
  const tasks = getTasks();
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx !== -1) {
    tasks[idx].priority = priority;
    tasks[idx].updatedAt = new Date().toISOString().split("T")[0];
    saveTasks(tasks);
  }
  return tasks;
}

export function addUser(name: string, email: string, password: string, role: Role = "employee"): string | null {
  const users = getUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return "A user with this email already exists";
  }
  users.push({ id: "u" + Date.now(), name, email, password, role });
  save(USERS_KEY, users);
  return null;
}

export function removeUser(userId: string): string | null {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return "User not found";
  if (user.role === "admin") return "Cannot remove an admin";
  save(USERS_KEY, users.filter((u) => u.id !== userId));
  // Unassign their tasks
  const tasks = getTasks();
  const updated = tasks.filter((t) => t.assigneeId !== userId);
  saveTasks(updated);
  return null;
}

export function addComment(taskId: string, userId: string, text: string) {
  const tasks = getTasks();
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx !== -1) {
    if (!tasks[idx].comments) tasks[idx].comments = [];
    tasks[idx].comments.push({
      id: "c" + Date.now(),
      taskId,
      userId,
      text,
      createdAt: new Date().toISOString(),
    });
    tasks[idx].updatedAt = new Date().toISOString().split("T")[0];
    saveTasks(tasks);
  }
  return tasks;
}

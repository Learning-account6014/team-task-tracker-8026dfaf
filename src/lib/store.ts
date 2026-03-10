export type Role = "admin" | "employee";
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

const USERS_KEY = "tasktracker_users";
const TASKS_KEY = "tasktracker_tasks";
const SESSION_KEY = "tasktracker_session";

const defaultUsers: User[] = [
  { id: "1", name: "Admin User", email: "admin@company.com", role: "admin" },
  { id: "2", name: "Alice Johnson", email: "alice@company.com", role: "employee" },
  { id: "3", name: "Bob Smith", email: "bob@company.com", role: "employee" },
  { id: "4", name: "Carol Williams", email: "carol@company.com", role: "employee" },
  { id: "5", name: "David Brown", email: "david@company.com", role: "employee" },
  { id: "6", name: "Eve Davis", email: "eve@company.com", role: "employee" },
  { id: "7", name: "Frank Miller", email: "frank@company.com", role: "employee" },
  { id: "8", name: "Grace Wilson", email: "grace@company.com", role: "employee" },
  { id: "9", name: "Henry Moore", email: "henry@company.com", role: "employee" },
  { id: "10", name: "Ivy Taylor", email: "ivy@company.com", role: "employee" },
];

const defaultTasks: Task[] = [
  { id: "t1", title: "Design homepage mockup", description: "Create wireframes and high-fidelity mockups for the new homepage", status: "in_progress", priority: "high", assigneeId: "2", createdBy: "1", createdAt: "2026-03-01", updatedAt: "2026-03-04" },
  { id: "t2", title: "Fix login bug", description: "Users report intermittent login failures on mobile", status: "todo", priority: "high", assigneeId: "3", createdBy: "1", createdAt: "2026-03-02", updatedAt: "2026-03-02" },
  { id: "t3", title: "Write API documentation", description: "Document all REST endpoints for the v2 API", status: "done", priority: "medium", assigneeId: "4", createdBy: "1", createdAt: "2026-02-28", updatedAt: "2026-03-05" },
  { id: "t4", title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automated testing and deployment", status: "in_progress", priority: "medium", assigneeId: "5", createdBy: "1", createdAt: "2026-03-03", updatedAt: "2026-03-05" },
  { id: "t5", title: "Update dependencies", description: "Audit and update all npm packages to latest stable versions", status: "todo", priority: "low", assigneeId: "6", createdBy: "1", createdAt: "2026-03-04", updatedAt: "2026-03-04" },
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
  return load(USERS_KEY, defaultUsers);
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

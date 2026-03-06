import { Badge } from "@/components/ui/badge";
import type { TaskStatus, Priority } from "@/lib/store";

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: "To Do", className: "bg-secondary text-secondary-foreground" },
  in_progress: { label: "In Progress", className: "bg-info text-info-foreground" },
  done: { label: "Done", className: "bg-success text-success-foreground" },
};

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", className: "bg-warning text-warning-foreground" },
  high: { label: "High", className: "bg-destructive text-destructive-foreground" },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const c = statusConfig[status];
  return <Badge className={`${c.className} border-0 font-medium`}>{c.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const c = priorityConfig[priority];
  return <Badge className={`${c.className} border-0 font-medium text-xs`}>{c.label}</Badge>;
}

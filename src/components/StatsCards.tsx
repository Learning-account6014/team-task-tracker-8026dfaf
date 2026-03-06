import { Card, CardContent } from "@/components/ui/card";
import { ListTodo, Timer, CheckCircle2, AlertTriangle } from "lucide-react";
import type { Task } from "@/lib/store";

export function StatsCards({ tasks }: { tasks: Task[] }) {
  const todo = tasks.filter((t) => t.status === "todo").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const done = tasks.filter((t) => t.status === "done").length;
  const highPriority = tasks.filter((t) => t.priority === "high" && t.status !== "done").length;

  const stats = [
    { label: "To Do", value: todo, icon: ListTodo, color: "text-muted-foreground" },
    { label: "In Progress", value: inProgress, icon: Timer, color: "text-info" },
    { label: "Completed", value: done, icon: CheckCircle2, color: "text-success" },
    { label: "High Priority", value: highPriority, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label} className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

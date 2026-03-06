import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { getUsers, updateTaskStatus, deleteTask, type Task, type TaskStatus } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  tasks: Task[];
  onRefresh: () => void;
}

export function TaskTable({ tasks, onRefresh }: Props) {
  const { user } = useAuth();
  const users = getUsers();
  const isAdmin = user?.role === "admin";

  const getName = (id: string) => users.find((u) => u.id === id)?.name ?? "Unknown";

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTaskStatus(taskId, status);
    onRefresh();
  };

  const handleDelete = (taskId: string) => {
    deleteTask(taskId);
    onRefresh();
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">No tasks found</p>
        <p className="text-sm mt-1">Tasks will appear here once created.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Task</TableHead>
            <TableHead className="font-semibold">Assignee</TableHead>
            <TableHead className="font-semibold">Priority</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Updated</TableHead>
            {isAdmin && <TableHead className="w-12" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="hover:bg-muted/30 transition-colors">
              <TableCell>
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{task.description}</p>
                </div>
              </TableCell>
              <TableCell className="text-sm">{getName(task.assigneeId)}</TableCell>
              <TableCell><PriorityBadge priority={task.priority} /></TableCell>
              <TableCell>
                {(isAdmin || task.assigneeId === user?.id) ? (
                  <Select value={task.status} onValueChange={(v) => handleStatusChange(task.id, v as TaskStatus)}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <StatusBadge status={task.status} />
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{task.updatedAt}</TableCell>
              {isAdmin && (
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(task.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

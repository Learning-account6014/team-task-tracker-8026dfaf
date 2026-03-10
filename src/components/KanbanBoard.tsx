import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/StatusBadge";
import { Trash2, MessageSquare, GripVertical } from "lucide-react";
import { getUsers, updateTaskStatus, deleteTask, type Task, type TaskStatus } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";

const columns: { status: TaskStatus; label: string; colorClass: string }[] = [
  { status: "todo", label: "To Do", colorClass: "bg-secondary" },
  { status: "in_progress", label: "In Progress", colorClass: "bg-info/20" },
  { status: "done", label: "Done", colorClass: "bg-success/20" },
];

interface Props {
  tasks: Task[];
  onRefresh: () => void;
}

export function KanbanBoard({ tasks, onRefresh }: Props) {
  const { user } = useAuth();
  const users = getUsers();
  const isAdmin = user?.role === "admin";
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const dragCounter = useRef<Record<string, number>>({});

  const getName = (id: string) => users.find((u) => u.id === id)?.name ?? "Unknown";

  const canDrag = (task: Task) => isAdmin || task.assigneeId === user?.id;

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (status: TaskStatus) => {
    dragCounter.current[status] = (dragCounter.current[status] || 0) + 1;
    setDragOverColumn(status);
  };

  const handleDragLeave = (status: TaskStatus) => {
    dragCounter.current[status] = (dragCounter.current[status] || 0) - 1;
    if (dragCounter.current[status] <= 0) {
      dragCounter.current[status] = 0;
      if (dragOverColumn === status) setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    dragCounter.current = {};
    setDragOverColumn(null);
    if (draggedTaskId) {
      const task = tasks.find((t) => t.id === draggedTaskId);
      if (task && task.status !== status && canDrag(task)) {
        updateTaskStatus(draggedTaskId, status);
        onRefresh();
      }
    }
    setDraggedTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
    dragCounter.current = {};
  };

  const handleDelete = (taskId: string) => {
    deleteTask(taskId);
    onRefresh();
  };

  // Keep selectedTask in sync with refreshed tasks
  const currentSelectedTask = selectedTask ? tasks.find((t) => t.id === selectedTask.id) ?? null : null;

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">No tasks found</p>
        <p className="text-sm mt-1">Tasks will appear here once created.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.status);
          const isOver = dragOverColumn === col.status;

          return (
            <div
              key={col.status}
              className={`rounded-xl p-3 transition-colors min-h-[200px] ${col.colorClass} ${isOver ? "ring-2 ring-primary ring-offset-2" : ""}`}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(col.status)}
              onDragLeave={() => handleDragLeave(col.status)}
              onDrop={(e) => handleDrop(e, col.status)}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-bold">{col.label}</h3>
                <span className="text-xs font-semibold bg-background/80 rounded-full px-2 py-0.5">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-2">
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    draggable={canDrag(task)}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`p-3 cursor-pointer border-border hover:shadow-md transition-all ${
                      draggedTaskId === task.id ? "opacity-40 scale-95" : ""
                    } ${canDrag(task) ? "cursor-grab active:cursor-grabbing" : ""}`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="flex items-start gap-2">
                      {canDrag(task) && (
                        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{task.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <PriorityBadge priority={task.priority} />
                            {(task.comments?.length > 0) && (
                              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                                <MessageSquare className="w-3 h-3" />
                                {task.comments.length}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{getName(task.assigneeId).split(" ")[0]}</span>
                        </div>
                      </div>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <TaskDetailDialog
        task={currentSelectedTask}
        open={!!currentSelectedTask}
        onOpenChange={(open) => { if (!open) setSelectedTask(null); }}
        onRefresh={onRefresh}
      />
    </>
  );
}

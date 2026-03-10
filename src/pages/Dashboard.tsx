import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getTasks, getUsers } from "@/lib/store";
import { KanbanBoard } from "@/components/KanbanBoard";
import { StatsCards } from "@/components/StatsCards";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { ManageTeamDialog } from "@/components/ManageTeamDialog";
import { Button } from "@/components/ui/button";
import { ClipboardList, LogOut } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  if (!user) return null;

  const isAdmin = user.role === "admin";
  const allTasks = getTasks();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = refreshKey; // trigger re-render

  const visibleTasks = isAdmin ? allTasks : allTasks.filter((t) => t.assigneeId === user.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">TaskFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {isAdmin ? "All Tasks" : "My Tasks"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isAdmin
                ? `${allTasks.length} tasks across ${getUsers().filter((u) => u.role === "employee").length} team members`
                : `You have ${visibleTasks.length} tasks assigned`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && <ManageTeamDialog onChanged={refresh} />}
            {isAdmin && <CreateTaskDialog onCreated={refresh} />}
          </div>
        </div>

        {/* Stats */}
        <StatsCards tasks={visibleTasks} />

        {/* Kanban Board */}
        <KanbanBoard tasks={visibleTasks} onRefresh={refresh} />
      </main>
    </div>
  );
}

import { useAuth } from "@/hooks/useAuth";
import { useData } from "@/contexts/DataContext";
import { KanbanBoard } from "@/components/KanbanBoard";
import { StatsCards } from "@/components/StatsCards";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { ManageTeamDialog } from "@/components/ManageTeamDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { tasks, users, loading } = useData();

  if (!user) return null;

  const isAdmin = user.role === "admin";
  const isManager = user.role === "manager";
  const canCreate = isAdmin || isManager;

  // Visible tasks: admin sees all; others see tasks assigned to them OR created by them
  const visibleTasks = isAdmin
    ? tasks
    : tasks.filter((t) => t.assigneeId === user.id || t.createdBy === user.id);

  const title = isAdmin ? "All Tasks" : isManager ? "Team Tasks" : "My Tasks";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="TaskFlow logo" className="w-8 h-8" />
            <span className="font-bold text-lg">TaskFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:flex items-center gap-2">
              <div>
                <p className="text-sm font-medium leading-tight">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize leading-tight">{user.role}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {title}
              <Badge variant="secondary" className="text-xs capitalize">{user.role}</Badge>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isAdmin
                ? `${tasks.length} tasks across ${users.length} members`
                : isManager
                ? `${visibleTasks.length} tasks you assigned or are working on`
                : `You have ${visibleTasks.length} tasks assigned to you`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && <ManageTeamDialog />}
            {canCreate && <CreateTaskDialog />}
          </div>
        </div>

        <StatsCards tasks={visibleTasks} />

        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading...</div>
        ) : (
          <KanbanBoard tasks={visibleTasks} />
        )}
      </main>
    </div>
  );
}

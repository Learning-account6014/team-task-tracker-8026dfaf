import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { addComment, updateTaskPriority, type Task, type Priority } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import { useData } from "@/contexts/DataContext";
import { MessageSquare, Send } from "lucide-react";

interface Props {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({ task, open, onOpenChange }: Props) {
  const { user } = useAuth();
  const { users, refresh } = useData();
  const [commentText, setCommentText] = useState("");

  if (!task || !user) return null;

  const isAdmin = user.role === "admin";
  const isAssignee = task.assigneeId === user.id;
  const isCreator = task.createdBy === user.id;
  const canComment = isAdmin || isAssignee || isCreator;
  const canEditPriority = isAdmin || isCreator;

  const getName = (id: string) => users.find((u) => u.id === id)?.name ?? "Unknown";

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    await addComment(task.id, user.id, commentText.trim());
    setCommentText("");
    refresh();
  };

  const handlePriorityChange = async (priority: Priority) => {
    await updateTaskPriority(task.id, priority);
    refresh();
  };

  const comments = task.comments || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">{task.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          <p className="text-sm text-muted-foreground">{task.description || "No description"}</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs font-medium">Assigned to</span>
              <p className="font-medium mt-0.5">{getName(task.assigneeId)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium">Assigned by</span>
              <p className="font-medium mt-0.5">{getName(task.createdBy)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium">Status</span>
              <div className="mt-1"><StatusBadge status={task.status} /></div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium">Priority</span>
              <div className="mt-1">
                {canEditPriority ? (
                  <Select value={task.priority} onValueChange={(v) => handlePriorityChange(v as Priority)}>
                    <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                ) : <PriorityBadge priority={task.priority} />}
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground text-xs font-medium">Updated</span>
              <p className="font-medium mt-0.5">{task.updatedAt}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Comments ({comments.length})</h3>
            </div>
            {comments.length === 0 && <p className="text-sm text-muted-foreground py-3">No comments yet.</p>}
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {comments.map((c) => (
                <div key={c.id} className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">{getName(c.userId)}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{c.text}</p>
                </div>
              ))}
            </div>
            {canComment && (
              <div className="flex gap-2 mt-3">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                  className="text-sm min-h-[60px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(); }
                  }}
                />
                <Button size="icon" onClick={handleAddComment} disabled={!commentText.trim()} className="shrink-0 self-end">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

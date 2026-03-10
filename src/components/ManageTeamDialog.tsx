import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUsers, addUser, removeUser } from "@/lib/store";
import { Users, UserPlus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  onChanged: () => void;
}

export function ManageTeamDialog({ onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const users = getUsers();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = refreshKey;
  const employees = users.filter((u) => u.role === "employee");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const err = addUser(name.trim(), email.trim());
    if (err) {
      toast({ title: "Error", description: err, variant: "destructive" });
    } else {
      toast({ title: "Member added", description: `${name.trim()} has been added to the team.` });
      setName("");
      setEmail("");
      setRefreshKey((k) => k + 1);
      onChanged();
    }
  };

  const handleRemove = (userId: string, userName: string) => {
    const err = removeUser(userId);
    if (err) {
      toast({ title: "Error", description: err, variant: "destructive" });
    } else {
      toast({ title: "Member removed", description: `${userName} has been removed.` });
      setRefreshKey((k) => k + 1);
      onChanged();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="w-4 h-4" />
          Manage Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Team Members</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Add new member</p>
          <div className="flex gap-2">
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="flex-1"
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
          </div>
          <Button type="submit" size="sm" className="gap-2 w-fit">
            <UserPlus className="w-4 h-4" />
            Add Member
          </Button>
        </form>

        <div className="border-t border-border pt-3 mt-1">
          <p className="text-sm font-medium text-foreground mb-2">
            Team members ({employees.length})
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {employees.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemove(u.id, u.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

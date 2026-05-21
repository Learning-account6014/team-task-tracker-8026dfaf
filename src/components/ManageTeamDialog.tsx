import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { adminCreateUser, adminDeleteUser, type Role } from "@/lib/store";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/hooks/useAuth";
import { Users, UserPlus, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ManageTeamDialog() {
  const { user } = useAuth();
  const { users, refresh } = useData();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("employee");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const team = users.filter((u) => u.id !== user?.id);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    setBusy(true);
    const err = await adminCreateUser(name.trim(), email.trim(), password, role);
    setBusy(false);
    if (err) {
      toast({ title: "Error", description: err, variant: "destructive" });
    } else {
      toast({ title: "Member added", description: `${name.trim()} has been added as ${role}.` });
      setName(""); setEmail(""); setPassword(""); setRole("employee");
      refresh();
    }
  };

  const handleRemove = async (userId: string, userName: string) => {
    const err = await adminDeleteUser(userId);
    if (err) toast({ title: "Error", description: err, variant: "destructive" });
    else {
      toast({ title: "Member removed", description: `${userName} has been removed.` });
      refresh();
    }
  };

  const roleColor = (r: Role) =>
    r === "admin" ? "bg-destructive/15 text-destructive" :
    r === "manager" ? "bg-info/15 text-info" :
    "bg-muted text-muted-foreground";

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
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required className="flex-1" />
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="flex-1" />
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 6)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" size="sm" className="gap-2 w-fit" disabled={busy}>
            <UserPlus className="w-4 h-4" />
            {busy ? "Adding..." : "Add Member"}
          </Button>
        </form>

        <div className="border-t border-border pt-3 mt-1">
          <p className="text-sm font-medium text-foreground mb-2">Team members ({team.length})</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {team.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <Badge variant="secondary" className={`text-[10px] uppercase ${roleColor(u.role)}`}>{u.role}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
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

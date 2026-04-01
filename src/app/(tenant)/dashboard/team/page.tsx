"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Loader2,
  AlertCircle,
  UserPlus,
  Users,
  CheckCircle2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getTeamMembers,
  inviteTeamMember,
  type TeamMember,
  type TenantRole,
} from "./actions";

// ─── Role display config ────────────────────────────────────

const ROLE_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  super_admin: { label: "Super Admin", variant: "default" },
  owner: { label: "Owner", variant: "default" },
  sales: { label: "Sales", variant: "secondary" },
  finance: { label: "Finance", variant: "secondary" },
  marketing: { label: "Marketing", variant: "secondary" },
  viewer: { label: "Viewer", variant: "outline" },
};

const INVITE_ROLES: { value: TenantRole; label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "sales", label: "Sales" },
  { value: "finance", label: "Finance" },
  { value: "marketing", label: "Marketing" },
  { value: "viewer", label: "Viewer" },
];

// ─── Helpers ────────────────────────────────────────────────

function formatName(member: TeamMember): string {
  const parts = [member.first_name, member.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "—";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Invite Dialog ──────────────────────────────────────────

function InviteDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TenantRole>("viewer");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function resetForm() {
    setEmail("");
    setRole("viewer");
    setError(null);
    setSuccess(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await inviteTeamMember(email, role);

      if (!result.success) {
        setError(result.error ?? "Something went wrong");
        return;
      }

      setSuccess(true);
      onSuccess();

      // Auto-close after a brief delay so the user sees the success message
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 1500);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 size-4" />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite team member</DialogTitle>
          <DialogDescription>
            Send an email invitation to join your organisation. They&apos;ll
            receive a link to create their account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending || success}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as TenantRole)}
              disabled={isPending || success}
            >
              <SelectTrigger id="invite-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {INVITE_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-4 shrink-0" />
              Invitation sent successfully!
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending || success}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Send invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ──────────────────────────────────────────────

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadMembers() {
    const result = await getTeamMembers();
    if (result.data) {
      setMembers(result.data);
    }
    if (result.error) {
      setError(result.error);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadMembers();
  }, []);

  function handleInviteSuccess() {
    // Refresh the member list
    loadMembers();
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team</h2>
          <p className="text-muted-foreground">
            Invite and manage team members. Assign roles to control access
            across your organisation.
          </p>
        </div>
        <InviteDialog onSuccess={handleInviteSuccess} />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Users className="mb-4 size-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No team members yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Invite your first team member to get started.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const roleConfig = ROLE_CONFIG[member.role] ?? {
                  label: member.role,
                  variant: "outline" as const,
                };
                return (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {formatName(member)}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleConfig.variant}>
                        {roleConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(member.created_at)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

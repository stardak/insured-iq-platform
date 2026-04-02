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

const ROLE_BADGE: Record<
  string,
  { label: string; classes: string }
> = {
  super_admin: {
    label: "Super Admin",
    classes:
      "bg-purple-50 text-purple-700 ring-purple-600/20",
  },
  owner: {
    label: "Owner",
    classes:
      "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  },
  sales: {
    label: "Sales",
    classes: "bg-blue-50 text-blue-700 ring-blue-600/20",
  },
  finance: {
    label: "Finance",
    classes:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  marketing: {
    label: "Marketing",
    classes:
      "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  viewer: {
    label: "Viewer",
    classes: "bg-gray-50 text-gray-600 ring-gray-500/10",
  },
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

function getInitials(member: TeamMember): string {
  if (member.first_name && member.last_name) {
    return `${member.first_name[0]}${member.last_name[0]}`.toUpperCase();
  }
  if (member.first_name) return member.first_name[0].toUpperCase();
  return member.email[0]?.toUpperCase() ?? "U";
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

      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 1500);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <span className="flex items-center gap-x-1.5">
            <UserPlus className="size-4" />
            Invite member
          </span>
        </button>
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

// ─── Main Page (Tailwind Plus: 09-with-avatars table) ───────

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
    loadMembers();
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header — Tailwind Plus table header pattern */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900">Team</h1>
          <p className="mt-2 text-sm text-gray-700">
            Invite and manage team members. Assign roles to control access
            across your organisation.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <InviteDialog onSuccess={handleInviteSuccess} />
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {members.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-16 text-center">
          <Users className="mb-4 size-10 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            No team members yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Invite your first team member to get started.
          </p>
        </div>
      ) : (
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {members.map((member) => {
                    const badge = ROLE_BADGE[member.role] ?? {
                      label: member.role,
                      classes: "bg-gray-50 text-gray-600 ring-gray-500/10",
                    };
                    return (
                      <tr key={member.id}>
                        {/* Avatar + name + email (Tailwind Plus table pattern) */}
                        <td className="py-5 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-0">
                          <div className="flex items-center">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                              {getInitials(member)}
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">
                                {formatName(member)}
                              </div>
                              <div className="mt-1 text-gray-500">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="px-3 py-5 text-sm whitespace-nowrap">
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                            Active
                          </span>
                        </td>

                        {/* Role badge */}
                        <td className="px-3 py-5 text-sm whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${badge.classes}`}
                          >
                            {badge.label}
                          </span>
                        </td>

                        {/* Joined date */}
                        <td className="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
                          {formatDate(member.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

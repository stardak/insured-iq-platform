"use client";

import { useState, useTransition } from "react";
import { TrashIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { inviteAdmin, removeAdmin } from "./actions";

type Admin = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminsClient({ initialAdmins, currentUserId }: { initialAdmins: Admin[]; currentUserId: string }) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    startTransition(async () => {
      const result = await inviteAdmin(inviteEmail.trim());
      if (result.error) {
        setInviteMessage(result.error);
      } else {
        setInviteMessage(result.message ?? "Done!");
        setInviteEmail("");
        setTimeout(() => {
          setShowInvite(false);
          setInviteMessage("");
          window.location.reload();
        }, 1500);
      }
    });
  }

  async function handleRemove(userId: string) {
    if (!confirm("Remove this user's super admin access? They'll be downgraded to viewer.")) return;
    startTransition(async () => {
      const result = await removeAdmin(userId);
      if (result.success) {
        setAdmins((prev) => prev.filter((a) => a.id !== userId));
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admins</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage who has super admin access to the platform.
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          <PlusIcon className="size-4" />
          Invite admin
        </button>
      </div>

      {/* Invite Dialog */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Invite Admin</h2>
              <button onClick={() => { setShowInvite(false); setInviteMessage(""); }} className="rounded p-1 text-gray-400 hover:bg-gray-100">
                <XMarkIcon className="size-5" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              {inviteMessage && (
                <p className={`text-sm ${inviteMessage.includes("Error") || inviteMessage.includes("already") ? "text-red-600" : "text-emerald-600"}`}>
                  {inviteMessage}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setShowInvite(false); setInviteMessage(""); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
                  {isPending ? "Sending…" : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admins Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date Added</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600">
                        {(admin.first_name?.[0] || admin.email[0])?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {[admin.first_name, admin.last_name].filter(Boolean).join(" ") || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{admin.email}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{formatDate(admin.created_at)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {admin.id === currentUserId ? (
                      <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600">You</span>
                    ) : (
                      <button
                        onClick={() => handleRemove(admin.id)}
                        disabled={isPending}
                        className="flex items-center gap-1 ml-auto rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-30 transition-colors"
                      >
                        <TrashIcon className="size-3.5" />
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

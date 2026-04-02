"use client";

import { useState, useTransition } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PauseIcon,
  TrashIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { createTenant, updateTenantStatus, deleteTenant } from "../actions";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  created_at: string;
  policyCount: number;
  revenue: number;
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-700",
};

const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-700",
  starter: "bg-blue-100 text-blue-700",
  growth: "bg-indigo-100 text-indigo-700",
  enterprise: "bg-purple-100 text-purple-700",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TenantsTable({ initialTenants }: { initialTenants: Tenant[] }) {
  const [tenants, setTenants] = useState(initialTenants);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filtered = tenants.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.slug.toLowerCase().includes(search.toLowerCase())) return false;
    if (planFilter && t.plan !== planFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });

  async function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createTenant(formData);
      if (result.success) {
        setShowNewForm(false);
        // Refresh would be ideal, but for now just close form
        window.location.reload();
      }
    });
  }

  async function handleStatusChange(tenantId: string, status: string) {
    startTransition(async () => {
      await updateTenantStatus(tenantId, status);
      setTenants((prev) =>
        prev.map((t) => (t.id === tenantId ? { ...t, status } : t))
      );
    });
  }

  async function handleDelete(tenantId: string) {
    if (!confirm("Are you sure you want to delete this tenant?")) return;
    startTransition(async () => {
      await deleteTenant(tenantId);
      setTenants((prev) => prev.filter((t) => t.id !== tenantId));
    });
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tenants…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="growth">Growth</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="suspended">Suspended</option>
        </select>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          <PlusIcon className="size-4" />
          New tenant
        </button>
      </div>

      {/* New Tenant Form */}
      {showNewForm && (
        <form action={handleCreate} className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input name="name" placeholder="Company name" required className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input name="slug" placeholder="Slug (url-safe)" required className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <select name="plan" className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
              {isPending ? "Creating…" : "Create Tenant"}
            </button>
            <button type="button" onClick={() => setShowNewForm(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Policies</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-md bg-indigo-50 text-xs font-bold text-indigo-600">
                        {tenant.name[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{tenant.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 font-mono">{tenant.slug}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${PLAN_COLORS[tenant.plan] ?? "bg-gray-100 text-gray-700"}`}>
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[tenant.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 font-medium">{tenant.policyCount}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 font-medium">{formatCurrency(tenant.revenue)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{formatDate(tenant.created_at)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="View dashboard"
                        onClick={() => window.open(`/dashboard`, "_blank")}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <EyeIcon className="size-4" />
                      </button>
                      {tenant.status === "active" ? (
                        <button
                          title="Pause tenant"
                          onClick={() => handleStatusChange(tenant.id, "paused")}
                          disabled={isPending}
                          className="rounded p-1 text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                        >
                          <PauseIcon className="size-4" />
                        </button>
                      ) : (
                        <button
                          title="Activate tenant"
                          onClick={() => handleStatusChange(tenant.id, "active")}
                          disabled={isPending}
                          className="rounded p-1 text-gray-400 hover:bg-green-50 hover:text-green-600"
                        >
                          <PlayIcon className="size-4" />
                        </button>
                      )}
                      <button
                        title="Delete tenant"
                        onClick={() => handleDelete(tenant.id)}
                        disabled={isPending}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                    No tenants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

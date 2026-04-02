"use client";

import { useState } from "react";
import { MagnifyingGlassIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

type Policy = {
  id: string;
  tenantName: string;
  customerEmail: string;
  productType: string;
  status: string;
  premium: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-gray-100 text-gray-600",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  expired: "bg-slate-100 text-slate-600",
  claimed: "bg-purple-100 text-purple-700",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function PoliciesTable({ initialPolicies }: { initialPolicies: Policy[] }) {
  const [policies] = useState(initialPolicies);
  const [search, setSearch] = useState("");
  const [tenantFilter, setTenantFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const tenants = [...new Set(policies.map((p) => p.tenantName))].sort();
  const products = [...new Set(policies.map((p) => p.productType))].sort();

  const filtered = policies.filter((p) => {
    if (search && !p.id.includes(search) && !p.customerEmail.toLowerCase().includes(search.toLowerCase())) return false;
    if (tenantFilter && p.tenantName !== tenantFilter) return false;
    if (productFilter && p.productType !== productFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  function exportCSV() {
    const headers = ["Policy ID", "Tenant", "Customer", "Product", "Status", "Premium", "Start Date", "End Date"];
    const rows = filtered.map((p) => [p.id, p.tenantName, p.customerEmail, p.productType, p.status, p.premium.toFixed(2), p.startDate ?? "", p.endDate ?? ""]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `policies-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <select value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
          <option value="">All tenants</option>
          {tenants.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
          <option value="">All products</option>
          {products.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
          <option value="claimed">Claimed</option>
        </select>
        <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <ArrowDownTrayIcon className="size-4" />
          Export CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Policy ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tenant</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Premium</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Start</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((policy) => (
                <tr key={policy.id} className="hover:bg-gray-50 transition-colors">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-gray-500">{policy.id.slice(0, 8)}…</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{policy.tenantName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{policy.customerEmail}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium capitalize text-indigo-700">{policy.productType}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_COLORS[policy.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {policy.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(policy.premium)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{formatDate(policy.startDate)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{formatDate(policy.endDate)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">No policies found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
          Showing {filtered.length} of {policies.length} policies
        </div>
      </div>
    </div>
  );
}

import { requireSuperAdmin } from "../auth";
import { getSystemStats } from "../actions";
import {
  CircleStackIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TABLE_LABELS: Record<string, string> = {
  tenants: "Tenants",
  profiles: "User Profiles",
  products: "Products",
  customers: "Customers",
  policies: "Policies",
  error_logs: "Error Logs",
};

const TYPE_COLORS: Record<string, string> = {
  error: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-blue-100 text-blue-700",
  webhook: "bg-purple-100 text-purple-700",
};

export default async function SystemPage() {
  await requireSuperAdmin();
  const data = await getSystemStats();

  // Simulate webhook log (would come from a real table in production)
  const webhookLog = [
    { id: "1", event: "customer.subscription.created", status: "success", timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: "2", event: "invoice.payment_succeeded", status: "success", timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: "3", event: "customer.subscription.updated", status: "success", timestamp: new Date(Date.now() - 10800000).toISOString() },
    { id: "4", event: "invoice.payment_failed", status: "failed", timestamp: new Date(Date.now() - 14400000).toISOString() },
    { id: "5", event: "checkout.session.completed", status: "success", timestamp: new Date(Date.now() - 18000000).toISOString() },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">System</h1>
        <p className="mt-1 text-sm text-gray-500">
          Database stats, webhook log, and error tracking.
        </p>
      </div>

      {/* Database Table Counts */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <CircleStackIcon className="size-4 text-indigo-500" />
          Database Tables
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(data.tableCounts).map(([table, count]) => (
            <div key={table} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500">{TABLE_LABELS[table] ?? table}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{count.toLocaleString()}</p>
              <p className="mt-0.5 text-[10px] text-gray-400 font-mono">{table}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Webhook Delivery Log */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Webhook Delivery Log</h3>
          <p className="mt-0.5 text-xs text-gray-500">Recent Stripe webhook events</p>
        </div>
        <div className="divide-y divide-gray-100">
          {webhookLog.map((hook) => (
            <div key={hook.id} className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                {hook.status === "success" ? (
                  <CheckCircleIcon className="size-5 text-emerald-500" />
                ) : (
                  <XCircleIcon className="size-5 text-red-500" />
                )}
                <div>
                  <p className="text-sm font-mono text-gray-900">{hook.event}</p>
                  <p className="text-xs text-gray-500">{formatDate(hook.timestamp)}</p>
                </div>
              </div>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                hook.status === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              }`}>
                {hook.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Error Logs */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <ExclamationTriangleIcon className="size-4 text-amber-500" />
            Recent Error Logs
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">Last 20 errors logged by the platform</p>
        </div>
        <div className="divide-y divide-gray-100">
          {data.errorLogs.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-gray-500">
              No errors logged — everything looks good! ✅
            </div>
          ) : (
            data.errorLogs.map((log: { id: string; type: string; message: string; metadata: Record<string, unknown>; created_at: string }) => (
              <div key={log.id} className="px-6 py-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_COLORS[log.type] ?? "bg-gray-100 text-gray-600"}`}>
                    {log.type}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(log.created_at)}</span>
                </div>
                <p className="mt-1 text-sm text-gray-900">{log.message}</p>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <pre className="mt-1 text-[10px] text-gray-500 font-mono overflow-x-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

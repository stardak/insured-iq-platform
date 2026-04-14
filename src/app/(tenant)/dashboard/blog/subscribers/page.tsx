"use client";

import { useEffect, useState, useTransition } from "react";
import { getSubscribers, toggleSubscriber } from "@/lib/actions/blog";
import { UsersIcon, ArrowDownTrayIcon, UserMinusIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import type { BlogSubscriber } from "@prisma/client";

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function exportCSV(subscribers: BlogSubscriber[]) {
  const header = "Name,Email,Subscribed,Source,Date\n";
  const rows = subscribers
    .map(
      (s) =>
        `"${s.name ?? ""}","${s.email}","${s.subscribed}","${s.source ?? ""}","${formatDate(s.subscribed_at)}"`
    )
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "blog-subscribers.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function BlogSubscribersPage() {
  const [subscribers, setSubscribers] = useState<BlogSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function load() {
    const res = await getSubscribers();
    if (res.data) setSubscribers(res.data);
    if (res.error) setError(res.error);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      await toggleSubscriber(id, !current);
      await load();
    });
  }

  const active = subscribers.filter((s) => s.subscribed).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Subscribers</h1>
          <p className="mt-1 text-sm text-gray-500">
            {active} active subscriber{active !== 1 ? "s" : ""}
            {subscribers.length > active ? ` · ${subscribers.length - active} unsubscribed` : ""}
          </p>
        </div>
        {subscribers.length > 0 && (
          <button
            type="button"
            onClick={() => exportCSV(subscribers)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowDownTrayIcon className="size-4" />
            Export CSV
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {subscribers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-20 text-center">
          <UsersIcon className="mb-4 size-10 text-gray-300" />
          <h3 className="text-base font-semibold text-gray-800">No subscribers yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Subscribers will appear here when people sign up from your public blog.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Subscriber</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hidden sm:table-cell">Source</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hidden md:table-cell">Subscribed on</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="py-3 pl-3 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="py-4 pl-4 pr-3">
                    <p className="text-sm font-medium text-gray-900">{sub.name ?? "—"}</p>
                    <p className="text-xs text-gray-500">{sub.email}</p>
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    {sub.source ?? "—"}
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 md:table-cell whitespace-nowrap">
                    {formatDate(sub.subscribed_at)}
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        sub.subscribed
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {sub.subscribed ? "Active" : "Unsubscribed"}
                    </span>
                  </td>
                  <td className="py-4 pl-3 pr-4 text-right">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggle(sub.id, sub.subscribed)}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50 ml-auto"
                    >
                      {sub.subscribed ? (
                        <><UserMinusIcon className="size-3.5" /> Unsubscribe</>
                      ) : (
                        <><UserPlusIcon className="size-3.5" /> Resubscribe</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

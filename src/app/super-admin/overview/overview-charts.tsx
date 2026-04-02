"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function OverviewCharts({
  signupChart,
  productChart,
}: {
  signupChart: { date: string; count: number }[];
  productChart: { type: string; count: number }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Signups Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">
          New Tenant Signups
        </h3>
        <p className="mt-0.5 text-xs text-gray-500">Last 30 days</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={signupChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(v: string) =>
                  new Date(v).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })
                }
                interval={4}
              />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
                labelFormatter={(label) =>
                  new Date(String(label)).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })
                }
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                name="Signups"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Policies by Product */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">
          Policies by Product
        </h3>
        <p className="mt-0.5 text-xs text-gray-500">
          All-time across all tenants
        </p>
        <div className="mt-4 h-64">
          {productChart.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              No policies issued yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  name="Policies"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

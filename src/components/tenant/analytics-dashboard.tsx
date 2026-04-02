"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Shield,
  DollarSign,
  Target,
  RotateCcw,
} from "lucide-react";
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
  Legend,
} from "recharts";

// ─── Mock data ───────────────────────────────────────────────

// Seeded random for consistent results across renders
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateDailyPolicies(days: number) {
  const data = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    const rand = seededRandom(seed);
    const base = 3 + Math.floor(rand * 5);
    const weekend = date.getDay() === 0 || date.getDay() === 6 ? -1 : 0;
    const trend = Math.floor((days - i) / 10); // gentle upward trend
    data.push({
      date: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      policies: Math.max(1, base + weekend + trend),
    });
  }
  return data;
}

const REVENUE_BY_PRODUCT = [
  { product: "Car", revenue: 18200, fill: "#6366f1" },
  { product: "Pet", revenue: 850, fill: "#8b5cf6" },
  { product: "Life", revenue: 2850, fill: "#a78bfa" },
  { product: "Bike", revenue: 0, fill: "#c4b5fd" },
  { product: "Home", revenue: 14900, fill: "#818cf8" },
  { product: "Health", revenue: 8430, fill: "#7c3aed" },
];

const KPI_DATA = {
  totalPolicies: { value: 156, change: 18, up: true },
  activePolicies: { value: 134, change: 14.2, up: true },
  monthlyRevenue: { value: 45230, change: 23, up: true },
  conversionRate: { value: 28.4, change: 3.2, up: true },
  refundRate: { value: 1.8, change: -0.4, up: false },
};

// ─── Components ──────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string;
  change: number;
  up: boolean;
  icon: React.ReactNode;
  prefix?: string;
  suffix?: string;
}

function KpiCard({ title, value, change, up, icon }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <div className="flex items-center gap-1.5">
              {up ? (
                <div className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="size-3.5" />
                  <span className="text-xs font-medium">+{Math.abs(change)}%</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-emerald-600">
                  <TrendingDown className="size-3.5" />
                  <span className="text-xs font-medium">{change}%</span>
                </div>
              )}
              <span className="text-[11px] text-muted-foreground">vs last period</span>
            </div>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Custom tooltip ──────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name === "revenue" ? `£${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("30d");
  const days = dateRange === "7d" ? 7 : dateRange === "14d" ? 14 : 30;
  const dailyPolicies = generateDailyPolicies(days);

  return (
    <div className="space-y-8">
      {/* Header + Date Range */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your insurance business performance.
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="14d">Last 14 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Policies Sold"
          value={KPI_DATA.totalPolicies.value.toLocaleString()}
          change={KPI_DATA.totalPolicies.change}
          up={KPI_DATA.totalPolicies.up}
          icon={<FileText className="size-5" />}
        />
        <KpiCard
          title="Active Policies"
          value={KPI_DATA.activePolicies.value.toLocaleString()}
          change={KPI_DATA.activePolicies.change}
          up={KPI_DATA.activePolicies.up}
          icon={<Shield className="size-5" />}
        />
        <KpiCard
          title="Monthly Revenue"
          value={`£${KPI_DATA.monthlyRevenue.value.toLocaleString()}`}
          change={KPI_DATA.monthlyRevenue.change}
          up={KPI_DATA.monthlyRevenue.up}
          icon={<DollarSign className="size-5" />}
        />
        <KpiCard
          title="Conversion Rate"
          value={`${KPI_DATA.conversionRate.value}%`}
          change={KPI_DATA.conversionRate.change}
          up={KPI_DATA.conversionRate.up}
          icon={<Target className="size-5" />}
        />
        <KpiCard
          title="Refund Rate"
          value={`${KPI_DATA.refundRate.value}%`}
          change={KPI_DATA.refundRate.change}
          up={KPI_DATA.refundRate.up}
          icon={<RotateCcw className="size-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart — Policies Sold */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Policies Sold
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Daily policies sold over the last {days} days
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyPolicies}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    interval={days > 14 ? 4 : 1}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="policies"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart — Revenue by Product */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Revenue by Product
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Monthly revenue breakdown by insurance type
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REVENUE_BY_PRODUCT}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="product"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    width={45}
                    tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                  />
                  <Bar
                    dataKey="revenue"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

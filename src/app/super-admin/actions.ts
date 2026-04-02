"use server";

import { createAdminClient } from "@/lib/supabase/admin";

// ─── Overview KPIs ────────────────────────────────────────────

export async function getOverviewStats() {
  const admin = createAdminClient();

  const [
    { count: totalTenants },
    { count: totalPolicies },
    { count: totalUsers },
    { data: revenueData },
    { data: recentTenants },
    { data: tenantSignups },
    { data: policiesByProduct },
  ] = await Promise.all([
    admin.from("tenants").select("*", { count: "exact", head: true }).neq("name", "Onboarding"),
    admin.from("policies").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("policies").select("premium").eq("status", "active"),
    admin
      .from("tenants")
      .select("id, name, slug, plan, status, created_at")
      .neq("name", "Onboarding")
      .order("created_at", { ascending: false })
      .limit(10),
    admin
      .from("tenants")
      .select("created_at")
      .neq("name", "Onboarding")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: true }),
    admin.from("policies").select("product_type"),
  ]);

  // Calculate total revenue
  const totalRevenue = (revenueData ?? []).reduce(
    (sum, p) => sum + Number(p.premium ?? 0),
    0
  );

  // Estimate MRR (active policies / 12)
  const platformMRR = totalRevenue / 12;

  // Signups by day (last 30 days)
  const signupsByDay: Record<string, number> = {};
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    signupsByDay[d.toISOString().split("T")[0]] = 0;
  }
  for (const t of tenantSignups ?? []) {
    const day = new Date(t.created_at).toISOString().split("T")[0];
    if (signupsByDay[day] !== undefined) signupsByDay[day]++;
  }

  // Policies by product type
  const productCounts: Record<string, number> = {};
  for (const p of policiesByProduct ?? []) {
    productCounts[p.product_type] = (productCounts[p.product_type] ?? 0) + 1;
  }

  return {
    totalTenants: totalTenants ?? 0,
    totalPolicies: totalPolicies ?? 0,
    totalUsers: totalUsers ?? 0,
    totalRevenue,
    platformMRR,
    recentTenants: recentTenants ?? [],
    signupChart: Object.entries(signupsByDay).map(([date, count]) => ({
      date,
      count,
    })),
    productChart: Object.entries(productCounts).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
    })),
  };
}

// ─── Tenants ──────────────────────────────────────────────────

export async function getAllTenants() {
  const admin = createAdminClient();

  const { data: tenants } = await admin
    .from("tenants")
    .select("id, name, slug, plan, status, created_at")
    .neq("name", "Onboarding")
    .order("created_at", { ascending: false });

  if (!tenants) return [];

  // For each tenant, get policies count and revenue
  const enriched = await Promise.all(
    tenants.map(async (tenant) => {
      const [{ count: policyCount }, { data: revData }] = await Promise.all([
        admin
          .from("policies")
          .select("*", { count: "exact", head: true })
          .eq("tenant_id", tenant.id),
        admin
          .from("policies")
          .select("premium")
          .eq("tenant_id", tenant.id)
          .eq("status", "active"),
      ]);

      const revenue = (revData ?? []).reduce(
        (sum, p) => sum + Number(p.premium ?? 0),
        0
      );

      return {
        ...tenant,
        policyCount: policyCount ?? 0,
        revenue,
      };
    })
  );

  return enriched;
}

export async function createTenant(formData: FormData) {
  const admin = createAdminClient();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const plan = (formData.get("plan") as string) || "free";

  if (!name || !slug) return { error: "Name and slug are required" };

  const { error } = await admin.from("tenants").insert({
    name,
    slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    plan,
    status: "active",
    brand_config: {
      company_name: name,
      primary_colour: "#4f46e5",
      secondary_colour: "#818cf8",
      font: "Inter",
      support_email: "",
    },
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateTenantStatus(tenantId: string, status: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("tenants")
    .update({ status })
    .eq("id", tenantId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteTenant(tenantId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("tenants")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", tenantId);

  if (error) return { error: error.message };
  return { success: true };
}

// ─── Policies ─────────────────────────────────────────────────

export async function getAllPolicies() {
  const admin = createAdminClient();

  const { data } = await admin
    .from("policies")
    .select(
      "id, tenant_id, customer_id, product_type, status, premium, start_date, end_date, created_at, tenants(name), customers(email)"
    )
    .order("created_at", { ascending: false })
    .limit(500);

  return (data ?? []).map((p) => ({
    id: p.id,
    tenantName: (p.tenants as { name: string }[] | null)?.[0]?.name ?? "Unknown",
    customerEmail: (p.customers as { email: string }[] | null)?.[0]?.email ?? "Unknown",
    productType: p.product_type,
    status: p.status,
    premium: Number(p.premium),
    startDate: p.start_date,
    endDate: p.end_date,
    createdAt: p.created_at,
  }));
}

// ─── Revenue ──────────────────────────────────────────────────

export async function getRevenueData() {
  const admin = createAdminClient();

  const { data: tenants } = await admin
    .from("tenants")
    .select("id, name, slug, plan")
    .neq("name", "Onboarding")
    .order("name");

  const { data: policies } = await admin
    .from("policies")
    .select("tenant_id, premium, status, created_at")
    .eq("status", "active");

  // Total revenue by tenant
  const tenantRevenue: Record<string, number> = {};
  const monthlyRevenue: Record<string, number> = {};

  for (const p of policies ?? []) {
    const premium = Number(p.premium ?? 0);
    tenantRevenue[p.tenant_id] = (tenantRevenue[p.tenant_id] ?? 0) + premium;

    const month = new Date(p.created_at).toISOString().slice(0, 7);
    monthlyRevenue[month] = (monthlyRevenue[month] ?? 0) + premium;
  }

  const totalRevenue = Object.values(tenantRevenue).reduce((a, b) => a + b, 0);

  const tenantBreakdown = (tenants ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    plan: t.plan,
    revenue: tenantRevenue[t.id] ?? 0,
    commission: (tenantRevenue[t.id] ?? 0) * 0.15, // 15% platform commission
  }));

  const revenueChart = Object.entries(monthlyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));

  return {
    totalRevenue,
    totalCommission: totalRevenue * 0.15,
    vatAmount: totalRevenue * 0.2,
    tenantBreakdown,
    revenueChart,
  };
}

// ─── Leaderboard ──────────────────────────────────────────────

export async function getLeaderboardData() {
  const admin = createAdminClient();

  const { data: tenants } = await admin
    .from("tenants")
    .select("id, name, slug")
    .neq("name", "Onboarding");

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

  const { data: allPolicies } = await admin.from("policies").select("tenant_id, premium, created_at, status");

  type TenantStats = {
    id: string;
    name: string;
    slug: string;
    policiesThisMonth: number;
    revenueThisMonth: number;
    policiesLastMonth: number;
    allTimePolicies: number;
    allTimeRevenue: number;
  };

  const stats: Record<string, TenantStats> = {};
  for (const t of tenants ?? []) {
    stats[t.id] = {
      id: t.id,
      name: t.name,
      slug: t.slug,
      policiesThisMonth: 0,
      revenueThisMonth: 0,
      policiesLastMonth: 0,
      allTimePolicies: 0,
      allTimeRevenue: 0,
    };
  }

  for (const p of allPolicies ?? []) {
    if (!stats[p.tenant_id]) continue;
    const premium = Number(p.premium ?? 0);
    const created = p.created_at;

    stats[p.tenant_id].allTimePolicies++;
    stats[p.tenant_id].allTimeRevenue += premium;

    if (created >= thisMonthStart) {
      stats[p.tenant_id].policiesThisMonth++;
      stats[p.tenant_id].revenueThisMonth += premium;
    } else if (created >= lastMonthStart && created < thisMonthStart) {
      stats[p.tenant_id].policiesLastMonth++;
    }
  }

  return Object.values(stats).sort(
    (a, b) => b.revenueThisMonth - a.revenueThisMonth
  );
}

// ─── Users ────────────────────────────────────────────────────

export async function getAllUsers() {
  const admin = createAdminClient();

  const { data } = await admin
    .from("profiles")
    .select("id, email, first_name, last_name, role, created_at, tenant_id, tenants(name)")
    .order("created_at", { ascending: false });

  return (data ?? []).map((u) => ({
    id: u.id,
    email: u.email,
    firstName: u.first_name,
    lastName: u.last_name,
    role: u.role,
    tenantName: (u.tenants as { name: string }[] | null)?.[0]?.name ?? "Unknown",
    tenantId: u.tenant_id,
    createdAt: u.created_at,
  }));
}

export async function updateUserRole(userId: string, role: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deactivateUser(userId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) return { error: error.message };
  return { success: true };
}

// ─── System ───────────────────────────────────────────────────

export async function getSystemStats() {
  const admin = createAdminClient();

  const tables = ["tenants", "profiles", "products", "customers", "policies", "error_logs"];
  const counts: Record<string, number> = {};

  await Promise.all(
    tables.map(async (table) => {
      const { count } = await admin
        .from(table)
        .select("*", { count: "exact", head: true });
      counts[table] = count ?? 0;
    })
  );

  // Recent error logs
  const { data: errorLogs } = await admin
    .from("error_logs")
    .select("id, type, message, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return {
    tableCounts: counts,
    errorLogs: errorLogs ?? [],
  };
}

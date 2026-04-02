import { DashboardSidebar } from "@/components/tenant/dashboard-sidebar";
import { DemoBanner } from "@/components/tenant/demo-banner";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getTenantSlug(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile?.tenant_id) return null;

    const { data: tenant } = await admin
      .from("tenants")
      .select("slug")
      .eq("id", profile.tenant_id)
      .single();

    return tenant?.slug ?? null;
  } catch {
    return null;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenantSlug = await getTenantSlug();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — fixed width, full height */}
      <DashboardSidebar tenantSlug={tenantSlug} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <DemoBanner />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Server-side guard for super admin pages.
 * Checks that the current user has role 'super_admin'.
 * Redirects to /dashboard if not authorised.
 *
 * Returns the admin's email and the service-role Supabase client.
 */
export async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("role, email, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "super_admin") {
    redirect("/dashboard");
  }

  return {
    adminEmail: profile.email,
    adminName: [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(" ") || profile.email,
    adminClient: admin,
    userId: user.id,
  };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Types ──────────────────────────────────────────────────

export type TenantRole = "owner" | "sales" | "finance" | "marketing" | "viewer";

export type TeamMember = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
  created_at: string;
};

const VALID_ROLES: TenantRole[] = [
  "owner",
  "sales",
  "finance",
  "marketing",
  "viewer",
];

// ─── Fetch team members ─────────────────────────────────────

export async function getTeamMembers(): Promise<{
  data: TeamMember[] | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  // Use admin client to bypass self-referencing RLS on profiles
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { data: null, error: "No profile found" };
  }

  const { data: members, error } = await admin
    .from("profiles")
    .select("id, first_name, last_name, email, role, created_at")
    .eq("tenant_id", profile.tenant_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: members, error: null };
}

// ─── Invite team member ─────────────────────────────────────

export async function inviteTeamMember(
  email: string,
  role: TenantRole
): Promise<{ success: boolean; error: string | null }> {
  // Validate inputs
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address" };
  }

  if (!VALID_ROLES.includes(role)) {
    return { success: false, error: "Invalid role" };
  }

  // Authenticate caller
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify caller is owner / super_admin (admin client to bypass RLS)
  const admin = createAdminClient();
  const { data: callerProfile } = await admin
    .from("profiles")
    .select("tenant_id, role")
    .eq("id", user.id)
    .single();

  if (!callerProfile) {
    return { success: false, error: "No profile found" };
  }

  if (!["super_admin", "owner"].includes(callerProfile.role)) {
    return {
      success: false,
      error: "Only owners can invite team members",
    };
  }

  // Check if user already exists in this tenant

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("tenant_id", callerProfile.tenant_id)
    .eq("email", email)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingProfile) {
    return {
      success: false,
      error: "A team member with this email already exists",
    };
  }

  // Invite via Supabase Auth
  const { data: inviteData, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email);

  if (inviteError) {
    // Handle the case where the user already exists in auth but not in this tenant
    if (inviteError.message?.includes("already been registered")) {
      return {
        success: false,
        error: "This email is already registered. Ask them to log in instead.",
      };
    }
    return { success: false, error: "Failed to send invitation" };
  }

  // Create profile row for the invited user
  const { error: profileError } = await admin.from("profiles").insert({
    id: inviteData.user.id,
    tenant_id: callerProfile.tenant_id,
    role,
    email,
  });

  if (profileError) {
    return {
      success: false,
      error: "Invitation sent but failed to create profile",
    };
  }

  return { success: true, error: null };
}

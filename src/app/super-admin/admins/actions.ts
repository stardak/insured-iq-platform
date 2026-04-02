"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getAdminUsers() {
  const admin = createAdminClient();

  const { data } = await admin
    .from("profiles")
    .select("id, email, first_name, last_name, role, created_at")
    .eq("role", "super_admin")
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function inviteAdmin(email: string) {
  const admin = createAdminClient();

  // Check if user already exists
  const { data: existing } = await admin
    .from("profiles")
    .select("id, role")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    if (existing.role === "super_admin") {
      return { error: "This user is already a super admin." };
    }
    // Upgrade existing user to super_admin
    const { error } = await admin
      .from("profiles")
      .update({ role: "super_admin" })
      .eq("id", existing.id);

    if (error) return { error: error.message };
    return { success: true, message: "User upgraded to super admin." };
  }

  // Invite new user via Supabase Auth
  const { data: inviteData, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email);

  if (inviteError) return { error: inviteError.message };

  // Pre-create profile with super_admin role and null tenant_id
  if (inviteData?.user) {
    await admin.from("profiles").insert({
      id: inviteData.user.id,
      email,
      role: "super_admin",
      tenant_id: null,
    });
  }

  return { success: true, message: "Invitation sent!" };
}

export async function removeAdmin(userId: string) {
  const admin = createAdminClient();

  // Downgrade to viewer (don't delete — they might have data)
  const { error } = await admin
    .from("profiles")
    .update({ role: "viewer" })
    .eq("id", userId);

  if (error) return { error: error.message };
  return { success: true };
}

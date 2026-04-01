"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BrandConfig } from "@/types/brand";

export async function getPortalBrandConfig(): Promise<{
  data: BrandConfig | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { data: null, error: "No profile found" };
  }

  const { data: tenant, error } = await admin
    .from("tenants")
    .select("name, brand_config")
    .eq("id", profile.tenant_id)
    .single();

  if (error || !tenant) {
    return { data: null, error: error?.message ?? "Tenant not found" };
  }

  const config = (tenant.brand_config ?? {}) as Partial<BrandConfig>;

  return {
    data: {
      company_name: config.company_name ?? tenant.name ?? "",
      logo_url: config.logo_url ?? "",
      primary_colour: config.primary_colour ?? "#4F46E5",
      secondary_colour: config.secondary_colour ?? "#10B981",
      font: config.font ?? "Inter",
      support_email: config.support_email ?? "",
    },
    error: null,
  };
}

export async function portalSignOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/portal/login");
}

export async function getPortalUser(): Promise<{
  name: string;
  email: string;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    name: [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Customer",
    email: profile.email,
  };
}

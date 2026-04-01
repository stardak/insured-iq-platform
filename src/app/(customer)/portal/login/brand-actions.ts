"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { BrandConfig } from "@/types/brand";

/**
 * Fetch brand config for the portal login page using a tenant slug.
 * This does NOT require authentication — it's used on the public login page.
 */
export async function getTenantBrandBySlug(slug: string): Promise<{
  data: BrandConfig | null;
  error: string | null;
}> {
  if (!slug) {
    return { data: null, error: "No tenant specified" };
  }

  const admin = createAdminClient();

  const { data: tenant, error } = await admin
    .from("tenants")
    .select("name, brand_config")
    .eq("slug", slug)
    .single();

  if (error || !tenant) {
    return { data: null, error: "Tenant not found" };
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

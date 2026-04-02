"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PageConfig } from "@/types/brand";
import { DEFAULT_PAGE_CONFIG } from "@/types/brand";

/**
 * Get the tenant's page_config from brand_config.
 */
export async function getPageConfig(): Promise<{
  data: PageConfig | null;
  error: string | null;
  slug: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Not authenticated", slug: null };
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { data: null, error: "No profile found", slug: null };
  }

  const { data: tenant, error } = await admin
    .from("tenants")
    .select("brand_config, slug")
    .eq("id", profile.tenant_id)
    .single();

  if (error || !tenant) {
    return { data: null, error: error?.message ?? "Tenant not found", slug: null };
  }

  const brandConfig = (tenant.brand_config ?? {}) as Record<string, unknown>;
  const pageConfig = (brandConfig.page_config ?? null) as PageConfig | null;

  return {
    data: pageConfig ?? DEFAULT_PAGE_CONFIG,
    error: null,
    slug: (tenant as Record<string, unknown>).slug as string | null,
  };
}

/**
 * Save the tenant's page_config into brand_config.
 */
export async function savePageConfig(
  config: PageConfig
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("tenant_id, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { success: false, error: "No profile found" };
  }

  if (!["super_admin", "owner"].includes(profile.role)) {
    return {
      success: false,
      error: "Only owners can update page settings",
    };
  }

  // Get existing brand_config to merge
  const { data: tenant } = await admin
    .from("tenants")
    .select("brand_config")
    .eq("id", profile.tenant_id)
    .single();

  const existingConfig = (tenant?.brand_config ?? {}) as Record<string, unknown>;

  const { error } = await admin
    .from("tenants")
    .update({
      brand_config: {
        ...existingConfig,
        page_config: config,
      },
    })
    .eq("id", profile.tenant_id);

  if (error) {
    return { success: false, error: "Failed to save page config" };
  }

  return { success: true, error: null };
}

/**
 * Upload a hero image to Supabase Storage.
 */
export async function uploadHeroImage(
  formData: FormData
): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { url: null, error: "Not authenticated" };
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { url: null, error: "No profile found" };
  }

  const file = formData.get("hero") as File;
  if (!file || file.size === 0) {
    return { url: null, error: "No file provided" };
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { url: null, error: "File must be PNG, JPG, or WebP" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { url: null, error: "File must be under 5MB" };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const filePath = `${profile.tenant_id}/hero.${ext}`;

  const { error } = await supabase.storage
    .from("brand-assets")
    .upload(filePath, file, { upsert: true });

  if (error) {
    return { url: null, error: "Failed to upload hero image" };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("brand-assets").getPublicUrl(filePath);

  return { url: publicUrl, error: null };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { brandConfigSchema, type BrandConfig } from "@/types/brand";

export async function getBrandConfig(): Promise<{
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

  // Use admin client for profile/tenant queries to bypass RLS
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { data: null, error: "No profile found" };
  }

  // Get the tenant's brand_config
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

export async function saveBrandConfig(
  values: BrandConfig
): Promise<{ success: boolean; error: string | null }> {
  // Validate input
  const parsed = brandConfigSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e: { message: string }) => e.message).join(", "),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Use admin client for profile queries to bypass RLS
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
      error: "Only owners can update brand settings",
    };
  }

  // Update both the tenant name and brand_config
  const { error } = await admin
    .from("tenants")
    .update({
      name: parsed.data.company_name,
      brand_config: parsed.data,
    })
    .eq("id", profile.tenant_id);

  if (error) {
    return { success: false, error: "Failed to save brand settings" };
  }

  return { success: true, error: null };
}

export async function uploadLogo(
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

  const file = formData.get("logo") as File;
  if (!file || file.size === 0) {
    return { url: null, error: "No file provided" };
  }

  // Validate file type
  const allowedTypes = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { url: null, error: "File must be PNG, JPG, SVG, or WebP" };
  }

  // Max 2MB
  if (file.size > 2 * 1024 * 1024) {
    return { url: null, error: "File must be under 2MB" };
  }

  const ext = file.name.split(".").pop() ?? "png";
  const filePath = `${profile.tenant_id}/logo.${ext}`;

  const { error } = await admin.storage
    .from("brand-assets")
    .upload(filePath, file, { upsert: true });

  if (error) {
    console.error("Logo upload error:", error);
    return { url: null, error: error.message || "Failed to upload logo" };
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("brand-assets").getPublicUrl(filePath);

  return { url: publicUrl, error: null };
}

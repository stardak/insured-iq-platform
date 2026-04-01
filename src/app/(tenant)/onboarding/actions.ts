"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface OnboardingResult {
  success: boolean;
  error?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

export async function generateSlug(companyName: string): Promise<string> {
  return slugify(companyName);
}

export async function completeOnboarding(
  formData: FormData
): Promise<OnboardingResult> {
  const supabase = await createClient();

  // Verify authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const companyName = (formData.get("companyName") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();

  // Validate inputs
  if (!companyName || companyName.length < 2) {
    return {
      success: false,
      error: "Company name must be at least 2 characters",
    };
  }

  if (!slug || slug.length < 2) {
    return { success: false, error: "Slug must be at least 2 characters" };
  }

  const slugRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
  if (!slugRegex.test(slug)) {
    return {
      success: false,
      error:
        "Slug must start and end with a letter or number, and contain only lowercase letters, numbers, and hyphens",
    };
  }

  // Check slug uniqueness (exclude placeholder tenants)
  const { data: existingTenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .not("name", "eq", "Onboarding")
    .maybeSingle();

  if (existingTenant) {
    return {
      success: false,
      error: "This slug is already taken. Please choose another.",
    };
  }

  // Get the user's current profile to find the placeholder tenant
  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { success: false, error: "Profile not found" };
  }

  const placeholderTenantId = profile.tenant_id;

  // Create the real tenant
  const { data: newTenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({
      name: companyName,
      slug,
      status: "active",
      plan: "free",
      brand_config: {},
    })
    .select("id")
    .single();

  if (tenantError || !newTenant) {
    return {
      success: false,
      error: "Failed to create tenant. Please try again.",
    };
  }

  // Update the profile to point to the real tenant
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ tenant_id: newTenant.id })
    .eq("id", user.id);

  if (profileError) {
    // Clean up: delete the tenant we just created
    await supabase.from("tenants").delete().eq("id", newTenant.id);
    return {
      success: false,
      error: "Failed to update profile. Please try again.",
    };
  }

  // Delete the placeholder tenant
  await supabase.from("tenants").delete().eq("id", placeholderTenantId);

  redirect("/dashboard/brand");
}

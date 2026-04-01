"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

  // Use admin client (service role) to bypass RLS for onboarding operations.
  const admin = createAdminClient();

  // Check slug uniqueness (exclude placeholder tenants)
  const { data: existingTenant } = await admin
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

  // Check if profile already exists
  const { data: profile } = await admin
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .maybeSingle();

  // Create the real tenant
  const { data: newTenant, error: tenantError } = await admin
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
    console.error("[onboarding] Failed to create tenant:", tenantError?.message);
    return {
      success: false,
      error: "Failed to create tenant. Please try again.",
    };
  }

  if (profile) {
    // Profile exists (trigger ran) — update it to point to the real tenant
    const placeholderTenantId = profile.tenant_id;

    const { error: updateError } = await admin
      .from("profiles")
      .update({ tenant_id: newTenant.id })
      .eq("id", user.id);

    if (updateError) {
      await admin.from("tenants").delete().eq("id", newTenant.id);
      console.error("[onboarding] Failed to update profile:", updateError.message);
      return {
        success: false,
        error: "Failed to update profile. Please try again.",
      };
    }

    // Clean up placeholder tenant
    await admin
      .from("tenants")
      .delete()
      .eq("id", placeholderTenantId)
      .eq("name", "Onboarding");
  } else {
    // No profile exists (user signed up before trigger was applied)
    // Create the profile directly, pointing to the real tenant
    const { error: insertError } = await admin.from("profiles").insert({
      id: user.id,
      tenant_id: newTenant.id,
      role: "owner",
      email: user.email!,
    });

    if (insertError) {
      await admin.from("tenants").delete().eq("id", newTenant.id);
      console.error("[onboarding] Failed to create profile:", insertError.message);
      return {
        success: false,
        error: "Failed to create profile. Please try again.",
      };
    }
  }

  redirect("/dashboard/brand");
}

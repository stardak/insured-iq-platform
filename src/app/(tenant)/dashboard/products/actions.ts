"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProductType = "car" | "pet" | "life" | "bike" | "home" | "health";

export type ProductState = {
  id: string | null;
  type: ProductType;
  enabled: boolean;
};

/**
 * Fetch all products for the current tenant.
 * Returns a record keyed by product type for easy lookup.
 */
export async function getProducts(): Promise<{
  data: Record<ProductType, ProductState> | null;
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

  const { data: products, error } = await supabase
    .from("products")
    .select("id, type, enabled")
    .eq("tenant_id", profile.tenant_id);

  if (error) {
    return { data: null, error: error.message };
  }

  // Build full map — default to disabled for products that don't exist yet
  const allTypes: ProductType[] = ["car", "pet", "life", "bike", "home", "health"];
  const map = {} as Record<ProductType, ProductState>;

  for (const type of allTypes) {
    const existing = products?.find((p) => p.type === type);
    map[type] = {
      id: existing?.id ?? null,
      type,
      enabled: existing?.enabled ?? false,
    };
  }

  return { data: map, error: null };
}

/**
 * Toggle a product on or off. Creates the product row if it doesn't exist yet
 * (upsert on the unique tenant_id + type constraint).
 */
export async function toggleProduct(
  type: ProductType,
  enabled: boolean
): Promise<{ success: boolean; error: string | null }> {
  const validTypes: ProductType[] = ["car", "pet", "life", "bike", "home", "health"];
  if (!validTypes.includes(type)) {
    return { success: false, error: "Invalid product type" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Use admin client to bypass self-referencing RLS on profiles
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
      error: "Only owners can manage products",
    };
  }

  const { error } = await supabase
    .from("products")
    .upsert(
      {
        tenant_id: profile.tenant_id,
        type,
        enabled,
      },
      { onConflict: "tenant_id,type" }
    );

  if (error) {
    return { success: false, error: "Failed to update product" };
  }

  return { success: true, error: null };
}

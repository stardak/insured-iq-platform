"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { BrandConfig, PageConfig } from "@/types/brand";
import { DEFAULT_PAGE_CONFIG } from "@/types/brand";

export type ProductType = "car" | "pet" | "life" | "bike" | "home" | "health";

export interface PreviewProduct {
  type: ProductType;
  label: string;
  description: string;
  icon: string;
}

const PRODUCT_META: Record<
  ProductType,
  { label: string; description: string; icon: string }
> = {
  car: { label: "Car Insurance", description: "Motor vehicle coverage including comprehensive, third-party, and collision.", icon: "Car" },
  pet: { label: "Pet Insurance", description: "Veterinary bills, accidents, and illness cover for cats and dogs.", icon: "PawPrint" },
  life: { label: "Life Insurance", description: "Financial protection for beneficiaries in the event of death or critical illness.", icon: "Heart" },
  bike: { label: "Bike Insurance", description: "Theft, damage, and liability coverage for bicycles and e-bikes.", icon: "Bike" },
  home: { label: "Home Insurance", description: "Buildings and contents protection against fire, flood, and theft.", icon: "Home" },
  health: { label: "Health Insurance", description: "Private medical cover including GP visits, hospital stays, and prescriptions.", icon: "Activity" },
};

export interface PreviewTenantData {
  brand: BrandConfig;
  products: PreviewProduct[];
  tenantName: string;
  pageConfig: PageConfig;
}

export async function getPreviewData(slug: string): Promise<{
  data: PreviewTenantData | null;
  error: string | null;
}> {
  if (!slug) return { data: null, error: "No slug" };

  const admin = createAdminClient();

  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .select("id, name, brand_config")
    .eq("slug", slug)
    .single();

  if (tenantError || !tenant) {
    return { data: null, error: "Tenant not found" };
  }

  const { data: products } = await admin
    .from("products")
    .select("type, enabled")
    .eq("tenant_id", tenant.id)
    .eq("enabled", true);

  const config = (tenant.brand_config ?? {}) as Partial<BrandConfig>;

  const brand: BrandConfig = {
    company_name: config.company_name ?? tenant.name ?? "",
    logo_url: config.logo_url ?? "",
    primary_colour: config.primary_colour ?? "#4F46E5",
    secondary_colour: config.secondary_colour ?? "#10B981",
    font: config.font ?? "Inter",
    support_email: config.support_email ?? "",
  };

  const enabledProducts: PreviewProduct[] = (products ?? [])
    .filter((p: { type: string }) => PRODUCT_META[p.type as ProductType])
    .map((p: { type: string }) => {
      const type = p.type as ProductType;
      const meta = PRODUCT_META[type];
      return { type, label: meta.label, description: meta.description, icon: meta.icon };
    });

  const rawBrandConfig = (tenant.brand_config ?? {}) as Record<string, unknown>;
  const pageConfig = (rawBrandConfig.page_config ?? DEFAULT_PAGE_CONFIG) as PageConfig;

  return {
    data: { brand, products: enabledProducts, tenantName: brand.company_name || tenant.name, pageConfig },
    error: null,
  };
}

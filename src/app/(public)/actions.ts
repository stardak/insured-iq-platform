"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { BrandConfig, PageConfig } from "@/types/brand";
import { DEFAULT_BRAND_CONFIG, DEFAULT_PAGE_CONFIG } from "@/types/brand";

// ─── Product types & metadata ────────────────────────────────

export type ProductType = "car" | "pet" | "life" | "bike" | "home" | "health";

export interface PublicProduct {
  type: ProductType;
  label: string;
  description: string;
  icon: string; // lucide icon name — rendered on the client
}

const PRODUCT_META: Record<
  ProductType,
  { label: string; description: string; icon: string }
> = {
  car: {
    label: "Car Insurance",
    description:
      "Motor vehicle coverage including comprehensive, third-party, and collision.",
    icon: "Car",
  },
  pet: {
    label: "Pet Insurance",
    description:
      "Veterinary bills, accidents, and illness cover for cats and dogs.",
    icon: "PawPrint",
  },
  life: {
    label: "Life Insurance",
    description:
      "Financial protection for beneficiaries in the event of death or critical illness.",
    icon: "Heart",
  },
  bike: {
    label: "Bike Insurance",
    description:
      "Theft, damage, and liability coverage for bicycles and e-bikes.",
    icon: "Bike",
  },
  home: {
    label: "Home Insurance",
    description:
      "Buildings and contents protection against fire, flood, and theft.",
    icon: "Home",
  },
  health: {
    label: "Health Insurance",
    description:
      "Private medical cover including GP visits, hospital stays, and prescriptions.",
    icon: "Activity",
  },
};

// ─── Coverage details per product (mock) ─────────────────────

export interface CoverageDetail {
  category: string;
  items: string[];
}

const PRODUCT_COVERAGE: Record<ProductType, CoverageDetail[]> = {
  car: [
    {
      category: "Comprehensive Cover",
      items: [
        "Accidental damage to your vehicle",
        "Fire and theft protection",
        "Third-party liability up to £20M",
        "Windscreen repair and replacement",
      ],
    },
    {
      category: "Additional Benefits",
      items: [
        "Courtesy car while yours is repaired",
        "Personal belongings cover up to £500",
        "24/7 roadside breakdown assistance",
        "No-claims discount protection",
      ],
    },
  ],
  pet: [
    {
      category: "Vet Fees",
      items: [
        "Illness and accident treatment",
        "Diagnostic tests and scans",
        "Prescription medication",
        "Specialist referral fees",
      ],
    },
    {
      category: "Additional Benefits",
      items: [
        "Third-party liability up to £2M",
        "Lost & found advertising costs",
        "Kennel/cattery fees if you're hospitalised",
        "Death from illness or accident",
      ],
    },
  ],
  life: [
    {
      category: "Core Protection",
      items: [
        "Lump-sum payout on death",
        "Terminal illness cover included",
        "Fixed monthly premiums",
        "Cover from £50,000 to £1,000,000",
      ],
    },
    {
      category: "Optional Extras",
      items: [
        "Critical illness add-on",
        "Waiver of premium on incapacity",
        "Children's cover included",
        "Worldwide protection",
      ],
    },
  ],
  bike: [
    {
      category: "Theft & Damage",
      items: [
        "Theft from home or in public",
        "Accidental damage cover",
        "Malicious damage protection",
        "New-for-old replacement",
      ],
    },
    {
      category: "Cycling Extras",
      items: [
        "Personal accident cover",
        "Third-party liability up to £5M",
        "Race & event cover",
        "Accessories and kit protection",
      ],
    },
  ],
  home: [
    {
      category: "Buildings Cover",
      items: [
        "Structural damage from flood, fire, storm",
        "Subsidence and ground heave",
        "Repair and rebuild costs",
        "Alternative accommodation",
      ],
    },
    {
      category: "Contents Cover",
      items: [
        "Personal possessions protection",
        "High-value items cover",
        "Accidental damage option",
        "Away-from-home cover for belongings",
      ],
    },
  ],
  health: [
    {
      category: "Medical Cover",
      items: [
        "In-patient and day-patient treatment",
        "Out-patient consultations and tests",
        "Mental health support",
        "Cancer treatment cover",
      ],
    },
    {
      category: "Wellness Benefits",
      items: [
        "GP video consultations 24/7",
        "Prescription delivery service",
        "Physiotherapy sessions",
        "Optical and dental cashback",
      ],
    },
  ],
};

// ─── Server actions ──────────────────────────────────────────

export interface TenantPublicData {
  brand: BrandConfig;
  products: PublicProduct[];
  tenantName: string;
  pageConfig: PageConfig;
}

/**
 * Fetch a tenant's brand config and enabled products for public display.
 * Uses admin client — no auth required.
 */
export async function getTenantBySlug(slug: string): Promise<{
  data: TenantPublicData | null;
  error: string | null;
}> {
  if (!slug) {
    return { data: null, error: "No tenant specified" };
  }

  const admin = createAdminClient();

  // Get tenant
  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .select("id, name, brand_config")
    .eq("slug", slug)
    .single();

  if (tenantError || !tenant) {
    return { data: null, error: "Tenant not found" };
  }

  // Get enabled products
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

  const enabledProducts: PublicProduct[] = (products ?? [])
    .filter((p: { type: string }) => PRODUCT_META[p.type as ProductType])
    .map((p: { type: string }) => {
      const type = p.type as ProductType;
      const meta = PRODUCT_META[type];
      return {
        type,
        label: meta.label,
        description: meta.description,
        icon: meta.icon,
      };
    });

  // Parse page_config from brand_config
  const rawBrandConfig = (tenant.brand_config ?? {}) as Record<string, unknown>;
  const pageConfig = (rawBrandConfig.page_config ?? DEFAULT_PAGE_CONFIG) as PageConfig;

  return {
    data: {
      brand,
      products: enabledProducts,
      tenantName: brand.company_name || tenant.name,
      pageConfig,
    },
    error: null,
  };
}

/**
 * Get product detail for a specific product type under a tenant.
 */
export async function getProductDetail(
  slug: string,
  productType: string
): Promise<{
  data: {
    brand: BrandConfig;
    product: PublicProduct;
    coverage: CoverageDetail[];
    tenantName: string;
  } | null;
  error: string | null;
}> {
  if (!PRODUCT_META[productType as ProductType]) {
    return { data: null, error: "Invalid product type" };
  }

  const { data: tenantData, error } = await getTenantBySlug(slug);
  if (error || !tenantData) {
    return { data: null, error: error ?? "Tenant not found" };
  }

  const type = productType as ProductType;
  const meta = PRODUCT_META[type];

  // Check if this product is enabled for the tenant
  const isEnabled = tenantData.products.some((p) => p.type === type);
  if (!isEnabled) {
    return { data: null, error: "Product not available" };
  }

  return {
    data: {
      brand: tenantData.brand,
      product: {
        type,
        label: meta.label,
        description: meta.description,
        icon: meta.icon,
      },
      coverage: PRODUCT_COVERAGE[type],
      tenantName: tenantData.tenantName,
    },
    error: null,
  };
}

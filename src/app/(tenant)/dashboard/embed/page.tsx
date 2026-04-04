import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EmbedPageClient } from "@/components/tenant/embed-page-client";
import type { BrandConfig } from "@/types/brand";

type ProductType = "car" | "pet" | "life" | "bike" | "home" | "health";

const PRODUCT_META: Record<ProductType, { label: string; icon: string }> = {
  car: { label: "Car Insurance", icon: "Car" },
  pet: { label: "Pet Insurance", icon: "PawPrint" },
  life: { label: "Life Insurance", icon: "Heart" },
  bike: { label: "Bike Insurance", icon: "Bike" },
  home: { label: "Home Insurance", icon: "Home" },
  health: { label: "Health Insurance", icon: "Activity" },
};

async function getEmbedData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id) {
    redirect("/login");
  }

  const { data: tenant } = await admin
    .from("tenants")
    .select("id, slug, name, brand_config")
    .eq("id", profile.tenant_id)
    .single();

  if (!tenant?.slug) {
    redirect("/login");
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

  const enabledProducts = (products ?? [])
    .filter((p: { type: string }) => PRODUCT_META[p.type as ProductType])
    .map((p: { type: string }) => ({
      type: p.type as ProductType,
      label: PRODUCT_META[p.type as ProductType].label,
      icon: PRODUCT_META[p.type as ProductType].icon,
    }));

  return {
    slug: tenant.slug,
    brand,
    products: enabledProducts,
  };
}

export default async function EmbedPage() {
  const data = await getEmbedData();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Embed Widget
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Add an insurance quote widget to any website with a single script tag.
        </p>
      </div>

      <EmbedPageClient
        slug={data.slug}
        brand={data.brand}
        products={data.products}
      />
    </div>
  );
}

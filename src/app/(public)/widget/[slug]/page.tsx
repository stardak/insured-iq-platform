import { notFound } from "next/navigation";
import { getTenantBySlug } from "../../actions";
import WidgetClient from "./widget-client";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getTenantBySlug(slug);
  if (!data) return { title: "Widget" };

  return {
    title: `${data.tenantName} — Get a Quote`,
    description: `Get an insurance quote from ${data.tenantName}.`,
  };
}

export default async function WidgetPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const { data, error } = await getTenantBySlug(slug);

  if (error || !data) {
    notFound();
  }

  // Parse search params for customisation
  const productsFilter = typeof sp.products === "string"
    ? sp.products.split(",").filter(Boolean)
    : undefined;
  const preSelectedProduct = typeof sp.product === "string" ? sp.product : undefined;
  const ctaText = typeof sp.cta === "string" ? sp.cta : "Get a quote";

  // Filter products if specified
  const filteredProducts = productsFilter
    ? data.products.filter((p) => productsFilter.includes(p.type))
    : data.products;

  return (
    <WidgetClient
      brand={data.brand}
      products={filteredProducts}
      tenantName={data.tenantName}
      preSelectedProduct={preSelectedProduct}
      ctaText={ctaText}
    />
  );
}

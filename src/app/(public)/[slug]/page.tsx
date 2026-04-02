import { notFound } from "next/navigation";
import { getTenantBySlug } from "../actions";
import Link from "next/link";
import {
  Car,
  PawPrint,
  Heart,
  Bike,
  Home,
  Activity,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

// ─── Icon map (can't pass components from server actions) ────

const ICON_MAP: Record<string, LucideIcon> = {
  Car,
  PawPrint,
  Heart,
  Bike,
  Home,
  Activity,
};

// ─── SEO metadata ────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getTenantBySlug(slug);
  if (!data) return { title: "Not Found" };

  return {
    title: `${data.tenantName} — Insurance`,
    description: `Get insurance quotes from ${data.tenantName}. We offer ${data.products.map((p) => p.label.toLowerCase()).join(", ")}.`,
  };
}

// ─── Page ────────────────────────────────────────────────────

export default async function TenantLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getTenantBySlug(slug);

  if (error || !data) {
    notFound();
  }

  const { brand, products, tenantName } = data;

  return (
    <div>
      {/* Hero */}
      <section
        className="relative overflow-hidden py-20 sm:py-28"
        style={{
          background: `linear-gradient(135deg, ${brand.primary_colour}08 0%, ${brand.secondary_colour}08 100%)`,
        }}
      >
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Insurance made{" "}
            <span style={{ color: brand.primary_colour }}>simple</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Get covered in minutes with {tenantName}. Choose from our range
            of insurance products and get a quote tailored to your needs.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Our Products
          </h2>
          <p className="mt-2 text-muted-foreground">
            Choose the type of insurance you need
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed py-16 text-center">
            <p className="text-muted-foreground">
              No products available at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const Icon = ICON_MAP[product.icon] ?? Activity;
              return (
                <Link key={product.type} href={`/${slug}/${product.type}`}>
                  <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer h-full">
                    <div
                      className="absolute inset-x-0 top-0 h-1 transition-transform origin-left scale-x-0 group-hover:scale-x-100"
                      style={{ backgroundColor: brand.primary_colour }}
                    />
                    <CardContent className="pt-6 pb-6">
                      <div className="flex items-start gap-4">
                        <div
                          className="flex size-12 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: `${brand.primary_colour}10`,
                            color: brand.primary_colour,
                          }}
                        >
                          <Icon className="size-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base group-hover:underline underline-offset-2">
                            {product.label}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                            {product.description}
                          </p>
                          <div
                            className="mt-3 flex items-center gap-1 text-sm font-medium"
                            style={{ color: brand.primary_colour }}
                          >
                            Learn more
                            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Trust bar */}
      <section className="border-t bg-gray-50/50 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-2xl font-bold" style={{ color: brand.primary_colour }}>
                24/7
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Claims support</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: brand.primary_colour }}>
                5 min
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Average quote time</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: brand.primary_colour }}>
                FCA
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Authorised & regulated</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: brand.primary_colour }}>
                4.8★
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Customer rating</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

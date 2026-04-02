import { notFound } from "next/navigation";
import { getProductDetail } from "../../actions";
import Link from "next/link";
import {
  Car,
  PawPrint,
  Heart,
  Bike,
  Home,
  Activity,
  Check,
  ChevronLeft,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

// ─── Icon map ────────────────────────────────────────────────

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
  params: Promise<{ slug: string; product: string }>;
}): Promise<Metadata> {
  const { slug, product } = await params;
  const { data } = await getProductDetail(slug, product);
  if (!data) return { title: "Not Found" };

  return {
    title: `${data.product.label} — ${data.tenantName}`,
    description: `${data.product.description} Get a quote from ${data.tenantName} today.`,
  };
}

// ─── Page ────────────────────────────────────────────────────

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; product: string }>;
}) {
  const { slug, product } = await params;
  const { data, error } = await getProductDetail(slug, product);

  if (error || !data) {
    notFound();
  }

  const { brand, product: productInfo, coverage, tenantName } = data;
  const Icon = ICON_MAP[productInfo.icon] ?? Activity;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b bg-gray-50/50">
        <div className="mx-auto max-w-6xl px-6 py-3">
          <Link
            href={`/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="size-4" />
            Back to {tenantName}
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section
        className="py-16 sm:py-20"
        style={{
          background: `linear-gradient(135deg, ${brand.primary_colour}06 0%, ${brand.secondary_colour}06 100%)`,
        }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div
              className="flex size-16 shrink-0 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `${brand.primary_colour}12`,
                color: brand.primary_colour,
              }}
            >
              <Icon className="size-8" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {productInfo.label}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                {productInfo.description}
              </p>
              <Button
                size="lg"
                className="mt-3 text-white"
                style={{ backgroundColor: brand.primary_colour }}
              >
                Get a quote
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage details */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-bold tracking-tight mb-8">
          What&apos;s covered
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {coverage.map((section) => (
            <Card key={section.category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{section.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: `${brand.primary_colour}15`,
                          color: brand.primary_colour,
                        }}
                      >
                        <Check className="size-3" />
                      </div>
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section
        className="py-12"
        style={{
          background: `linear-gradient(135deg, ${brand.primary_colour}08 0%, ${brand.secondary_colour}08 100%)`,
        }}
      >
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h3 className="text-xl font-semibold mb-2">
            Ready to get covered?
          </h3>
          <p className="text-muted-foreground mb-6">
            Get a personalised {productInfo.label.toLowerCase()} quote in under
            5 minutes.
          </p>
          <Button
            size="lg"
            className="text-white"
            style={{ backgroundColor: brand.primary_colour }}
          >
            Get a quote
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}

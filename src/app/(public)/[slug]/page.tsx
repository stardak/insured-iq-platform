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
  Shield,
  Clock,
  Headphones,
  Star,
  Zap,
  Target,
  Award,
  Globe,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";
import type {
  PageConfig,
  PageSection,
  FaqItem,
  TestimonialItem,
  FeatureItem,
} from "@/types/brand";
import FaqDisclosure from "./faq-disclosure";
import HeroVideo from "./hero-video";

// ─── Icon map ────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Car,
  PawPrint,
  Heart,
  Bike,
  Home,
  Activity,
  Shield,
  Clock,
  Headphones,
  HeadphonesIcon: Headphones,
  Star,
  Zap,
  Target,
  Award,
  Globe,
  Briefcase,
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

// ─── Hero Section (Tailwind Plus: simple-centered-with-background-image) ─────

function HeroSection({
  headline,
  subheadline,
  ctaPrimary,
  ctaSecondary,
  heroImage,
  heroVideoUrl,
  primaryColour,
  secondaryColour,
  slug,
  dark,
}: {
  headline: string | null;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
  heroImage: string | null;
  heroVideoUrl: string | null;
  primaryColour: string;
  secondaryColour: string;
  slug: string;
  dark: boolean;
}) {
  const hasBgImage = !!heroImage;
  const hasBgVideo = !!heroVideoUrl;
  // Text colors: dark mode, hero-image, or hero-video all use light text
  const lightText = dark || hasBgImage || hasBgVideo;

  return (
    <div
      className={`relative isolate overflow-hidden ${
        dark ? "bg-slate-900" : "bg-white"
      }`}
    >
      {/* Background video */}
      {hasBgVideo ? (
        <>
          <HeroVideo src={heroVideoUrl} />
          <div className="absolute inset-0 -z-10 bg-black/60" />
        </>
      ) : hasBgImage ? (
        <>
          <img
            alt=""
            src={heroImage}
            className="absolute inset-0 -z-10 size-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-black/50" />
        </>
      ) : (
        <div
          className={`absolute inset-0 -z-10 ${dark ? "opacity-10" : "opacity-[0.03]"}`}
          style={{
            background: `radial-gradient(circle at 20% 30%, ${primaryColour} 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${secondaryColour} 0%, transparent 50%)`,
          }}
        />
      )}

      {/* Decorative gradient blobs */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            background: `linear-gradient(to top right, ${primaryColour}, ${secondaryColour})`,
          }}
          className={`relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] ${
            dark ? "opacity-30" : "opacity-20"
          }`}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          {/* Badge pill */}
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div
              className={`relative rounded-full px-3 py-1 text-sm/6 ring-1 ${
                lightText
                  ? "text-white/80 ring-white/20"
                  : "text-gray-600 ring-gray-900/10 hover:ring-gray-900/20"
              }`}
            >
              <span
                className="mr-2 inline-block size-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: lightText ? "#fff" : secondaryColour,
                }}
              />
              Trusted by thousands of customers
            </div>
          </div>

          <div className="text-center">
            {headline ? (
              <h1
                className={`text-5xl font-semibold tracking-tight text-balance sm:text-7xl ${
                  lightText ? "text-white" : "text-gray-900"
                }`}
              >
                {headline}
              </h1>
            ) : (
              <h1
                className={`text-5xl font-semibold tracking-tight text-balance sm:text-7xl ${
                  lightText ? "text-white" : "text-gray-900"
                }`}
              >
                Insurance made{" "}
                <span
                  style={{
                    color: lightText ? primaryColour : primaryColour,
                  }}
                >
                  simple
                </span>
              </h1>
            )}

            <p
              className={`mt-8 text-lg font-medium text-pretty sm:text-xl/8 ${
                lightText ? "text-white/80" : "text-gray-600"
              }`}
            >
              {subheadline}
            </p>

            {/* Two CTA buttons */}
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#products"
                className="rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 transition-all hover:opacity-90"
                style={{
                  backgroundColor: primaryColour,
                  outlineColor: primaryColour,
                }}
              >
                {ctaPrimary}
              </a>
              <a
                href={`/portal/login?tenant=${slug}`}
                className={`text-sm/6 font-semibold ${
                  lightText ? "text-white" : "text-gray-900"
                }`}
              >
                {ctaSecondary} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative blob */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            background: `linear-gradient(to top right, ${secondaryColour}, ${primaryColour})`,
          }}
          className={`relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] ${
            dark ? "opacity-30" : "opacity-20"
          }`}
        />
      </div>
    </div>
  );
}

// ─── Testimonials Section ────────────────────────────────────

function TestimonialsSection({
  section,
  primaryColour,
  dark,
}: {
  section: PageSection;
  primaryColour: string;
  dark: boolean;
}) {
  const items = section.content.items as TestimonialItem[];
  if (!items.length) return null;

  return (
    <div className={`py-24 sm:py-32 ${dark ? "bg-slate-900" : "bg-white"}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-base/7 font-semibold"
            style={{ color: primaryColour }}
          >
            Testimonials
          </h2>
          <p
            className={`mt-2 text-4xl font-semibold tracking-tight text-balance sm:text-5xl ${
              dark ? "text-white" : "text-gray-900"
            }`}
          >
            What our customers say
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <div key={i}>
                <figure
                  className={`rounded-2xl p-8 text-sm/6 ${
                    dark ? "bg-slate-800" : "bg-gray-50"
                  }`}
                >
                  {/* Star rating */}
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, star) => (
                      <Star
                        key={star}
                        className={`size-4 ${
                          star < item.rating
                            ? "fill-amber-400 text-amber-400"
                            : dark
                              ? "text-slate-600"
                              : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>

                  <blockquote
                    className={dark ? "text-gray-200" : "text-gray-900"}
                  >
                    <p>{`\u201c${item.quote}\u201d`}</p>
                  </blockquote>

                  <figcaption className="mt-6 flex items-center gap-x-4">
                    <div
                      className="flex size-10 items-center justify-center rounded-full text-white text-xs font-bold"
                      style={{ backgroundColor: primaryColour }}
                    >
                      {item.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div
                        className={`font-semibold ${
                          dark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.name}
                      </div>
                      <div
                        className={dark ? "text-gray-400" : "text-gray-600"}
                      >
                        Verified customer
                      </div>
                    </div>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ Section ─────────────────────────────────────────────

function FaqSection({
  section,
  dark,
}: {
  section: PageSection;
  dark: boolean;
}) {
  const items = section.content.items as FaqItem[];
  if (!items.length) return null;

  return (
    <div className={dark ? "bg-slate-900" : "bg-white"}>
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl">
          <h2
            className={`text-4xl font-semibold tracking-tight sm:text-5xl ${
              dark ? "text-white" : "text-gray-900"
            }`}
          >
            Frequently asked questions
          </h2>
          <FaqDisclosure items={items} dark={dark} />
        </div>
      </div>
    </div>
  );
}

// ─── Features Section ────────────────────────────────────────

function FeaturesSection({
  section,
  primaryColour,
  dark,
}: {
  section: PageSection;
  primaryColour: string;
  dark: boolean;
}) {
  const items = section.content.items as FeatureItem[];
  if (!items.length) return null;

  return (
    <div className={`py-24 sm:py-32 ${dark ? "bg-slate-900" : "bg-white"}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2
            className="text-base/7 font-semibold"
            style={{ color: primaryColour }}
          >
            Why choose us
          </h2>
          <p
            className={`mt-2 text-4xl font-semibold tracking-tight text-pretty sm:text-5xl lg:text-balance ${
              dark ? "text-white" : "text-gray-900"
            }`}
          >
            Everything you need for complete peace of mind
          </p>
          <p
            className={`mt-6 text-lg/8 ${
              dark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            We make insurance simple, transparent, and affordable — so you can
            focus on what matters most.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
            {items.map((item, i) => {
              const Icon = ICON_MAP[item.icon] ?? Shield;
              return (
                <div key={i} className="relative pl-16">
                  <dt
                    className={`text-base/7 font-semibold ${
                      dark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <div
                      className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: primaryColour }}
                    >
                      <Icon aria-hidden="true" className="size-6 text-white" />
                    </div>
                    {item.title}
                  </dt>
                  <dd
                    className={`mt-2 text-base/7 ${
                      dark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {item.description}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </div>
  );
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

  const { brand, products, tenantName, pageConfig } = data;
  const pc = pageConfig as PageConfig;

  // Theme
  const dark = pc.theme === "dark";

  // Determine hero content — use custom or defaults
  const heroHeadline = pc.hero_headline || null;
  const heroSubheadline =
    pc.hero_subheadline ||
    `Get covered in minutes with ${tenantName}. Choose from our range of insurance products and get a personalised quote tailored to your needs.`;
  const ctaPrimary = pc.hero_cta_primary_text || "View our products";
  const ctaSecondary = pc.hero_cta_secondary_text || "Manage my policy";
  const heroImage = pc.hero_image_url || null;
  const heroVideoUrl = pc.hero_bg_video_url || null;

  // Sort enabled sections by order
  const enabledSections = (pc.sections ?? [])
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <div className={dark ? "bg-slate-900" : "bg-white"}>
      {/* Hero */}
      <HeroSection
        headline={heroHeadline}
        subheadline={heroSubheadline}
        ctaPrimary={ctaPrimary}
        ctaSecondary={ctaSecondary}
        heroImage={heroImage}
        heroVideoUrl={heroVideoUrl}
        primaryColour={brand.primary_colour}
        secondaryColour={brand.secondary_colour}
        slug={slug}
        dark={dark}
      />

      {/* Products Grid */}
      <section
        id="products"
        className={`mx-auto max-w-7xl px-6 py-24 sm:py-32 scroll-mt-8 lg:px-8`}
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-base/7 font-semibold"
            style={{ color: brand.primary_colour }}
          >
            Products
          </h2>
          <p
            className={`mt-2 text-4xl font-semibold tracking-tight text-balance sm:text-5xl ${
              dark ? "text-white" : "text-gray-900"
            }`}
          >
            Our insurance products
          </p>
          <p
            className={`mt-6 text-lg/8 ${
              dark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Choose the type of cover that suits your needs
          </p>
        </div>

        {products.length === 0 ? (
          <div
            className={`mx-auto mt-16 max-w-2xl rounded-xl border-2 border-dashed py-16 text-center ${
              dark
                ? "border-slate-700 text-gray-400"
                : "border-gray-300 text-gray-500"
            }`}
          >
            <p>No products available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="mx-auto mt-16 grid max-w-2xl gap-5 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {products.map((product) => {
              const Icon = ICON_MAP[product.icon] ?? Activity;
              return (
                <Link key={product.type} href={`/${slug}/${product.type}`}>
                  <Card
                    className={`group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer h-full ${
                      dark
                        ? "bg-slate-800 border-slate-700 hover:border-slate-600"
                        : ""
                    }`}
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1 transition-transform origin-left scale-x-0 group-hover:scale-x-100"
                      style={{ backgroundColor: brand.primary_colour }}
                    />
                    <CardContent className="pt-6 pb-6">
                      <div className="flex items-start gap-4">
                        <div
                          className="flex size-12 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: `${brand.primary_colour}${dark ? "30" : "10"}`,
                            color: brand.primary_colour,
                          }}
                        >
                          <Icon className="size-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-semibold text-base group-hover:underline underline-offset-2 ${
                              dark ? "text-white" : ""
                            }`}
                          >
                            {product.label}
                          </h3>
                          <p
                            className={`mt-1 text-sm leading-relaxed ${
                              dark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
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

      {/* About Section */}
      {pc.about_text && (
        <div
          className={`py-24 sm:py-32 ${
            dark ? "bg-slate-800/50" : "bg-gray-50"
          }`}
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2
                className="text-base/7 font-semibold"
                style={{ color: brand.primary_colour }}
              >
                About us
              </h2>
              <p
                className={`mt-2 text-4xl font-semibold tracking-tight sm:text-5xl ${
                  dark ? "text-white" : "text-gray-900"
                }`}
              >
                Who we are
              </p>
              <p
                className={`mt-6 text-lg/8 leading-relaxed ${
                  dark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {pc.about_text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Sections */}
      {enabledSections.map((section) => {
        switch (section.type) {
          case "testimonials":
            return (
              <TestimonialsSection
                key={section.id}
                section={section}
                primaryColour={brand.primary_colour}
                dark={dark}
              />
            );
          case "faq":
            return (
              <FaqSection key={section.id} section={section} dark={dark} />
            );
          case "features":
            return (
              <FeaturesSection
                key={section.id}
                section={section}
                primaryColour={brand.primary_colour}
                dark={dark}
              />
            );
          default:
            return null;
        }
      })}

      {/* CTA Band */}
      <div className={dark ? "bg-slate-900" : "bg-white"}>
        <div className="px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className={`text-4xl font-semibold tracking-tight text-balance sm:text-5xl ${
                dark ? "text-white" : "text-gray-900"
              }`}
            >
              Ready to get covered?
            </h2>
            <p
              className={`mx-auto mt-6 max-w-xl text-lg/8 text-pretty ${
                dark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Get a personalised quote in minutes. No hidden fees, no jargon —
              just simple, transparent insurance you can count on.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#products"
                className="rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 transition-all"
                style={{
                  backgroundColor: brand.primary_colour,
                  outlineColor: brand.primary_colour,
                }}
              >
                Get a quote
              </a>
              <a
                href={`/portal/login?tenant=${slug}`}
                className={`text-sm/6 font-semibold ${
                  dark ? "text-gray-300" : "text-gray-900"
                }`}
              >
                Manage my policy <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats / Trust bar */}
      <div
        className={`py-24 sm:py-32 ${dark ? "bg-slate-800/50" : "bg-white"}`}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4">
            <div className="mx-auto flex max-w-xs flex-col gap-y-2">
              <dt
                className={`text-base/7 ${
                  dark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Claims support
              </dt>
              <dd
                className="order-first text-3xl font-semibold tracking-tight sm:text-5xl"
                style={{ color: brand.primary_colour }}
              >
                24/7
              </dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-2">
              <dt
                className={`text-base/7 ${
                  dark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Average quote time
              </dt>
              <dd
                className="order-first text-3xl font-semibold tracking-tight sm:text-5xl"
                style={{ color: brand.primary_colour }}
              >
                5 min
              </dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-2">
              <dt
                className={`text-base/7 ${
                  dark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Authorised &amp; regulated
              </dt>
              <dd
                className="order-first text-3xl font-semibold tracking-tight sm:text-5xl"
                style={{ color: brand.primary_colour }}
              >
                FCA
              </dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-2">
              <dt
                className={`text-base/7 ${
                  dark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Customer rating
              </dt>
              <dd
                className="order-first text-3xl font-semibold tracking-tight sm:text-5xl"
                style={{ color: brand.primary_colour }}
              >
                4.8★
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

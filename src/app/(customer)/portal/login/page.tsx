import { Suspense } from "react";
import type { Metadata } from "next";
import { getTenantBrandBySlug } from "./brand-actions";
import { PortalLoginForm } from "@/components/customer/portal-login-form";

interface PortalLoginPageProps {
  searchParams: Promise<{ tenant?: string; error?: string }>;
}

export async function generateMetadata({ searchParams }: PortalLoginPageProps): Promise<Metadata> {
  const params = await searchParams;
  const tenantSlug = params.tenant ?? "demo";
  const { data: brand } = await getTenantBrandBySlug(tenantSlug);
  const companyName = brand?.company_name || "Insurance Portal";
  return {
    title: `Sign In — ${companyName}`,
    description: `Sign in to your ${companyName} customer portal to view and manage your insurance policies.`,
  };
}

export default async function PortalLoginPage({ searchParams }: PortalLoginPageProps) {
  const params = await searchParams;
  const tenantSlug = params.tenant ?? "demo";
  const error = params.error;

  const { data: brand } = await getTenantBrandBySlug(tenantSlug);

  const brandConfig = brand ?? {
    company_name: "Insurance Portal",
    logo_url: "",
    primary_colour: "#4F46E5",
    secondary_colour: "#10B981",
    font: "Inter" as const,
    support_email: "",
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        fontFamily: `'${brandConfig.font}', system-ui, sans-serif`,
        background: `linear-gradient(135deg, ${brandConfig.primary_colour}08 0%, ${brandConfig.primary_colour}03 50%, transparent 100%)`,
      }}
    >
      <Suspense>
        <PortalLoginForm brand={brandConfig} error={error} tenantSlug={tenantSlug} />
      </Suspense>
    </div>
  );
}

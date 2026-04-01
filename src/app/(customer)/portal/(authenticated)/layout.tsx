import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPortalBrandConfig, getPortalUser } from "./actions";
import { PortalNav } from "@/components/customer/portal-nav";
import { DEFAULT_BRAND_CONFIG } from "@/types/brand";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  // Fetch brand config and user info
  const [brandResult, portalUser] = await Promise.all([
    getPortalBrandConfig(),
    getPortalUser(),
  ]);

  const brand = brandResult.data ?? DEFAULT_BRAND_CONFIG;
  const currentUser = portalUser ?? { name: "Customer", email: "" };

  return (
    <div
      className="min-h-screen bg-gray-50/50"
      style={{
        fontFamily: `'${brand.font}', system-ui, sans-serif`,
      }}
    >
      <PortalNav brand={brand} user={currentUser} />
      <main className="mx-auto max-w-5xl px-6 py-8">
        {children}
      </main>

      {/* Branded footer — no Insured IQ branding */}
      <footer className="border-t mt-auto">
        <div className="mx-auto max-w-5xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {brand.company_name}. All rights reserved.
          </p>
          {brand.support_email && (
            <a
              href={`mailto:${brand.support_email}`}
              className="text-xs underline underline-offset-2 hover:opacity-80"
              style={{ color: brand.primary_colour }}
            >
              {brand.support_email}
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}

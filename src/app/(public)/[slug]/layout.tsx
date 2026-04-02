import { notFound } from "next/navigation";
import { getTenantBySlug } from "../actions";

export default async function PublicTenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getTenantBySlug(slug);

  if (error || !data) {
    notFound();
  }

  const { brand } = data;

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        fontFamily: `'${brand.font}', system-ui, sans-serif`,
        // @ts-expect-error CSS custom properties
        "--brand-primary": brand.primary_colour,
        "--brand-secondary": brand.secondary_colour,
      }}
    >
      {/* Branded header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href={`/${slug}`} className="flex items-center gap-3">
            {brand.logo_url ? (
              <img
                src={brand.logo_url}
                alt={brand.company_name}
                className="h-8 w-auto"
              />
            ) : (
              <div
                className="flex size-8 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: brand.primary_colour }}
              >
                {brand.company_name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-lg font-semibold tracking-tight">
              {brand.company_name}
            </span>
          </a>

          <a
            href={`/portal/login?tenant=${slug}`}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: brand.primary_colour }}
          >
            Customer Login
          </a>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>

      {/* Branded footer — zero Insured IQ branding */}
      <footer className="border-t bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {brand.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={brand.company_name}
                  className="h-6 w-auto opacity-60"
                />
              ) : (
                <div
                  className="flex size-6 items-center justify-center rounded text-xs font-bold text-white opacity-60"
                  style={{ backgroundColor: brand.primary_colour }}
                >
                  {brand.company_name.charAt(0).toUpperCase()}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {brand.company_name}. All rights
                reserved.
              </p>
            </div>
            {brand.support_email && (
              <a
                href={`mailto:${brand.support_email}`}
                className="text-sm underline underline-offset-2 hover:opacity-80"
                style={{ color: brand.primary_colour }}
              >
                {brand.support_email}
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

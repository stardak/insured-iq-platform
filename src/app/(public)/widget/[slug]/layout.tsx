import { notFound } from "next/navigation";
import { getTenantBySlug } from "../../actions";

export default async function WidgetLayout({
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
      style={{
        fontFamily: `'${brand.font}', system-ui, sans-serif`,
        // @ts-expect-error CSS custom properties
        "--brand-primary": brand.primary_colour,
        "--brand-secondary": brand.secondary_colour,
        background: "transparent",
        minHeight: "auto",
      }}
    >
      {/* Google Font link */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(brand.font)}:wght@400;500;600;700&display=swap`}
      />
      {children}
    </div>
  );
}

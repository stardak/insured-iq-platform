import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTenantBySlug } from "../../../actions";
import { BlogSubscribeWidget } from "@/components/shared/blog-subscribe-widget";
import Link from "next/link";

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function readingTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function PublicBlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; postSlug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug, postSlug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";

  const { data: tenantData, error } = await getTenantBySlug(slug);
  if (error || !tenantData) notFound();

  const { brand } = tenantData;
  const accent = brand.primary_colour;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!tenant) notFound();

  const post = await prisma.blogPost.findFirst({
    where: {
      tenant_id: tenant.id,
      slug: postSlug,
      deleted_at: null,
      ...(isPreview ? {} : { status: "PUBLISHED" }),
    },
  });

  if (!post) notFound();

  const related = await prisma.blogPost.findMany({
    where: {
      tenant_id: tenant.id,
      status: "PUBLISHED",
      deleted_at: null,
      id: { not: post.id },
    },
    orderBy: { published_at: "desc" },
    take: 3,
  });

  const mins = readingTime(post.content);

  return (
    <>
      {isPreview && post.status !== "PUBLISHED" && (
        <div className="sticky top-0 z-50 bg-gray-900 px-4 py-2 text-center text-sm font-medium text-amber-400">
          🔒 Preview mode — this post is a draft and not publicly visible
        </div>
      )}

      <article className="mx-auto max-w-3xl px-6 py-12">
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-400">
          <Link href={`/${slug}`} className="hover:text-gray-600">{brand.company_name}</Link>
          <span>/</span>
          <Link href={`/${slug}/blog`} style={{ color: accent }} className="hover:opacity-80">Blog</Link>
          <span>/</span>
          <span className="truncate max-w-xs text-gray-600">{post.title}</span>
        </nav>

        {post.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: `${accent}15`, color: accent }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-4xl font-extrabold leading-tight text-gray-900">{post.title}</h1>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
          <span>{formatDate(post.published_at ?? post.created_at)}</span>
          <span>·</span>
          <span>{mins} min read</span>
          <span>·</span>
          <span>{brand.company_name}</span>
        </div>

        {post.cover_image && (
          <div className="mt-8">
            <img
              src={post.cover_image}
              alt={post.seo_title ?? post.title}
              className="w-full rounded-2xl object-cover shadow-md"
              style={{ maxHeight: "460px" }}
            />
          </div>
        )}

        <div className="blog-body mt-10" dangerouslySetInnerHTML={{ __html: post.content }} />

        <div className="mt-16 border-t border-gray-100 pt-12">
          <BlogSubscribeWidget hostId={tenant.id} accentColour={accent} />
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-xl font-bold text-gray-900">More from {brand.company_name}</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/${slug}/blog/${r.slug}`}
                  className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  {r.cover_image && (
                    <img src={r.cover_image} alt={r.title} className="mb-3 h-28 w-full rounded-lg object-cover" />
                  )}
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 line-clamp-2 transition-colors">
                    {r.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(r.published_at ?? r.created_at)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <style>{`
        .blog-body { font-size: 1.125rem; line-height: 1.85; color: #374151; }
        .blog-body h1 { font-size: 2rem; font-weight: 800; color: #111827; margin: 2rem 0 0.75rem; }
        .blog-body h2 { font-size: 1.55rem; font-weight: 700; color: #111827; margin: 1.75rem 0 0.625rem; }
        .blog-body h3 { font-size: 1.25rem; font-weight: 700; color: #111827; margin: 1.5rem 0 0.5rem; }
        .blog-body p  { margin: 1rem 0; }
        .blog-body a  { color: ${accent}; text-decoration: underline; text-underline-offset: 3px; }
        .blog-body a:hover { opacity: 0.8; }
        .blog-body blockquote { border-left: 4px solid ${accent}; background: #f9fafb; padding: 0.875rem 1.25rem; margin: 1.5rem 0; border-radius: 0 8px 8px 0; color: #374151; font-style: italic; }
        .blog-body ul { list-style: disc; padding-left: 1.75rem; margin: 1rem 0; }
        .blog-body ol { list-style: decimal; padding-left: 1.75rem; margin: 1rem 0; }
        .blog-body li { margin: 0.35rem 0; }
        .blog-body code { font-family: ui-monospace, monospace; font-size: 0.875em; background: #1e1e2e; color: #cdd6f4; padding: 0.15rem 0.45rem; border-radius: 4px; }
        .blog-body pre { background: #1e1e2e; color: #cdd6f4; padding: 1.25rem; border-radius: 10px; overflow-x: auto; margin: 1.5rem 0; font-size: 0.9rem; line-height: 1.6; }
        .blog-body pre code { background: none; padding: 0; }
        .blog-body table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
        .blog-body th, .blog-body td { border: 1px solid #e5e7eb; padding: 0.625rem 0.875rem; text-align: left; }
        .blog-body th { background: #f9fafb; font-weight: 600; }
        .blog-body img { border-radius: 10px; margin: 1.5rem 0; max-width: 100%; }
        .blog-body strong { font-weight: 700; color: #111827; }
      `}</style>
    </>
  );
}

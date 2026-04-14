import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTenantBySlug } from "../../actions";
import { BlogSubscribeWidget } from "@/components/shared/blog-subscribe-widget";
import Link from "next/link";

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function PublicBlogIndexPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: tenantData, error } = await getTenantBySlug(slug);
  if (error || !tenantData) notFound();

  const { brand } = tenantData;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!tenant) notFound();

  const posts = await prisma.blogPost.findMany({
    where: { tenant_id: tenant.id, status: "PUBLISHED", deleted_at: null },
    orderBy: { published_at: "desc" },
  });

  const accent = brand.primary_colour;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">{brand.company_name} Blog</h1>
        <p className="mt-2 text-gray-500">
          Insights, guides, and news from {brand.company_name}.
        </p>
      </div>

      <div className="mb-12">
        <BlogSubscribeWidget hostId={tenant.id} accentColour={accent} />
      </div>

      {posts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-gray-400">No posts published yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/${slug}/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {post.cover_image ? (
                <img src={post.cover_image} alt={post.title} className="h-48 w-full object-cover" />
              ) : (
                <div className="h-48 w-full" style={{ background: `${accent}15` }} />
              )}
              <div className="flex flex-1 flex-col p-5">
                {post.tags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        style={{ background: `${accent}15`, color: accent }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h2 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 line-clamp-2 transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-2 flex-1 text-sm text-gray-500 line-clamp-3">{post.excerpt}</p>
                )}
                <p className="mt-4 text-xs text-gray-400">
                  {formatDate(post.published_at ?? post.created_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

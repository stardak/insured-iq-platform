import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getBlogPosts,
  publishBlogPost,
  unpublishBlogPost,
  archiveBlogPost,
  deleteBlogPost,
} from "@/lib/actions/blog";
import {
  PlusIcon,
  PencilSquareIcon,
  EyeIcon,
  TrashIcon,
  ArchiveBoxIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

// ─── Helpers ─────────────────────────────────────────────────

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PUBLISHED: "bg-green-100 text-green-700",
    DRAFT: "bg-amber-100 text-amber-700",
    ARCHIVED: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${map[status] ?? "bg-gray-100 text-gray-500"}`}
    >
      {status}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow-sm border border-gray-100">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
        <Icon className="size-5 text-indigo-600" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ─── Server actions bound to post ID ─────────────────────────

async function getTenantSlug(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();
    if (!profile?.tenant_id) return null;

    const { data: tenant } = await admin
      .from("tenants")
      .select("slug")
      .eq("id", profile.tenant_id)
      .single();

    return tenant?.slug ?? null;
  } catch {
    return null;
  }
}

// ─── Row action forms (server actions must be top-level) ──────

function PublishForm({ id, isPublished }: { id: string; isPublished: boolean }) {
  return (
    <form
      action={async () => {
        "use server";
        if (isPublished) {
          await unpublishBlogPost(id);
        } else {
          await publishBlogPost(id);
        }
      }}
    >
      <button
        type="submit"
        className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
      >
        {isPublished ? "Unpublish" : "Publish"}
      </button>
    </form>
  );
}

function ArchiveForm({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await archiveBlogPost(id);
      }}
    >
      <button type="submit" title="Archive" className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
        <ArchiveBoxIcon className="size-4" />
      </button>
    </form>
  );
}

function DeleteForm({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await deleteBlogPost(id);
      }}
    >
      <button type="submit" title="Delete" className="rounded-md p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600">
        <TrashIcon className="size-4" />
      </button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default async function BlogListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: blogData }, tenantSlug] = await Promise.all([
    getBlogPosts(),
    getTenantSlug(),
  ]);

  const posts = blogData?.posts ?? [];
  const stats = blogData?.stats ?? {
    total: 0,
    published: 0,
    drafts: 0,
    subscriberCount: 0,
  };
  const baseUrl = "https://insured-iq-platform.vercel.app";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="mt-1 text-sm text-gray-500">
            Write and publish blog posts for your customers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/blog/subscribers"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <UsersIcon className="size-4" />
            Subscribers
          </Link>
          <Link
            href="/dashboard/blog/new"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <PlusIcon className="size-4" />
            New post
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total posts" value={stats.total} icon={ArchiveBoxIcon} />
        <StatCard label="Published" value={stats.published} icon={EyeIcon} />
        <StatCard label="Drafts" value={stats.drafts} icon={PencilSquareIcon} />
        <StatCard label="Subscribers" value={stats.subscriberCount} icon={UsersIcon} />
      </div>

      {/* Posts table */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-20 text-center">
          <PencilSquareIcon className="mb-4 size-10 text-gray-300" />
          <h3 className="text-base font-semibold text-gray-800">No posts yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first blog post to get started.
          </p>
          <Link
            href="/dashboard/blog/new"
            className="mt-5 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <PlusIcon className="size-4" />
            Write your first post
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Post
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                  Tags
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                  Date
                </th>
                <th className="py-3 pl-3 pr-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => {
                const isPublished = post.status === "PUBLISHED";
                const publicUrl = tenantSlug
                  ? `${baseUrl}/${tenantSlug}/blog/${post.slug}`
                  : null;
                const previewUrl = tenantSlug
                  ? `${baseUrl}/${tenantSlug}/blog/${post.slug}?preview=1`
                  : null;

                return (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="py-4 pl-4 pr-3">
                      <div className="flex items-center gap-3">
                        {post.cover_image ? (
                          <img
                            src={post.cover_image}
                            alt=""
                            className="h-10 w-16 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-10 w-16 shrink-0 rounded-md bg-gray-100" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {post.title}
                          </p>
                          {post.excerpt && (
                            <p className="mt-0.5 truncate text-xs text-gray-400 max-w-xs">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="hidden px-3 py-4 md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell whitespace-nowrap">
                      {formatDate(post.published_at ?? post.created_at)}
                    </td>
                    <td className="py-4 pl-3 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/blog/${post.id}/edit`}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          title="Edit"
                        >
                          <PencilSquareIcon className="size-4" />
                        </Link>

                        {publicUrl && (
                          <a
                            href={isPublished ? publicUrl : (previewUrl ?? "")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            title={isPublished ? "View live" : "Preview"}
                          >
                            <EyeIcon className="size-4" />
                          </a>
                        )}

                        <PublishForm id={post.id} isPublished={isPublished} />

                        {post.status !== "ARCHIVED" && (
                          <ArchiveForm id={post.id} />
                        )}

                        <DeleteForm id={post.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

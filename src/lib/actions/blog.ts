"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import type { BlogStatus } from "@prisma/client";

// ─── Helpers ────────────────────────────────────────────────

async function getAuthedTenantId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id) throw new Error("No tenant");
  return profile.tenant_id as string;
}

// ─── Cover image upload ──────────────────────────────────────

export async function uploadBlogCoverImage(
  formData: FormData
): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { url: null, error: "Not authenticated" };

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();
    if (!profile?.tenant_id) return { url: null, error: "No tenant" };

    const file = formData.get("cover") as File;
    if (!file || file.size === 0) return { url: null, error: "No file provided" };

    const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) return { url: null, error: "File must be PNG, JPG, WebP, or GIF" };
    if (file.size > 8 * 1024 * 1024) return { url: null, error: "File must be under 8 MB" };

    const ext = file.name.split(".").pop() ?? "jpg";
    const filePath = `${profile.tenant_id}/blog-covers/${Date.now()}.${ext}`;

    const { error: uploadError } = await admin.storage
      .from("brand-assets")
      .upload(filePath, file, { upsert: false });

    if (uploadError) return { url: null, error: uploadError.message };

    const { data: { publicUrl } } = admin.storage
      .from("brand-assets")
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (e) {
    return { url: null, error: (e as Error).message };
  }
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function uniqueSlug(
  tenantId: string,
  base: string,
  excludeId?: string
): Promise<string> {
  let slug = base || "untitled";
  let suffix = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const existing = await prisma.blogPost.findFirst({
      where: {
        tenant_id: tenantId,
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (!existing) return candidate;
    suffix++;
  }
}

// ─── Types ───────────────────────────────────────────────────

export interface BlogPostInput {
  title: string;
  content?: string;
  excerpt?: string;
  cover_image?: string;
  tags?: string[];
  seo_title?: string;
  seo_description?: string;
  focus_keyword?: string;
}

// ─── Actions ─────────────────────────────────────────────────

export async function getBlogPosts() {
  try {
    const tenantId = await getAuthedTenantId();

    const [posts, subscriberCount] = await Promise.all([
      prisma.blogPost.findMany({
        where: { tenant_id: tenantId, deleted_at: null },
        orderBy: { created_at: "desc" },
      }),
      prisma.blogSubscriber.count({
        where: { tenant_id: tenantId, subscribed: true },
      }),
    ]);

    const total = posts.length;
    const published = posts.filter((p) => p.status === "PUBLISHED").length;
    const drafts = posts.filter((p) => p.status === "DRAFT").length;

    return { data: { posts, stats: { total, published, drafts, subscriberCount } }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function getBlogPost(id: string) {
  try {
    const tenantId = await getAuthedTenantId();
    const post = await prisma.blogPost.findFirst({
      where: { id, tenant_id: tenantId, deleted_at: null },
    });
    if (!post) return { data: null, error: "Post not found" };
    return { data: post, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function createBlogPost(input: BlogPostInput) {
  try {
    const tenantId = await getAuthedTenantId();
    const base = toSlug(input.title || "untitled");
    const slug = await uniqueSlug(tenantId, base);

    const post = await prisma.blogPost.create({
      data: {
        tenant_id: tenantId,
        title: input.title || "Untitled",
        slug,
        content: input.content ?? "",
        excerpt: input.excerpt ?? "",
        cover_image: input.cover_image ?? null,
        tags: input.tags ?? [],
        seo_title: input.seo_title ?? null,
        seo_description: input.seo_description ?? null,
        focus_keyword: input.focus_keyword ?? null,
      },
    });

    revalidatePath("/dashboard/blog");
    return { data: { id: post.id, slug: post.slug }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function updateBlogPost(id: string, input: BlogPostInput) {
  try {
    const tenantId = await getAuthedTenantId();

    const existing = await prisma.blogPost.findFirst({
      where: { id, tenant_id: tenantId },
      select: { title: true, slug: true },
    });
    if (!existing) return { data: null, error: "Post not found" };

    let slug = existing.slug;
    if (input.title && input.title !== existing.title) {
      const base = toSlug(input.title);
      slug = await uniqueSlug(tenantId, base, id);
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: input.title ?? existing.title,
        slug,
        content: input.content ?? "",
        excerpt: input.excerpt ?? "",
        cover_image: input.cover_image ?? null,
        tags: input.tags ?? [],
        seo_title: input.seo_title ?? null,
        seo_description: input.seo_description ?? null,
        focus_keyword: input.focus_keyword ?? null,
      },
    });

    revalidatePath("/dashboard/blog");
    return { data: { id: post.id, slug: post.slug }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function publishBlogPost(id: string) {
  try {
    const tenantId = await getAuthedTenantId();

    const post = await prisma.blogPost.update({
      where: { id, tenant_id: tenantId },
      data: {
        status: "PUBLISHED" as BlogStatus,
        published_at: new Date(),
      },
    });

    await _notifySubscribers(tenantId, post);

    revalidatePath("/dashboard/blog");
    return { data: { id: post.id }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function unpublishBlogPost(id: string) {
  try {
    const tenantId = await getAuthedTenantId();
    await prisma.blogPost.update({
      where: { id, tenant_id: tenantId },
      data: { status: "DRAFT" as BlogStatus, published_at: null },
    });
    revalidatePath("/dashboard/blog");
    return { data: true, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function archiveBlogPost(id: string) {
  try {
    const tenantId = await getAuthedTenantId();
    await prisma.blogPost.update({
      where: { id, tenant_id: tenantId },
      data: { status: "ARCHIVED" as BlogStatus },
    });
    revalidatePath("/dashboard/blog");
    return { data: true, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function deleteBlogPost(id: string) {
  try {
    const tenantId = await getAuthedTenantId();
    await prisma.blogPost.delete({
      where: { id, tenant_id: tenantId },
    });
    revalidatePath("/dashboard/blog");
    return { data: true, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

// ─── Subscribers ─────────────────────────────────────────────

export async function getSubscribers() {
  try {
    const tenantId = await getAuthedTenantId();
    const subscribers = await prisma.blogSubscriber.findMany({
      where: { tenant_id: tenantId },
      orderBy: { subscribed_at: "desc" },
    });
    return { data: subscribers, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function toggleSubscriber(id: string, subscribed: boolean) {
  try {
    const tenantId = await getAuthedTenantId();
    await prisma.blogSubscriber.update({
      where: { id, tenant_id: tenantId },
      data: { subscribed },
    });
    revalidatePath("/dashboard/blog/subscribers");
    return { data: true, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

// ─── Email notification helper ────────────────────────────────

async function _notifySubscribers(
  tenantId: string,
  post: {
    id: string;
    title: string;
    excerpt: string;
    cover_image: string | null;
    slug: string;
  }
) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  const admin = createAdminClient();
  const { data: tenant } = await admin
    .from("tenants")
    .select("slug, name, brand_config")
    .eq("id", tenantId)
    .single();

  if (!tenant) return;

  const subscribers = await prisma.blogSubscriber.findMany({
    where: { tenant_id: tenantId, subscribed: true },
  });

  if (subscribers.length === 0) return;

  const resend = new Resend(resendKey);
  const tenantSlug = tenant.slug as string;
  const brandConfig = (tenant.brand_config ?? {}) as Record<string, string>;
  const companyName = brandConfig.company_name ?? (tenant.name as string);
  const primaryColour = brandConfig.primary_colour ?? "#4F46E5";
  const baseUrl = `https://insured-iq-platform.vercel.app`;
  const postUrl = `${baseUrl}/${tenantSlug}/blog/${post.slug}`;

  const emailPromises = subscribers.map((sub) => {
    const unsubscribeUrl = `${baseUrl}/api/blog/unsubscribe?token=${sub.unsubscribe_token}`;
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <div style="margin-bottom:24px">
          <span style="background:${primaryColour};color:#fff;padding:6px 14px;border-radius:6px;font-size:13px;font-weight:600">${companyName}</span>
        </div>
        <h1 style="font-size:26px;font-weight:700;color:#111827;margin:0 0 12px">${post.title}</h1>
        ${post.cover_image ? `<img src="${post.cover_image}" alt="" style="width:100%;border-radius:10px;margin-bottom:20px" />` : ""}
        <p style="font-size:16px;color:#374151;line-height:1.7;margin:0 0 28px">${post.excerpt}</p>
        <a href="${postUrl}" style="background:${primaryColour};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Read post →</a>
        <hr style="margin:40px 0;border:none;border-top:1px solid #e5e7eb" />
        <p style="font-size:12px;color:#9ca3af">
          You're receiving this because you subscribed to blog updates from ${companyName}.<br/>
          <a href="${unsubscribeUrl}" style="color:#6b7280">Unsubscribe</a>
        </p>
      </div>
    `;

    return resend.emails.send({
      from: `${companyName} Blog <onboarding@resend.dev>`,
      to: sub.email,
      subject: post.title,
      html,
    });
  });

  await Promise.allSettled(emailPromises);
}

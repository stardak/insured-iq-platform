import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBlogPost } from "@/lib/actions/blog";
import { BlogEditorClient } from "@/components/tenant/blog-editor-client";
import { redirect, notFound } from "next/navigation";

async function getTenantSlug(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
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

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const [{ data: post }, hostSlug] = await Promise.all([
    getBlogPost(id),
    getTenantSlug(),
  ]);

  if (!post) notFound();

  return <BlogEditorClient mode="edit" post={post} hostSlug={hostSlug} />;
}

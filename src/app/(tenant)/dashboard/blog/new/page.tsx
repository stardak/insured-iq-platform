import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BlogEditorClient } from "@/components/tenant/blog-editor-client";
import { redirect } from "next/navigation";

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

export default async function NewBlogPostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const hostSlug = await getTenantSlug();

  return <BlogEditorClient mode="new" post={null} hostSlug={hostSlug} />;
}

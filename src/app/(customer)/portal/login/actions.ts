"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function portalLoginWithGoogle() {
  const supabase = await createClient();
  const headerStore = await headers();
  const origin = headerStore.get("origin") || headerStore.get("host") || "";
  const baseUrl = origin.startsWith("http") ? origin : `http://${origin}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/auth/callback?next=/portal`,
    },
  });

  if (error) {
    redirect(`/portal/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }

  redirect("/portal/login?error=Could+not+initiate+Google+login");
}

export async function portalLogin(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/portal/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/portal");
}

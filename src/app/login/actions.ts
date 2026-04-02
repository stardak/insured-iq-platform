"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // Redirect to / — middleware will route based on role
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Use admin API to create user with auto-confirm (bypasses email rate limits)
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();

  const { data: userData, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
    },
  });

  if (createError) {
    redirect(`/login?tab=register&error=${encodeURIComponent(createError.message)}`);
  }

  // Sign the user in immediately
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    redirect(`/login?tab=register&error=${encodeURIComponent(signInError.message)}`);
  }

  // Head straight to onboarding
  redirect("/onboarding");
}

export async function loginWithGoogle() {
  const supabase = await createClient();
  const headerStore = await headers();
  const origin = headerStore.get("origin") || headerStore.get("host") || "";
  const baseUrl = origin.startsWith("http") ? origin : `http://${origin}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }

  redirect("/login?error=Could+not+initiate+Google+login");
}

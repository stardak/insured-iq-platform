import { redirect } from "next/navigation";

// /register redirects to the login page's register tab
export default function RegisterPage() {
  redirect("/login?tab=register");
}

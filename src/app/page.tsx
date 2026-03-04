import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    const redirects: Record<string, string> = {
      SUPER_ADMIN: "/admin",
      SUB_ADMIN: "/admin",
      FRANCHISE: "/franchise",
      INDIVIDUAL: "/dashboard",
    };
    redirect(redirects[session.role] || "/dashboard");
  }
  
  // Redirect to individual login page
  redirect("/login");
}

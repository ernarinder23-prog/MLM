import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  // If already authenticated as admin, redirect to admin dashboard
  if (session && (session.role === "SUPER_ADMIN" || session.role === "SUB_ADMIN")) {
    redirect("/admin");
  }
  
  return <>{children}</>;
}

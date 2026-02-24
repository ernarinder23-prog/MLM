import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "INDIVIDUAL") redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={session.role} variant="individual" />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

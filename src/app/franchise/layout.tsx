import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default async function FranchiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "FRANCHISE") redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={session.role} variant="franchise" />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

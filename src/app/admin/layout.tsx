import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "SUB_ADMIN")) {
    redirect("/login");
  }

  const perms = session.subAdminPerms || (session.role === "SUPER_ADMIN" ? {
    viewUsers: true,
    viewReports: true,
    approveWithdrawals: true,
    manageKyc: true,
    managePlans: true,
    readBinaryTree: true,
  } : {});

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        role={session.role}
        permissions={perms}
        variant="admin"
      />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

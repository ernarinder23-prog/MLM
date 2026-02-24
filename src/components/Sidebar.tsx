"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wallet,
  TreePine,
  FileText,
  Settings,
  LogOut,
  Building2,
  Package,
  ShieldCheck,
  BarChart3,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: string[];
  perm?: keyof { viewUsers: boolean; viewReports: boolean; approveWithdrawals: boolean; manageKyc: boolean; managePlans: boolean; readBinaryTree: boolean };
}

interface SidebarProps {
  role: string;
  permissions?: { viewUsers: boolean; viewReports: boolean; approveWithdrawals: boolean; manageKyc: boolean; managePlans: boolean; readBinaryTree: boolean };
  variant: "admin" | "franchise" | "individual";
}

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/franchises", label: "Franchises", icon: Building2 },
  { href: "/admin/sub-admins", label: "Sub Admins", icon: ShieldCheck },
  { href: "/admin/plans", label: "MLM Plans", icon: Package },
  { href: "/admin/individuals", label: "Individuals", icon: Users, perm: "viewUsers" },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: CreditCard },
  { href: "/admin/binary-tree", label: "Binary Tree", icon: TreePine, perm: "readBinaryTree" },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, perm: "viewReports" },
  { href: "/admin/kyc", label: "KYC", icon: FileText, perm: "manageKyc" },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const franchiseNav: NavItem[] = [
  { href: "/franchise", label: "Dashboard", icon: LayoutDashboard },
  { href: "/franchise/users", label: "My Users", icon: Users },
  { href: "/franchise/add-user", label: "Add Member", icon: Users },
  { href: "/franchise/kyc", label: "KYC Verification", icon: FileText },
  { href: "/franchise/reports", label: "Reports", icon: BarChart3 },
];

const individualNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tree", label: "Binary Tree", icon: TreePine },
  { href: "/dashboard/add-user", label: "Add User", icon: Users },
  { href: "/dashboard/users", label: "My Users", icon: Users },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/referrals", label: "Referrals", icon: Users },
  { href: "/dashboard/withdraw", label: "Withdraw", icon: CreditCard },
  { href: "/dashboard/profile", label: "Profile", icon: Settings },
];

export function Sidebar({ role, permissions, variant }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = variant === "admin" ? adminNav : variant === "franchise" ? franchiseNav : individualNav;

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
      router.refresh();
    }
  }

  const filteredNav = nav.filter((item) => {
    if (item.perm && role === "SUB_ADMIN" && permissions) {
      return permissions[item.perm];
    }
    if (variant === "admin" && role === "SUB_ADMIN") {
      if (["/admin/sub-admins", "/admin/settings", "/admin/individuals/add"].includes(item.href)) return false;
    }
    return true;
  });

  return (
    <aside className="w-64 min-h-screen bg-primary text-white flex flex-col">
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="font-heading font-bold text-xl">
          MLM Platform
        </Link>
        <p className="text-xs text-white/60 mt-1 capitalize">{role.replace("_", " ")}</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          // Only one menu item should be active at a time
          // Exact match OR if current path is a sub-route of this item (e.g., /admin/individuals/add highlights /admin/individuals)
          const isExactMatch = pathname === item.href;
          const isSubRoute = pathname.startsWith(item.href + "/");
          // Root paths (/admin, /franchise, /dashboard) only match exactly
          const isRootPath = item.href === "/admin" || item.href === "/franchise" || item.href === "/dashboard";
          const isActive = isExactMatch || (!isRootPath && isSubRoute);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive ? "bg-secondary text-white" : "hover:bg-white/10 text-white/90"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-white/10 text-white/90 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

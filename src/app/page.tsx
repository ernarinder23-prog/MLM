import Link from "next/link";
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary/90 text-white">
      <nav className="flex items-center justify-between px-8 py-6">
        <h1 className="text-2xl font-heading font-bold">MLM Platform</h1>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-medium"
          >
            Login
          </Link>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-8 py-24 text-center">
        <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
          Build Your Network. Grow Your Income.
        </h2>
        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
          Professional MLM platform with binary tree, real-time analytics, and secure financial workflows.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/login"
            className="px-8 py-4 rounded-xl bg-secondary hover:bg-secondary/90 font-button text-lg transition-colors"
          >
            Individual Login
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-xl bg-accent text-primary hover:bg-accent/90 font-button text-lg transition-colors"
          >
            Franchise / Admin
          </Link>
        </div>
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <div className="text-3xl mb-3">🌳</div>
            <h3 className="font-heading font-semibold text-lg mb-2">Binary Tree</h3>
            <p className="text-white/80">Visual network tree with real-time placement control</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <div className="text-3xl mb-3">💼</div>
            <h3 className="font-heading font-semibold text-lg mb-2">Role-Based Access</h3>
            <p className="text-white/80">Admin, Franchise & Individual dashboards with RBAC</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <div className="text-3xl mb-3">🔐</div>
            <h3 className="font-heading font-semibold text-lg mb-2">Secure Finances</h3>
            <p className="text-white/80">Approval workflows, wallet & withdrawal management</p>
          </div>
        </div>
      </main>
    </div>
  );
}

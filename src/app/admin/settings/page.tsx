import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getSession();
  if (session?.role !== "SUPER_ADMIN") redirect("/admin");

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-heading font-bold text-primary mb-8">
        System Settings
      </h1>
      <div className="card space-y-6">
        <div>
          <h3 className="font-medium text-primary mb-2">Withdrawal Limits</h3>
          <p className="text-text-secondary text-sm">
            Configure min/max withdrawal amounts, daily limits.
          </p>
          <button className="mt-2 px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
            Configure
          </button>
        </div>
        <div>
          <h3 className="font-medium text-primary mb-2">Binary Pairing Rules</h3>
          <p className="text-text-secondary text-sm">
            Define pair value, matching bonus, capping.
          </p>
          <button className="mt-2 px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
            Configure
          </button>
        </div>
        <div>
          <h3 className="font-medium text-primary mb-2">Capping Limits</h3>
          <p className="text-text-secondary text-sm">
            Set maximum earnings per level.
          </p>
          <button className="mt-2 px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
            Configure
          </button>
        </div>
      </div>
    </div>
  );
}

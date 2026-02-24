import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "INDIVIDUAL") return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { package: true },
  });

  if (!user) return null;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-heading font-bold text-primary mb-8">
        Profile
      </h1>
      <div className="card space-y-4">
        <div>
          <p className="text-text-secondary text-sm">Name</p>
          <p className="font-medium">{user.firstName} {user.lastName}</p>
        </div>
        <div>
          <p className="text-text-secondary text-sm">Username</p>
          <p className="font-medium">{user.username}</p>
        </div>
        <div>
          <p className="text-text-secondary text-sm">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-text-secondary text-sm">Phone</p>
          <p className="font-medium">{user.phone || "-"}</p>
        </div>
        <div>
          <p className="text-text-secondary text-sm">Address</p>
          <p className="font-medium">{user.address || "-"}</p>
        </div>
        <div>
          <p className="text-text-secondary text-sm">Package</p>
          <p className="font-medium">{user.package?.name || "-"}</p>
        </div>
      </div>
    </div>
  );
}

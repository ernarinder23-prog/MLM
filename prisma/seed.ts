import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { username: "superadmin" },
    update: {},
    create: {
      username: "superadmin",
      email: "admin@mlm.com",
      passwordHash: hash,
      firstName: "Super",
      lastName: "Admin",
      role: "SUPER_ADMIN",
    },
  });

  const existingBasic = await prisma.package.findFirst({ where: { name: "Basic" } });
  if (!existingBasic) {
    await prisma.package.create({
      data: { name: "Basic", type: "FIXED", amount: 1000, level: 1, businessVolume: 100 },
    });
  }
  const existingSilver = await prisma.package.findFirst({ where: { name: "Silver" } });
  if (!existingSilver) {
    await prisma.package.create({
      data: { name: "Silver", type: "FIXED", amount: 5000, level: 2, businessVolume: 500 },
    });
  }
  const existingGold = await prisma.package.findFirst({ where: { name: "Gold" } });
  if (!existingGold) {
    await prisma.package.create({
      data: { name: "Gold", type: "FLEXI", amount: 10000, level: 3, businessVolume: 1000 },
    });
  }

  const franchiseHash = await bcrypt.hash("franchise123", 12);
  await prisma.franchise.upsert({
    where: { username: "franchise1" },
    update: {},
    create: {
      name: "Main Franchise",
      username: "franchise1",
      email: "franchise@mlm.com",
      passwordHash: franchiseHash,
    },
  });

  console.log("Seed completed. Super Admin: superadmin / admin123");
  console.log("Franchise: franchise1 / franchise123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from "@/lib/db";

export async function generateUserId(): Promise<string> {
  const rows = await prisma.$queryRaw<{ max: number | null }[]>`
    SELECT MAX(CAST("username" AS INTEGER)) AS max
    FROM "User"
    WHERE "username" ~ '^[0-9]+$'
  `;

  const maxValue = rows[0]?.max ?? 0;
  const nextValue = Number(maxValue) + 1;

  if (nextValue > 999) {
    throw new Error("User ID limit reached (max 999)");
  }

  return nextValue.toString().padStart(3, "0");
}

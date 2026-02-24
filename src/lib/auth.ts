import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "mlm-secret-key-change-in-production"
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export type Role = "SUPER_ADMIN" | "SUB_ADMIN" | "FRANCHISE" | "INDIVIDUAL";

export interface JWTPayload {
  userId: string;
  username: string;
  role: Role;
  subAdminPerms?: {
    viewUsers: boolean;
    viewReports: boolean;
    approveWithdrawals: boolean;
    manageKyc: boolean;
    managePlans: boolean;
    readBinaryTree: boolean;
  };
  exp: number;
}

export async function createToken(payload: Omit<JWTPayload, "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function getLoginRedirect(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "SUB_ADMIN":
      return "/admin";
    case "FRANCHISE":
      return "/franchise";
    case "INDIVIDUAL":
      return "/dashboard";
    default:
      return "/dashboard";
  }
}

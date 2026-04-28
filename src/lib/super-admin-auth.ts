import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import crypto from "crypto";

const SA_SESSION_COOKIE = "sc_super_admin_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function createSuperAdminSession(adminId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const session = await prisma.superAdminSession.create({
    data: { adminId, token, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SA_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return session;
}

export async function getCurrentSuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SA_SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.superAdminSession.findUnique({
    where: { token },
    include: { admin: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.superAdminSession.delete({ where: { id: session.id } });
    }
    return null;
  }

  return session.admin;
}

export async function destroySuperAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SA_SESSION_COOKIE)?.value;
  if (token) {
    await prisma.superAdminSession.deleteMany({ where: { token } });
    cookieStore.delete(SA_SESSION_COOKIE);
  }
}

export async function verifySuperAdminPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

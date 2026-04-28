import { NextResponse } from "next/server";
import { destroySuperAdminSession } from "@/lib/super-admin-auth";

export async function POST() {
  await destroySuperAdminSession();
  return NextResponse.json({ success: true });
}

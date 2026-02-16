import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isWhitelisted } from "@/lib/whitelist";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const displayName = session?.user?.name ?? session?.user?.email ?? null;
  const canManage = !!session && isWhitelisted(session.user.email);

  return NextResponse.json({ session, displayName, canManage });
}

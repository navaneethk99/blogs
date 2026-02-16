import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/schema";
import { isWhitelisted } from "@/lib/whitelist";

export const runtime = "nodejs";

export async function GET() {
  const posts = await db
    .select()
    .from(blogPosts)
    .orderBy(desc(blogPosts.createdAt));

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isWhitelisted(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const content = String(body.content ?? "").trim();
  const imageUrl = String(body.imageUrl ?? "").trim();

  if (!title || !content) {
    return NextResponse.json(
      { error: "Title and content are required." },
      { status: 400 }
    );
  }

  const authorName = session.user.name ?? session.user.email ?? "Unknown";

  const [post] = await db
    .insert(blogPosts)
    .values({
      title,
      content,
      imageUrl: imageUrl || null,
      authorId: session.user.id,
      authorName,
    })
    .returning();

  return NextResponse.json({ post }, { status: 201 });
}

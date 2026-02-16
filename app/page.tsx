import { db } from "@/lib/db";
import { blogPosts } from "@/lib/schema";
import { desc } from "drizzle-orm";
import SessionGate from "@/app/components/SessionGate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await db
    .select()
    .from(blogPosts)
    .orderBy(desc(blogPosts.createdAt));

  return (
    <div className="min-h-screen bg-grid">
      <div className="hero-glow" />
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:px-10">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">
            Neon Atlas
          </p>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">
            Orbital Blog Network
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-white/70">
            A secure, whitelisted broadcast layer for your crew. Sign in to
            publish, and read the latest dispatches from the grid.
          </p>
        </header>

        <SessionGate
          posts={posts.map((post) => ({
            ...post,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
          }))}
        />
      </main>
    </div>
  );
}

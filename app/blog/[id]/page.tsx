import { db } from "@/lib/db";
import { blogPosts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostControls from "@/app/blog/PostControls";

export const runtime = "nodejs";

const formatDate = (value: Date) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-grid">
      <div className="hero-glow" />
      <main className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-12 lg:px-10">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.4em] text-cyan-200/70"
        >
          Back to archive
        </Link>

        <article className="glass-panel space-y-6">
          <header className="space-y-3">
            <h1 className="text-3xl font-semibold text-white md:text-4xl">
              {post.title}
            </h1>
            <p className="text-sm text-cyan-200/70">
              {formatDate(post.createdAt)} · {post.authorName}
            </p>
          </header>

          {post.imageUrl && (
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="h-auto w-full object-cover"
              />
            </div>
          )}

          <div className="space-y-5 text-sm leading-7 text-white/80">
            {post.content.split("\n\n").map((paragraph, index) => (
              <p key={`${post.id}-paragraph-${index}`}>{paragraph}</p>
            ))}
          </div>
        </article>

        <PostControls
          postId={post.id}
          initialTitle={post.title}
          initialContent={post.content}
          initialImageUrl={post.imageUrl}
        />
      </main>
    </div>
  );
}

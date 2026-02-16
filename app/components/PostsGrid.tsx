"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

type Post = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

type PostsGridProps = {
  posts: Post[];
  canManage?: boolean;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function PostsGrid({ posts }: PostsGridProps) {
  const router = useRouter();
  const emptyState = useMemo(() => posts.length === 0, [posts]);

  const openPost = (postId: string) => {
    router.push(`/blog/${postId}`);
  };

  if (emptyState) {
    return (
      <section className="glass-panel flex flex-col items-center gap-3 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Archive</p>
        <h2 className="text-xl font-semibold text-white">No signals yet.</h2>
        <p className="text-sm text-white/60">
          Publish the first dispatch to start the grid.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Archive</p>
          <h2 className="text-lg font-semibold text-white">Latest Dispatches</h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/60 via-lime-200/20 to-transparent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {posts.map((post, index) => {
          const previewText = post.content
            .split("\n\n")
            .slice(0, 2)
            .join("\n\n");
          const shouldTruncate = post.content.length > previewText.length;

          return (
            <article
              key={post.id}
              className="glass-panel group relative overflow-hidden"
              style={{ animationDelay: `${index * 80}ms` }}
              role="link"
              tabIndex={0}
              onClick={() => openPost(post.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openPost(post.id);
                }
              }}
            >
              <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_55%)]" />
              </div>
              <div className="space-y-4">
                {post.imageUrl && (
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-white transition group-hover:text-cyan-100">
                    {post.title}
                  </h3>
                  <p className="text-sm text-cyan-200/70">
                    {formatDate(post.createdAt)} · {post.authorName}
                  </p>
                </div>
                <p className="text-sm leading-7 text-white/70 whitespace-pre-line">
                  {previewText}
                  {shouldTruncate && <span className="text-white/50">…</span>}
                </p>
                <span className="inline-flex items-center text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                  Read full dispatch
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

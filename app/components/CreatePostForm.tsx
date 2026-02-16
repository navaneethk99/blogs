"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePostForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          imageUrl,
          content,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result?.error ?? "Unable to publish.");
      } else {
        setTitle("");
        setImageUrl("");
        setContent("");
        router.refresh();
      }
    } catch (err) {
      setError("Unable to publish.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="glass-panel flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
            Command Console
          </p>
          <h2 className="text-lg font-semibold text-white">Create New Blog</h2>
        </div>
        <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
      </div>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm text-white/70">
          Title
          <input
            className="neon-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Orbit shift log"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-white/70">
          Image URL (optional)
          <input
            className="neon-input"
            type="url"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="https://..."
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-white/70">
          Story
          <textarea
            className="neon-input min-h-[120px] resize-none"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Signal captured..."
            required
          />
        </label>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <button className="neon-button" disabled={pending} type="submit">
          Publish
        </button>
      </form>
    </section>
  );
}

"use client";

import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SessionPayload = {
  session: { user?: { email?: string | null; name?: string | null } } | null;
  displayName: string | null;
  canManage: boolean;
};

const EMPTY_SESSION: SessionPayload = {
  session: null,
  displayName: null,
  canManage: false,
};

type PostControlsProps = {
  postId: string;
  initialTitle: string;
  initialContent: string;
  initialImageUrl?: string | null;
};

export default function PostControls({
  postId,
  initialTitle,
  initialContent,
  initialImageUrl,
}: PostControlsProps) {
  const router = useRouter();
  const [sessionState, setSessionState] = useState<SessionPayload>(EMPTY_SESSION);
  const [loadingSession, setLoadingSession] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formState, setFormState] = useState({
    title: initialTitle,
    content: initialContent,
    imageUrl: initialImageUrl ?? "",
  });
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const response = await fetch("/api/session");
        if (!response.ok) {
          if (active) setSessionState(EMPTY_SESSION);
          return;
        }
        const result = (await response.json()) as SessionPayload;
        if (active) setSessionState(result);
      } catch {
        if (active) setSessionState(EMPTY_SESSION);
      } finally {
        if (active) setLoadingSession(false);
      }
    };

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!editing) {
      setFormState({
        title: initialTitle,
        content: initialContent,
        imageUrl: initialImageUrl ?? "",
      });
      setError(null);
    }
  }, [editing, initialTitle, initialContent, initialImageUrl]);

  const updateField = (field: keyof typeof formState) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormState((current) =>
      current ? { ...current, [field]: event.target.value } : current,
    );
  };

  const handleUpdate = async () => {
    if (!formState.title.trim() || !formState.content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formState.title.trim(),
          content: formState.content.trim(),
          imageUrl: formState.imageUrl.trim(),
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result?.error ?? "Unable to save.");
        return;
      }

      setEditing(false);
      router.refresh();
    } catch {
      setError("Unable to save.");
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setConfirmingDelete(false);

    try {
      const response = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json();
        alert(result?.error ?? "Unable to delete.");
        return;
      }
      router.push("/");
    } catch {
      alert("Unable to delete.");
    } finally {
      setDeleting(false);
    }
  };

  if (!sessionState.canManage) {
    return null;
  }

  return (
    <section className="glass-panel space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Transmission</p>
          <p className="text-sm text-white/70">Control room access confirmed.</p>
        </div>
        <button
          className="ghost-button"
          type="button"
          onClick={() => setEditing((prev) => !prev)}
          disabled={pending || deleting || loadingSession}
        >
          {editing ? "Hide editor" : "Edit dispatch"}
        </button>
      </div>

      {editing ? (
        <div className="space-y-3">
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-cyan-200/70">
            Title
            <input className="neon-input" value={formState.title} onChange={updateField("title")} />
          </label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-cyan-200/70">
            Image URL (optional)
            <input
              className="neon-input"
              value={formState.imageUrl}
              onChange={updateField("imageUrl")}
            />
          </label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-cyan-200/70">
            Story
            <textarea
              className="neon-input min-h-[120px] resize-none"
              value={formState.content}
              onChange={updateField("content")}
            />
          </label>
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              className="neon-button"
              type="button"
              onClick={handleUpdate}
              disabled={pending}
            >
              {pending ? "Saving…" : "Save update"}
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() => setEditing(false)}
              disabled={pending}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-white/60">
          Toggle the editor to correct a title, update the story, or swap the preview image.
        </p>
      )}

      <button
        className="ghost-button"
        type="button"
        onClick={() => setConfirmingDelete(true)}
        disabled={deleting || pending}
      >
        {deleting ? "Deleting…" : "Delete dispatch"}
      </button>

      {confirmingDelete && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/70 px-4">
          <div className="glass-panel max-w-sm space-y-5">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">
              Confirm delete
            </p>
            <h3 className="text-lg font-semibold text-white">
              Are you sure you want to delete this dispatch?
            </h3>
            <p className="text-sm text-white/70">
              This action cannot be undone. The post will be permanently removed from
              the archive.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                className="ghost-button"
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="neon-button"
                type="button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

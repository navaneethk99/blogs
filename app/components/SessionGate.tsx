"use client";

import { useEffect, useMemo, useState } from "react";
import AuthPanel from "@/app/components/AuthPanel";
import CreatePostForm from "@/app/components/CreatePostForm";
import PostsGrid from "@/app/components/PostsGrid";

type Post = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

type SessionPayload = {
  session: {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  } | null;
  displayName: string | null;
  canManage: boolean;
};

type SessionGateProps = {
  posts: Post[];
};

const EMPTY_SESSION: SessionPayload = {
  session: null,
  displayName: null,
  canManage: false,
};

export default function SessionGate({ posts }: SessionGateProps) {
  const [sessionState, setSessionState] = useState<SessionPayload>(EMPTY_SESSION);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/session");
      if (!response.ok) {
        setSessionState(EMPTY_SESSION);
        return;
      }
      const result = (await response.json()) as SessionPayload;
      setSessionState(result);
    } catch {
      setSessionState(EMPTY_SESSION);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const transmissionStatus = useMemo(() => {
    if (loading) return "Checking access status...";
    if (sessionState.canManage) return "You are cleared to publish updates.";
    if (sessionState.session) {
      return "Signed in, but not whitelisted to publish.";
    }
    return "Sign in and confirm your name is on the whitelist to publish.";
  }, [loading, sessionState]);

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="glass-panel flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
            Transmission
          </p>
          <p className="text-lg font-semibold text-white">{transmissionStatus}</p>
          <div className="flex flex-wrap gap-3 text-sm text-white/70">
            <div className="rounded-full border border-cyan-200/30 px-3 py-1">
              Database: CockroachDB
            </div>
            <div className="rounded-full border border-cyan-200/30 px-3 py-1">
              ORM: Drizzle
            </div>
            <div className="rounded-full border border-cyan-200/30 px-3 py-1">
              Auth: Better Auth
            </div>
          </div>
        </div>
          <AuthPanel
            session={sessionState.session}
            displayName={sessionState.displayName}
            onAuthChange={refreshSession}
          />
      </section>

      {sessionState.canManage && <CreatePostForm />}

      <PostsGrid posts={posts} canManage={sessionState.canManage} />
    </>
  );
}

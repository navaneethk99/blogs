"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type SessionInfo = {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
} | null;

type AuthPanelProps = {
  session: SessionInfo;
  displayName?: string | null;
  onAuthChange?: () => Promise<void> | void;
};

const DEFAULT_ERROR = "Unable to start Google sign-in.";

export default function AuthPanel({
  session,
  displayName,
  onAuthChange,
}: AuthPanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isSignedIn = !!session;

  const handleGoogleSignIn = async () => {
    setError(null);
    setPending(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
      });

      if (result?.error) {
        setError(result.error.message ?? DEFAULT_ERROR);
      }
      if (!result?.error) {
        await onAuthChange?.();
      }
    } catch (err) {
      setError(DEFAULT_ERROR);
    } finally {
      setPending(false);
    }
  };

  const handleSignOut = async () => {
    setPending(true);
    await authClient.signOut();
    await onAuthChange?.();
    router.refresh();
    setPending(false);
  };

  return (
    <section className="glass-panel flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
            Authentication
          </p>
          <h2 className="text-lg font-semibold text-white">
            {isSignedIn ? "Session Online" : "Google Access"}
          </h2>
        </div>
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
      </div>

      {isSignedIn ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-white/80">
            Signed in as <span className="font-semibold">{displayName}</span>.
          </p>
          <button
            className="neon-button"
            onClick={handleSignOut}
            disabled={pending}
            type="button"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            className="neon-button"
            onClick={handleGoogleSignIn}
            disabled={pending}
            type="button"
          >
            Continue with Google
          </button>
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <p className="text-xs text-cyan-200/60">
            Only Google OAuth is enabled for this console.
          </p>
        </div>
      )}
    </section>
  );
}

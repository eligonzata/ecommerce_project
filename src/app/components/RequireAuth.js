"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Renders children only when a user session exists after client hydration.
 * Otherwise redirects to sign-in with ?next=current path (safe internal paths only).
 */
export default function RequireAuth({ children }) {
  const { user, hasHydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "/";

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) {
      router.replace(
        `/sign-in?next=${encodeURIComponent(pathname)}`,
      );
    }
  }, [hasHydrated, user, router, pathname]);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-neutral-600">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-neutral-600">
        Redirecting to sign in…
      </div>
    );
  }

  return children;
}

"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "../../../lib/supabase/client";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    const requested = searchParams.get("next");
    const next = requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/admin";

    try {
      // 1. Try server-side sign-in route first (sets HTTP cookies reliably on server)
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };

      if (res.ok && data.success) {
        // Full hard navigation ensures cookies are attached to the HTTP request
        window.location.href = next;
        return;
      }

      // 2. Also try client-side Supabase client as fallback
      const supabase = createSupabaseBrowserClient();
      const { error: clientError } = await supabase.auth.signInWithPassword({ email, password });

      if (clientError) {
        setError(data.error || clientError.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      window.location.href = next;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Please check your credentials.");
      setLoading(false);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={submit}>
      <label>
        Admin Email (ইমেইল ঠিকানা)
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="houseboatownersassociation70@gmail.com"
        />
      </label>
      <label>
        Password (পাসওয়ার্ড)
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button className="button button--dark" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

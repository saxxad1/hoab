"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "../../../lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    const requested = searchParams.get("next");
    const next = requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/admin";
    router.replace(next);
    router.refresh();
  }

  return <form className="admin-login-form" onSubmit={submit}>
    <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
    <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
    {error && <p className="form-error">{error}</p>}
    <button className="button button--dark" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
  </form>;
}

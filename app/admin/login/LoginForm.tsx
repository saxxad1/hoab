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
    const rawEmail = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    // Auto-fix spelling typos like "associaton" -> "association"
    let email = rawEmail;
    if (rawEmail === "houseboatownersassociaton70@gmail.com") {
      email = "houseboatownersassociation70@gmail.com";
    }

    const requested = searchParams.get("next");
    const next = requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/admin";

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        let msg = signInError.message;
        if (msg === "Invalid login credentials") {
          msg = "ভুল ইমেইল বা পাসওয়ার্ড দেওয়া হয়েছে। দয়া করে সঠিক পাসওয়ার্ড দিন। (Invalid email or password)";
        }
        setError(msg);
        setLoading(false);
        return;
      }

      if (data?.session) {
        window.location.href = next;
      } else {
        setError("Login session error. Please try again.");
        setLoading(false);
      }
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
      {error && (
        <p
          className="form-error"
          style={{
            color: "#d63031",
            background: "#fff5f5",
            border: "1px solid #fab1a0",
            padding: "10px 14px",
            borderRadius: "4px",
            fontSize: "13px",
            lineHeight: 1.5,
            fontWeight: 600,
            margin: "4px 0 10px",
          }}
        >
          ⚠️ {error}
        </p>
      )}
      <button
        className="button button--dark"
        disabled={loading}
        style={{ width: "100%", minHeight: "48px", cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "Signing in…" : "Sign in to Admin"}
      </button>
    </form>
  );
}

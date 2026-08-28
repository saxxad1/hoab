"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      // Call our own fast server-side auth proxy (bypasses any ISP Supabase blocks)
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = (await res.json()) as { success?: boolean; error?: string };

      if (res.ok && data.success) {
        // Full hard navigation ensures cookies are attached to the HTTP request
        window.location.href = next;
        return;
      }

      let errorMsg = data.error || "Invalid login credentials";
      if (
        errorMsg.toLowerCase().includes("invalid login credentials") ||
        errorMsg.toLowerCase().includes("invalid credentials")
      ) {
        errorMsg = "ভুল ইমেইল বা পাসওয়ার্ড দেওয়া হয়েছে। দয়া করে আপনার পাসওয়ার্ডটি সঠিক কিনা চেক করে আবার লিখুন।";
      }

      setError(errorMsg);
      setLoading(false);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("সার্ভার থেকে রেসপন্স পেতে দেরি হচ্ছে। দয়া করে ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।");
      } else {
        setError(err instanceof Error ? err.message : "সাইন ইন করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
      }
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
          placeholder="admin@hoab.org.bd"
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
            color: "#c0392b",
            background: "#fff5f5",
            border: "1px solid #fab1a0",
            padding: "10px 14px",
            borderRadius: "4px",
            fontSize: "13px",
            lineHeight: 1.5,
            fontWeight: 600,
            margin: "4px 0 12px",
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

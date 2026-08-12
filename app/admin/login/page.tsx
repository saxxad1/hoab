import { Suspense } from "react";
import LoginForm from "./LoginForm";
import { isSupabaseConfigured } from "../../../lib/supabase/config";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const configured = isSupabaseConfigured();
  return <main className="admin-access-page"><div>
    <span className="section-kicker">Secure administration</span>
    <h1>HOAB administrator sign in</h1>
    <p>{configured ? "Use the administrator account created in Supabase Authentication." : "The public website is available in local preview mode. Add the Supabase values to .env.local to activate database writes and administrator login."}</p>
    {configured ? <Suspense fallback={<p>Loading secure sign-in…</p>}><LoginForm /></Suspense> : <a className="button button--dark" href="/">View local website</a>}
    <a className="text-link" href="/">Return to website</a>
  </div></main>;
}

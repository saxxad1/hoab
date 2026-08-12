import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return <main className="admin-access-page"><div>
    <span className="section-kicker">Secure administration</span>
    <h1>HOAB administrator sign in</h1>
    <p>Use the administrator account created in Supabase Authentication.</p>
    <Suspense fallback={<p>Loading secure sign-in…</p>}><LoginForm /></Suspense>
    <a className="text-link" href="/">Return to website</a>
  </div></main>;
}

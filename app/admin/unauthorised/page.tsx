import { createSupabaseServerClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <main className="admin-access-page"><div>
    <h1>Administrator access required</h1>
    <p>{user?.email ?? "This account"} is signed in but is not on the HOAB administrator allow-list.</p>
    <form action="/api/auth/signout" method="post"><button className="button button--dark">Use another account</button></form>
    <a className="text-link" href="/">Return to website</a>
  </div></main>;
}

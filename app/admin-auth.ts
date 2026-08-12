import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "../db";
import { adminUsers } from "../db/schema";
import { createSupabaseServerClient } from "../lib/supabase/server";
import { isSupabaseConfigured } from "../lib/supabase/config";

export type AdminIdentity = {
  displayName: string;
  email: string;
  fullName: string | null;
  role: string;
};

export function canAdminWrite(role: string, area: string) {
  if (role === "super_admin") return true;
  if (role === "administrator") return area !== "users";
  if (role === "membership_manager") return area === "houseboats" || area === "categories";
  if (role === "b2b_manager") return area === "applications" || area === "agents";
  if (role === "content_editor") return ["posts", "events", "leadership", "pages", "resources", "enquiries"].includes(area);
  return false;
}

function configuredAdmins() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.email) return null;

  const email = user.email.toLowerCase();
  const fullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  const displayName = fullName || email;
  if (configuredAdmins().includes(email)) return { email, fullName, displayName, role: "super_admin" };

  try {
    const [record] = await getDb().select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    return record?.active ? { email, fullName, displayName: fullName || record.name || email, role: record.role } : null;
  } catch {
    return null;
  }
}

export async function requireAdminPage(returnTo: string) {
  if (!isSupabaseConfigured()) redirect("/admin/login?setup=required");
  const identity = await getAdminIdentity();
  if (identity) return identity;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(returnTo)}`);
  redirect("/admin/unauthorised");
}

export async function requireAdminRequest(request: Request): Promise<AdminIdentity | null> {
  void request;
  return getAdminIdentity();
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

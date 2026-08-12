import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { adminUsers } from "../db/schema";
import { getChatGPTUser, chatGPTSignInPath, type ChatGPTUser } from "./chatgpt-auth";

export type AdminIdentity = ChatGPTUser & { role: string };

export function canAdminWrite(role: string, area: string) {
  if (role === "super_admin") return true;
  if (role === "administrator") return area !== "users";
  if (role === "membership_manager") return area === "houseboats" || area === "categories";
  if (role === "b2b_manager") return area === "applications" || area === "agents";
  if (role === "content_editor") return ["posts", "events", "leadership", "pages", "resources", "enquiries"].includes(area);
  return false;
}

function configuredAdmins() {
  const value = (env as unknown as Record<string, string | undefined>).ADMIN_EMAILS ?? "";
  return value.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "";
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return { displayName: "Local Administrator", email: "local@hoab.test", fullName: "Local Administrator", role: "super_admin" };
  }
  const user = await getChatGPTUser();
  if (!user) return null;
  if (configuredAdmins().includes(user.email.toLowerCase())) return { ...user, role: "super_admin" };
  try {
    const [record] = await getDb().select().from(adminUsers).where(eq(adminUsers.email, user.email.toLowerCase())).limit(1);
    return record?.active ? { ...user, role: record.role } : null;
  } catch { return null; }
}

export async function requireAdminPage(returnTo: string) {
  const identity = await getAdminIdentity();
  if (identity) return identity;
  const user = await getChatGPTUser();
  if (!user) redirect(chatGPTSignInPath(returnTo));
  redirect("/admin/unauthorised");
}

export async function requireAdminRequest(request: Request): Promise<AdminIdentity | null> {
  const host = request.headers.get("host") ?? "";
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return { displayName: "Local Administrator", email: "local@hoab.test", fullName: "Local Administrator", role: "super_admin" };
  }
  const email = request.headers.get("oai-authenticated-user-email")?.toLowerCase();
  if (!email) return null;
  const encoded = request.headers.get("oai-authenticated-user-full-name");
  let name: string | null = null;
  try { name = encoded ? decodeURIComponent(encoded) : null; } catch { name = null; }
  if (configuredAdmins().includes(email)) return { email, fullName: name, displayName: name ?? email, role: "super_admin" };
  try {
    const [record] = await getDb().select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    return record?.active ? { email, fullName: name, displayName: name ?? record.name ?? email, role: record.role } : null;
  } catch { return null; }
}

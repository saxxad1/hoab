import { requireAdminPage } from "../admin-auth";
import AdminConsole from "./AdminConsole";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const identity = await requireAdminPage("/admin");
  return <AdminConsole identity={identity} />;
}

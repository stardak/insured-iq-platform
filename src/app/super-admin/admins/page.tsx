import { requireSuperAdmin } from "../auth";
import { getAdminUsers } from "./actions";
import { AdminsClient } from "./admins-client";

export default async function AdminsPage() {
  const { userId } = await requireSuperAdmin();
  const admins = await getAdminUsers();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminsClient initialAdmins={admins} currentUserId={userId} />
    </div>
  );
}

import { requireSuperAdmin } from "../auth";
import { getAllUsers } from "../actions";
import { UsersTable } from "./users-table";

export default async function UsersPage() {
  await requireSuperAdmin();
  const users = await getAllUsers();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          All users across every tenant on the platform.
        </p>
      </div>
      <UsersTable initialUsers={users} />
    </div>
  );
}

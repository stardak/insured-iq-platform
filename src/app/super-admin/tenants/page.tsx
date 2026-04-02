import { requireSuperAdmin } from "../auth";
import { getAllTenants } from "../actions";
import { TenantsTable } from "./tenants-table";

export default async function TenantsPage() {
  await requireSuperAdmin();
  const tenants = await getAllTenants();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Tenants</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all tenants on the platform.
        </p>
      </div>
      <TenantsTable initialTenants={tenants} />
    </div>
  );
}

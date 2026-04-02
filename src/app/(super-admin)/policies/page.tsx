import { requireSuperAdmin } from "../auth";
import { getAllPolicies } from "../actions";
import { PoliciesTable } from "./policies-table";

export default async function PoliciesPage() {
  await requireSuperAdmin();
  const policies = await getAllPolicies();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Policies</h1>
        <p className="mt-1 text-sm text-gray-500">
          All policies across every tenant on the platform.
        </p>
      </div>
      <PoliciesTable initialPolicies={policies} />
    </div>
  );
}

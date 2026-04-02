import { getBillingInfo } from "./actions";
import { BillingClient } from "@/components/tenant/billing-client";
import { PLANS } from "@/lib/stripe/plans";

export default async function BillingPage() {
  const { data: billing, error } = await getBillingInfo();

  if (error || !billing) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Billing</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your subscription and billing details.
          </p>
        </div>
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200 ring-inset">
          {error ?? "Failed to load billing information."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Billing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your subscription and billing details.
        </p>
      </div>

      <BillingClient billing={billing} plans={PLANS} />
    </div>
  );
}

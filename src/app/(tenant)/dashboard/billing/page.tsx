import { getBillingInfo } from "./actions";
import { BillingClient } from "@/components/tenant/billing-client";
import { PLANS } from "@/lib/stripe/plans";

export default async function BillingPage() {
  const { data: billing, error } = await getBillingInfo();

  if (error || !billing) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing details.
          </p>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error ?? "Failed to load billing information."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing details.
        </p>
      </div>

      <BillingClient billing={billing} plans={PLANS} />
    </div>
  );
}

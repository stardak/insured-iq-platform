"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Check,
  ArrowUpRight,
  Loader2,
  Sparkles,
  Calendar,
  Zap,
} from "lucide-react";
import type { BillingInfo } from "@/app/(tenant)/dashboard/billing/actions";
import type { PlanDefinition, PlanTier } from "@/lib/stripe/plans";

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  trialing: { label: "Trial", className: "bg-blue-100 text-blue-700 border-blue-200" },
  past_due: { label: "Past Due", className: "bg-amber-100 text-amber-700 border-amber-200" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-600 border-red-200" },
  inactive: { label: "Free", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

interface BillingClientProps {
  billing: BillingInfo;
  plans: Record<PlanTier, PlanDefinition>;
}

export function BillingClient({ billing, plans }: BillingClientProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const statusBadge = STATUS_BADGES[billing.planStatus] ?? STATUS_BADGES.inactive;

  const nextBillingDate = billing.currentPeriodEnd
    ? new Date(billing.currentPeriodEnd).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  async function handleCheckout(planTier: PlanTier) {
    setLoading(planTier);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        setLoading(null);
      }
    } catch {
      setLoading(null);
    }
  }

  async function handleManage() {
    setLoading("manage");
    try {
      const res = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Portal error:", data.error);
        setLoading(null);
      }
    } catch {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Current Plan Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CreditCard className="size-5" />
              </div>
              Current Plan
            </CardTitle>
            <CardDescription>
              Your subscription details and billing information.
            </CardDescription>
          </div>
          <Badge variant="outline" className={statusBadge.className}>
            {statusBadge.label}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Plan Name */}
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Plan
              </p>
              <p className="text-lg font-semibold flex items-center gap-2">
                {billing.planName}
                {billing.plan !== "free" && <Sparkles className="size-4 text-amber-500" />}
              </p>
            </div>

            {/* Monthly Cost */}
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Monthly Cost
              </p>
              <p className="text-lg font-semibold">
                {billing.monthlyPrice > 0 ? (
                  <>£{billing.monthlyPrice}<span className="text-sm text-muted-foreground font-normal">/mo</span></>
                ) : (
                  "Free"
                )}
              </p>
            </div>

            {/* Next Billing Date */}
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Next Billing Date
              </p>
              <p className="text-lg font-semibold flex items-center gap-2">
                {nextBillingDate ? (
                  <>
                    <Calendar className="size-4 text-muted-foreground" />
                    {nextBillingDate}
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </p>
            </div>
          </div>

          {/* Features */}
          <Separator className="my-6" />
          <div className="space-y-3">
            <p className="text-sm font-medium">Included features</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {billing.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {billing.hasSubscription && (
            <>
              <Separator className="my-6" />
              <Button
                onClick={handleManage}
                variant="outline"
                disabled={loading === "manage"}
              >
                {loading === "manage" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowUpRight className="size-4" />
                )}
                Manage Subscription
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Plans */}
      {billing.plan === "free" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Upgrade Your Plan</h2>
            <p className="text-sm text-muted-foreground">
              Unlock more features and grow your insurance business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["pro", "enterprise"] as const).map((tier) => {
              const plan = plans[tier];
              return (
                <Card key={tier} className="relative overflow-hidden">
                  {tier === "pro" && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
                  )}
                  {tier === "enterprise" && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
                  )}
                  <CardHeader className="pt-5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {tier === "pro" && (
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                    <p className="text-3xl font-bold pt-2">
                      £{plan.monthlyPrice}
                      <span className="text-sm text-muted-foreground font-normal">/mo</span>
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="size-4 text-emerald-500 shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <Button
                      className="w-full"
                      variant={tier === "pro" ? "default" : "outline"}
                      onClick={() => handleCheckout(tier)}
                      disabled={!!loading}
                    >
                      {loading === tier ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Zap className="size-4" />
                      )}
                      Upgrade to {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

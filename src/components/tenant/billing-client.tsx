"use client";

import { useState } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";
import type { BillingInfo } from "@/app/(tenant)/dashboard/billing/actions";
import type { PlanDefinition, PlanTier } from "@/lib/stripe/plans";

// ─── Status badges ───────────────────────────────────────────

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className:
      "inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset",
  },
  trialing: {
    label: "Trial",
    className:
      "inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset",
  },
  past_due: {
    label: "Past Due",
    className:
      "inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-yellow-600/20 ring-inset",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/10 ring-inset",
  },
  inactive: {
    label: "Free",
    className:
      "inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset",
  },
};

// ─── Demo invoices ───────────────────────────────────────────

const DEMO_INVOICES = [
  {
    id: "INV-001",
    date: "1 Mar 2026",
    amount: "£99.00",
    status: "Paid",
    statusClass: "text-green-700 bg-green-50 ring-green-600/20",
  },
  {
    id: "INV-002",
    date: "1 Feb 2026",
    amount: "£99.00",
    status: "Paid",
    statusClass: "text-green-700 bg-green-50 ring-green-600/20",
  },
  {
    id: "INV-003",
    date: "1 Jan 2026",
    amount: "£99.00",
    status: "Paid",
    statusClass: "text-green-700 bg-green-50 ring-green-600/20",
  },
];

// ─── Component ───────────────────────────────────────────────

interface BillingClientProps {
  billing: BillingInfo;
  plans: Record<PlanTier, PlanDefinition>;
}

export function BillingClient({ billing, plans }: BillingClientProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const statusBadge =
    STATUS_BADGES[billing.planStatus] ?? STATUS_BADGES.inactive;

  const nextBillingDate = billing.currentPeriodEnd
    ? new Date(billing.currentPeriodEnd).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  // ── Handlers ─────────────────────────────────────────────

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

  // ── Plan tiers for pricing cards ─────────────────────────

  const tiers = (["free", "pro", "enterprise"] as const).map((tier) => {
    const plan = plans[tier];
    return {
      tier,
      name: plan.name,
      description: plan.description,
      price: plan.monthlyPrice,
      features: plan.features,
      isCurrent: billing.plan === tier,
      featured: tier === "pro",
    };
  });

  return (
    <div className="space-y-10">
      {/* ─── Current Plan Card ─────────────────────────────── */}
      <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Current plan
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Your subscription details and billing information.
              </p>
            </div>
            <span className={statusBadge.className}>{statusBadge.label}</span>
          </div>
        </div>
        <div className="px-6 py-6">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Plan</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">
                {billing.planName}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Monthly cost
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">
                {billing.monthlyPrice > 0 ? (
                  <>
                    £{billing.monthlyPrice}
                    <span className="text-sm font-normal text-gray-500">
                      /mo
                    </span>
                  </>
                ) : (
                  "Free"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Next billing date
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">
                {nextBillingDate ?? "—"}
              </dd>
            </div>
          </dl>

          {/* Included features */}
          <div className="mt-6 border-t border-gray-100 pt-6">
            <h4 className="text-sm font-medium text-gray-900">
              Included features
            </h4>
            <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {billing.features.map((feature) => (
                <li key={feature} className="flex gap-x-3 text-sm text-gray-600">
                  <CheckIcon
                    aria-hidden="true"
                    className="h-5 w-5 flex-none text-indigo-600"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Manage subscription button */}
          {billing.hasSubscription && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <button
                onClick={handleManage}
                disabled={loading === "manage"}
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {loading === "manage" ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="size-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="opacity-25"
                      />
                      <path
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        className="opacity-75"
                      />
                    </svg>
                    Loading…
                  </span>
                ) : (
                  "Manage subscription"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Payment Method Card ───────────────────────────── */}
      <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-5">
          <h3 className="text-base font-semibold text-gray-900">
            Payment method
          </h3>
        </div>
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-4">
              {/* Card visual */}
              <div className="flex size-12 items-center justify-center rounded-lg bg-gray-900 text-white">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-6"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25h-15a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Visa ending in 4242
                </p>
                <p className="text-sm text-gray-500">Expires 12/2028</p>
              </div>
            </div>
            <button
              onClick={handleManage}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* ─── Pricing Tiers (Tailwind Plus: 08-three-tiers) ── */}
      <div>
        <div className="text-center">
          <h2 className="text-base/7 font-semibold text-indigo-600">Pricing</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Choose your plan
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Pick the plan that best fits your insurance business. Upgrade or
            downgrade at any time.
          </p>
        </div>

        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.tier}
              data-featured={tier.featured ? "true" : undefined}
              className={`group/tier rounded-3xl p-8 xl:p-10 ${
                tier.featured
                  ? "bg-gray-900 ring-gray-900"
                  : "ring-1 ring-gray-200"
              } ${tier.isCurrent ? "ring-2 ring-indigo-600" : ""}`}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3
                  className={`text-lg/8 font-semibold ${
                    tier.featured ? "text-white" : "text-gray-900"
                  }`}
                >
                  {tier.name}
                </h3>
                {tier.isCurrent && (
                  <span className="inline-flex items-center rounded-full bg-indigo-600/10 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                    Current
                  </span>
                )}
              </div>
              <p
                className={`mt-4 text-sm/6 ${
                  tier.featured ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {tier.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span
                  className={`text-4xl font-semibold tracking-tight ${
                    tier.featured ? "text-white" : "text-gray-900"
                  }`}
                >
                  {tier.price > 0 ? `£${tier.price}` : "Free"}
                </span>
                {tier.price > 0 && (
                  <span
                    className={`text-sm/6 font-semibold ${
                      tier.featured ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    /month
                  </span>
                )}
              </p>

              {/* CTA button */}
              {tier.isCurrent ? (
                <button
                  disabled
                  className="mt-6 block w-full rounded-md bg-gray-100 px-3 py-2 text-center text-sm/6 font-semibold text-gray-400 cursor-not-allowed"
                >
                  Current plan
                </button>
              ) : (
                <button
                  onClick={() =>
                    tier.tier === "free"
                      ? handleManage()
                      : handleCheckout(tier.tier)
                  }
                  disabled={!!loading}
                  className={`mt-6 block w-full rounded-md px-3 py-2 text-center text-sm/6 font-semibold shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    tier.featured
                      ? "bg-white text-gray-900 hover:bg-gray-100 focus-visible:outline-white"
                      : "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600"
                  } disabled:opacity-50`}
                >
                  {loading === tier.tier ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="size-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="opacity-25"
                        />
                        <path
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          className="opacity-75"
                        />
                      </svg>
                      Loading…
                    </span>
                  ) : billing.plan === "free" ? (
                    `Upgrade to ${tier.name}`
                  ) : (
                    `Switch to ${tier.name}`
                  )}
                </button>
              )}

              {/* Feature list */}
              <ul
                role="list"
                className={`mt-8 space-y-3 text-sm/6 xl:mt-10 ${
                  tier.featured ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      aria-hidden="true"
                      className={`h-6 w-5 flex-none ${
                        tier.featured ? "text-white" : "text-indigo-600"
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Billing History Table ─────────────────────────── */}
      <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-5">
          <h3 className="text-base font-semibold text-gray-900">
            Billing history
          </h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-3.5 pr-3 pl-6 text-left text-sm font-semibold text-gray-900"
              >
                Invoice
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Amount
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Status
              </th>
              <th scope="col" className="relative py-3.5 pr-6 pl-3">
                <span className="sr-only">Download</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {DEMO_INVOICES.map((invoice) => (
              <tr key={invoice.id}>
                <td className="whitespace-nowrap py-4 pr-3 pl-6 text-sm font-medium text-gray-900">
                  {invoice.id}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {invoice.date}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {invoice.amount}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${invoice.statusClass}`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="whitespace-nowrap py-4 pr-6 pl-3 text-right text-sm">
                  <button className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

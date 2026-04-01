import type { Metadata } from "next";
import { getPortalBrandConfig, getPortalUser } from "./actions";
import { PolicyCard, type PolicyData } from "@/components/customer/policy-card";
import { FileText, Shield } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const { data: brand } = await getPortalBrandConfig();
  const companyName = brand?.company_name || "Insurance Portal";
  return {
    title: `My Policies — ${companyName}`,
    description: `View and manage your insurance policies with ${companyName}.`,
  };
}

// Placeholder policies for demo purposes
const DEMO_POLICIES: PolicyData[] = [
  {
    id: "1",
    policyNumber: "POL-2025-001847",
    productType: "car",
    status: "active",
    premium: 45.99,
    startDate: "15 Jan 2025",
    endDate: "14 Jan 2026",
  },
  {
    id: "2",
    policyNumber: "POL-2025-001848",
    productType: "home",
    status: "active",
    premium: 32.50,
    startDate: "01 Mar 2025",
    endDate: "28 Feb 2026",
  },
  {
    id: "3",
    policyNumber: "POL-2024-001203",
    productType: "pet",
    status: "active",
    premium: 18.75,
    startDate: "10 Jun 2024",
    endDate: "09 Jun 2025",
  },
  {
    id: "4",
    policyNumber: "POL-2024-000892",
    productType: "life",
    status: "pending",
    premium: 89.00,
    startDate: "01 Apr 2025",
    endDate: "31 Mar 2026",
  },
  {
    id: "5",
    policyNumber: "POL-2023-000341",
    productType: "bike",
    status: "expired",
    premium: 12.99,
    startDate: "01 May 2023",
    endDate: "30 Apr 2024",
  },
  {
    id: "6",
    policyNumber: "POL-2024-001567",
    productType: "health",
    status: "active",
    premium: 67.25,
    startDate: "01 Sep 2024",
    endDate: "31 Aug 2025",
  },
];

export default async function CustomerPortalPage() {
  const [brandResult, portalUser] = await Promise.all([
    getPortalBrandConfig(),
    getPortalUser(),
  ]);

  const brand = brandResult.data;
  const primaryColour = brand?.primary_colour ?? "#4F46E5";
  const userName = portalUser?.name ?? "Customer";

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {userName.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Manage your insurance policies and coverage details.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="flex items-center gap-4 rounded-xl border p-4"
          style={{ borderColor: `${primaryColour}20` }}
        >
          <div
            className="flex size-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${primaryColour}12`, color: primaryColour }}
          >
            <Shield className="size-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {DEMO_POLICIES.filter((p) => p.status === "active").length}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Active Policies
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-4 rounded-xl border p-4"
          style={{ borderColor: `${primaryColour}20` }}
        >
          <div
            className="flex size-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${primaryColour}12`, color: primaryColour }}
          >
            <FileText className="size-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{DEMO_POLICIES.length}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Total Policies
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-4 rounded-xl border p-4"
          style={{ borderColor: `${primaryColour}20` }}
        >
          <div
            className="flex size-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${primaryColour}12`, color: primaryColour }}
          >
            <span className="text-sm font-bold">£</span>
          </div>
          <div>
            <p className="text-2xl font-bold">
              £{DEMO_POLICIES.filter((p) => p.status === "active")
                .reduce((sum, p) => sum + p.premium, 0)
                .toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Monthly Total
            </p>
          </div>
        </div>
      </div>

      {/* Policies Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your Policies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEMO_POLICIES.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              primaryColour={primaryColour}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

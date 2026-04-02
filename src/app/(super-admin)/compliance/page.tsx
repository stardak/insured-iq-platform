import { requireSuperAdmin } from "../auth";
import {
  ShieldCheckIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default async function CompliancePage() {
  await requireSuperAdmin();

  // Compliance status items
  const complianceItems = [
    {
      name: "FCA Authorisation",
      status: "active",
      description: "Fully authorised and regulated by the Financial Conduct Authority.",
      reference: "FRN: 123456",
      lastReviewed: "2026-01-15",
    },
    {
      name: "Data Protection (GDPR)",
      status: "active",
      description: "Registered with the ICO and fully compliant with UK GDPR requirements.",
      reference: "ICO: ZA123456",
      lastReviewed: "2026-02-01",
    },
    {
      name: "Anti-Money Laundering (AML)",
      status: "active",
      description: "AML policies and procedures in place. Staff training up to date.",
      reference: "Policy v3.2",
      lastReviewed: "2026-03-10",
    },
    {
      name: "Professional Indemnity Insurance",
      status: "active",
      description: "PI cover in place with adequate limits for platform operations.",
      reference: "Policy #PI-2026-001",
      lastReviewed: "2026-01-01",
    },
    {
      name: "Cyber Insurance",
      status: "review",
      description: "Annual renewal due. Policy under review with current provider.",
      reference: "Policy #CY-2025-003",
      lastReviewed: "2025-12-15",
    },
    {
      name: "Consumer Duty",
      status: "active",
      description: "Consumer Duty framework implemented across all tenant products.",
      reference: "Framework v2.0",
      lastReviewed: "2026-02-20",
    },
  ];

  const statusConfig: Record<string, { icon: typeof CheckBadgeIcon; color: string; bg: string; label: string }> = {
    active: { icon: CheckBadgeIcon, color: "text-emerald-600", bg: "bg-emerald-100", label: "Compliant" },
    review: { icon: ClockIcon, color: "text-amber-600", bg: "bg-amber-100", label: "Under Review" },
    expired: { icon: ExclamationTriangleIcon, color: "text-red-600", bg: "bg-red-100", label: "Action Required" },
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Compliance</h1>
        <p className="mt-1 text-sm text-gray-500">
          Regulatory and compliance status overview.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Fully Compliant", value: complianceItems.filter(i => i.status === "active").length, color: "bg-emerald-50 text-emerald-600" },
          { label: "Under Review", value: complianceItems.filter(i => i.status === "review").length, color: "bg-amber-50 text-amber-600" },
          { label: "Action Required", value: complianceItems.filter(i => i.status === "expired").length, color: "bg-red-50 text-red-600" },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500">{card.label}</p>
            <p className={`mt-1 text-3xl font-bold ${card.color.split(" ")[1]}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Compliance Items */}
      <div className="space-y-3">
        {complianceItems.map((item) => {
          const cfg = statusConfig[item.status] ?? statusConfig.active;
          const StatusIcon = cfg.icon;

          return (
            <div key={item.name} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-start gap-4 p-5">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                  <StatusIcon className={`size-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <ShieldCheckIcon className="size-3.5" />
                      {item.reference}
                    </span>
                    <span>Last reviewed: {new Date(item.lastReviewed).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

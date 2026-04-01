"use client";

import { Car, Heart, Dog, Bike, Home, HeartPulse } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PRODUCT_ICONS: Record<string, React.ElementType> = {
  car: Car,
  life: Heart,
  pet: Dog,
  bike: Bike,
  home: Home,
  health: HeartPulse,
};

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  expired: {
    label: "Expired",
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-600 border-red-200",
  },
};

export interface PolicyData {
  id: string;
  policyNumber: string;
  productType: string;
  status: string;
  premium: number;
  startDate: string;
  endDate: string;
}

interface PolicyCardProps {
  policy: PolicyData;
  primaryColour: string;
}

export function PolicyCard({ policy, primaryColour }: PolicyCardProps) {
  const Icon = PRODUCT_ICONS[policy.productType] ?? Heart;
  const statusStyle = STATUS_STYLES[policy.status] ?? STATUS_STYLES.active;

  return (
    <Card className="group relative overflow-hidden border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      {/* Accent bar at top */}
      <div
        className="absolute inset-x-0 top-0 h-1 opacity-80"
        style={{ backgroundColor: primaryColour }}
      />

      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3 pt-5">
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `${primaryColour}12`,
              color: primaryColour,
            }}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold capitalize">
              {policy.productType} Insurance
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {policy.policyNumber}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`text-xs font-medium ${statusStyle.className}`}
        >
          {statusStyle.label}
        </Badge>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-4 pt-3 border-t">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Premium
            </p>
            <p className="text-sm font-semibold mt-0.5">
              £{policy.premium.toFixed(2)}
              <span className="text-xs text-muted-foreground font-normal">/mo</span>
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Start
            </p>
            <p className="text-sm font-medium mt-0.5">{policy.startDate}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Expires
            </p>
            <p className="text-sm font-medium mt-0.5">{policy.endDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

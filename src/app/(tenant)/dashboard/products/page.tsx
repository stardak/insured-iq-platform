"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Car,
  PawPrint,
  Heart,
  Bike,
  Home,
  Activity,
  Loader2,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  getProducts,
  toggleProduct,
  type ProductType,
  type ProductState,
} from "./actions";

// ─── Product metadata ───────────────────────────────────────

type ProductMeta = {
  label: string;
  description: string;
  icon: LucideIcon;
};

const PRODUCT_META: Record<ProductType, ProductMeta> = {
  car: {
    label: "Car Insurance",
    description: "Motor vehicle coverage including comprehensive, third-party, and collision.",
    icon: Car,
  },
  pet: {
    label: "Pet Insurance",
    description: "Veterinary bills, accidents, and illness cover for cats and dogs.",
    icon: PawPrint,
  },
  life: {
    label: "Life Insurance",
    description: "Financial protection for beneficiaries in the event of death or critical illness.",
    icon: Heart,
  },
  bike: {
    label: "Bike Insurance",
    description: "Theft, damage, and liability coverage for bicycles and e-bikes.",
    icon: Bike,
  },
  home: {
    label: "Home Insurance",
    description: "Buildings and contents protection against fire, flood, and theft.",
    icon: Home,
  },
  health: {
    label: "Health Insurance",
    description: "Private medical cover including GP visits, hospital stays, and prescriptions.",
    icon: Activity,
  },
};

const PRODUCT_ORDER: ProductType[] = ["car", "home", "health", "life", "pet", "bike"];

/** Build default state — all products off */
function buildDefaults(): Record<ProductType, ProductState> {
  const map = {} as Record<ProductType, ProductState>;
  for (const type of PRODUCT_ORDER) {
    map[type] = { id: null, type, enabled: false };
  }
  return map;
}

// ─── Product Card ───────────────────────────────────────────

function ProductCard({
  type,
  state,
  onToggle,
}: {
  type: ProductType;
  state: ProductState;
  onToggle: (type: ProductType, enabled: boolean) => void;
}) {
  const meta = PRODUCT_META[type];
  const Icon = meta.icon;
  const [isPending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    startTransition(() => {
      onToggle(type, checked);
    });
  }

  return (
    <Card className="relative overflow-hidden transition-colors">
      {/* Coloured top strip when enabled */}
      <div
        className={`absolute inset-x-0 top-0 h-1 transition-colors ${
          state.enabled ? "bg-primary" : "bg-transparent"
        }`}
      />

      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
              state.enabled
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base">{meta.label}</CardTitle>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPending && (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          )}
          <Label htmlFor={`toggle-${type}`} className="sr-only">
            Toggle {meta.label}
          </Label>
          <Switch
            id={`toggle-${type}`}
            checked={state.enabled}
            onCheckedChange={handleToggle}
            disabled={isPending}
          />
        </div>
      </CardHeader>

      <CardContent>
        <CardDescription>{meta.description}</CardDescription>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ──────────────────────────────────────────────

export default function ProductsPage() {
  const [products, setProducts] = useState<Record<
    ProductType,
    ProductState
  >>(buildDefaults);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load products on mount — merge server data over defaults
  useEffect(() => {
    getProducts().then(({ data, error }) => {
      if (data) {
        setProducts((prev) => ({ ...prev, ...data }));
      }
      if (error) {
        setError(error);
      }
      setIsLoading(false);
    });
  }, []);

  // Optimistic toggle handler
  async function handleToggle(type: ProductType, enabled: boolean) {

    // Optimistic update
    const prev = { ...products };
    setProducts({
      ...products,
      [type]: { ...products[type], enabled },
    });
    setError(null);

    const result = await toggleProduct(type, enabled);

    if (!result.success) {
      // Roll back on failure
      setProducts(prev);
      setError(result.error ?? "Failed to update product");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Products</h2>
        <p className="text-muted-foreground">
          Manage your insurance product lines. Enable or disable product types
          to offer them to your customers.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCT_ORDER.map((type) => (
          <ProductCard
            key={type}
            type={type}
            state={products[type]}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import {
  Car,
  PawPrint,
  Heart,
  Bike,
  Home,
  Activity,
  ArrowRight,
  ArrowLeft,
  Check,
  type LucideIcon,
} from "lucide-react";
import type { BrandConfig } from "@/types/brand";
import type { PublicProduct } from "../../actions";

// ─── Icon map ────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Car,
  PawPrint,
  Heart,
  Bike,
  Home,
  Activity,
};

// ─── Types ───────────────────────────────────────────────────

type Step = "select" | "form" | "quote" | "success";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
}

// ─── PostMessage height reporter ─────────────────────────────

function useHeightReporter() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function reportHeight() {
      if (containerRef.current) {
        const height = containerRef.current.scrollHeight;
        window.parent.postMessage({ type: "insured-iq-resize", height }, "*");
      }
    }

    reportHeight();
    const observer = new ResizeObserver(reportHeight);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return containerRef;
}

// ─── Widget component ────────────────────────────────────────

export default function WidgetClient({
  brand,
  products,
  tenantName,
  preSelectedProduct,
  ctaText,
}: {
  brand: BrandConfig;
  products: PublicProduct[];
  tenantName: string;
  preSelectedProduct?: string;
  ctaText: string;
}) {
  const containerRef = useHeightReporter();
  const [step, setStep] = useState<Step>(
    preSelectedProduct && products.some((p) => p.type === preSelectedProduct)
      ? "form"
      : "select"
  );
  const [selectedProduct, setSelectedProduct] = useState<string | null>(
    preSelectedProduct ?? null
  );
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
  });
  const [mockPremium, setMockPremium] = useState<string>("");

  function handleSelectProduct(type: string) {
    setSelectedProduct(type);
    setStep("form");
  }

  function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    // Mock quote generation
    const premium = (Math.random() * 30 + 8).toFixed(2);
    setMockPremium(premium);
    setStep("quote");
  }

  function handleAcceptQuote() {
    setStep("success");
  }

  function handleBack() {
    if (step === "form") {
      if (preSelectedProduct) return;
      setStep("select");
    } else if (step === "quote") {
      setStep("form");
    }
  }

  const selectedProductData = products.find((p) => p.type === selectedProduct);

  return (
    <div
      ref={containerRef}
      style={{
        fontFamily: `'${brand.font}', system-ui, sans-serif`,
      }}
      className="w-full"
    >
      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          {brand.logo_url ? (
            <img
              src={brand.logo_url}
              alt={brand.company_name}
              className="h-7 w-auto"
            />
          ) : (
            <div
              className="flex size-7 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ backgroundColor: brand.primary_colour }}
            >
              {brand.company_name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-semibold text-gray-900 tracking-tight">
            {brand.company_name}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center gap-1 mb-2">
            {["select", "form", "quote"].map((s, i) => (
              <div
                key={s}
                className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    i <=
                    (step === "success"
                      ? 2
                      : ["select", "form", "quote"].indexOf(step))
                      ? brand.primary_colour
                      : "#e5e7eb",
                }}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {step === "select" && "Step 1 of 3 — Choose a product"}
            {step === "form" && "Step 2 of 3 — Your details"}
            {step === "quote" && "Step 3 of 3 — Your quote"}
            {step === "success" && "Complete!"}
          </p>
        </div>

        {/* ── Step: Product selector ─────────────────── */}
        {step === "select" && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              What would you like to insure?
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Choose a product to get started.
            </p>
            <div className={`grid gap-3 ${products.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {products.map((product) => {
                const Icon = ICON_MAP[product.icon] ?? Activity;
                return (
                  <button
                    key={product.type}
                    onClick={() => handleSelectProduct(product.type)}
                    className="group flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center transition-all hover:border-gray-300 hover:shadow-md"
                    style={{
                      // @ts-expect-error CSS custom properties
                      "--hover-ring": brand.primary_colour,
                    }}
                  >
                    <div
                      className="flex size-10 items-center justify-center rounded-lg transition-colors"
                      style={{
                        backgroundColor: `${brand.primary_colour}12`,
                        color: brand.primary_colour,
                      }}
                    >
                      <Icon className="size-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {product.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step: Form ─────────────────────────────── */}
        {step === "form" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              {!preSelectedProduct && (
                <button
                  onClick={handleBack}
                  className="flex size-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="size-4" />
                </button>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Your details
                </h2>
                {selectedProductData && (
                  <p className="text-sm text-gray-500">
                    {selectedProductData.label} quote
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:outline-none transition-shadow"
                    style={
                      {
                        "--tw-ring-color": brand.primary_colour,
                      } as React.CSSProperties
                    }
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:outline-none transition-shadow"
                    style={
                      {
                        "--tw-ring-color": brand.primary_colour,
                      } as React.CSSProperties
                    }
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:outline-none transition-shadow"
                  style={
                    {
                      "--tw-ring-color": brand.primary_colour,
                    } as React.CSSProperties
                  }
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of birth
                </label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) =>
                    setFormData({ ...formData, dob: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:outline-none transition-shadow"
                  style={
                    {
                      "--tw-ring-color": brand.primary_colour,
                    } as React.CSSProperties
                  }
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: brand.primary_colour }}
              >
                {ctaText}
                <ArrowRight className="ml-2 inline size-4" />
              </button>
            </form>
          </div>
        )}

        {/* ── Step: Quote result ──────────────────────── */}
        {step === "quote" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={handleBack}
                className="flex size-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="size-4" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                Your quote
              </h2>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              {selectedProductData && (
                <div
                  className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${brand.primary_colour}12`,
                    color: brand.primary_colour,
                  }}
                >
                  {(() => {
                    const Icon =
                      ICON_MAP[selectedProductData.icon] ?? Activity;
                    return <Icon className="size-6" />;
                  })()}
                </div>
              )}
              <p className="text-sm text-gray-500 mb-1">
                {selectedProductData?.label}
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span
                  className="text-4xl font-bold"
                  style={{ color: brand.primary_colour }}
                >
                  £{mockPremium}
                </span>
                <span className="text-sm text-gray-500">/month</span>
              </div>
              <p className="mt-3 text-xs text-gray-400">
                Quote for {formData.firstName} {formData.lastName}
              </p>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleAcceptQuote}
                  className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: brand.primary_colour }}
                >
                  Accept quote
                </button>
                <button
                  onClick={handleBack}
                  className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 transition-all hover:bg-gray-50"
                >
                  Edit details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step: Success ───────────────────────────── */}
        {step === "success" && (
          <div className="text-center py-4">
            <div
              className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full"
              style={{
                backgroundColor: `${brand.primary_colour}15`,
                color: brand.primary_colour,
              }}
            >
              <Check className="size-7" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Quote accepted!
            </h2>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              We&apos;ve sent a confirmation to{" "}
              <span className="font-medium text-gray-700">
                {formData.email}
              </span>
              . A member of the {tenantName} team will be in touch shortly.
            </p>
          </div>
        )}

        {/* Powered by footer */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center">
            Powered by {tenantName}
          </p>
        </div>
      </div>
    </div>
  );
}

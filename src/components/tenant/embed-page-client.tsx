"use client";

import { useState, useMemo } from "react";
import {
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import type { BrandConfig } from "@/types/brand";

// ─── Types ───────────────────────────────────────────────────

type EmbedVariant = "full" | "floating" | "inline";

interface Product {
  type: string;
  label: string;
  icon: string;
}

const VARIANT_INFO: Record<
  EmbedVariant,
  { title: string; description: string }
> = {
  full: {
    title: "Full Widget",
    description: "A complete quote form. Drops in where the script tag is.",
  },
  floating: {
    title: "Floating Button",
    description:
      "A fixed bottom-right button that opens the widget in a modal.",
  },
  inline: {
    title: "Inline Embed",
    description:
      "Injects the widget into a specific div on the page by its ID.",
  },
};

const BASE_URL = "https://insured-iq-platform.vercel.app";

// ─── Component ───────────────────────────────────────────────

export function EmbedPageClient({
  slug,
  brand,
  products,
}: {
  slug: string;
  brand: BrandConfig;
  products: Product[];
}) {
  const [variant, setVariant] = useState<EmbedVariant>("full");
  const [width, setWidth] = useState(480);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    products.map((p) => p.type)
  );
  const [preSelectedProduct, setPreSelectedProduct] = useState("");
  const [ctaText, setCtaText] = useState("Get a quote");
  const [targetDiv, setTargetDiv] = useState("my-insurance-widget");
  const [copied, setCopied] = useState(false);

  // Build the embed code string
  const embedCode = useMemo(() => {
    const attrs: string[] = [
      `src="${BASE_URL}/embed.js"`,
      `data-tenant="${slug}"`,
      `data-variant="${variant}"`,
    ];

    if (width !== 480) {
      attrs.push(`data-width="${width}"`);
    }

    if (
      selectedProducts.length > 0 &&
      selectedProducts.length < products.length
    ) {
      attrs.push(`data-products="${selectedProducts.join(",")}"`);
    }

    if (preSelectedProduct) {
      attrs.push(`data-product="${preSelectedProduct}"`);
    }

    if (ctaText && ctaText !== "Get a quote") {
      attrs.push(`data-cta="${ctaText}"`);
    }

    if (variant === "inline") {
      attrs.push(`data-target="${targetDiv}"`);
    }

    return `<script ${attrs.join("\n  ")}></script>`;
  }, [
    slug,
    variant,
    width,
    selectedProducts,
    products.length,
    preSelectedProduct,
    ctaText,
    targetDiv,
  ]);

  // Full snippet (including target div for inline variant)
  const fullSnippet = useMemo(() => {
    if (variant === "inline") {
      return `<!-- Place this div where you want the widget to appear -->\n<div id="${targetDiv}"></div>\n\n<!-- Insured IQ Widget Script -->\n${embedCode}`;
    }
    return `<!-- Insured IQ Widget Script -->\n${embedCode}`;
  }, [variant, targetDiv, embedCode]);

  // Build iframe URL for preview
  const previewIframeSrc = useMemo(() => {
    const params = new URLSearchParams();
    if (preSelectedProduct) params.set("product", preSelectedProduct);
    if (
      selectedProducts.length > 0 &&
      selectedProducts.length < products.length
    ) {
      params.set("products", selectedProducts.join(","));
    }
    if (ctaText && ctaText !== "Get a quote") params.set("cta", ctaText);
    const qs = params.toString();
    return `/widget/${slug}${qs ? `?${qs}` : ""}`;
  }, [slug, preSelectedProduct, selectedProducts, products.length, ctaText]);

  async function handleCopy() {
    await navigator.clipboard.writeText(fullSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleProduct(type: string) {
    setSelectedProducts((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    // Clear pre-selected if it was deselected
    if (preSelectedProduct === type && selectedProducts.includes(type)) {
      setPreSelectedProduct("");
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">
      {/* ── Left column: Config + Code ─────────────── */}
      <div className="space-y-6">
        {/* Variant selector */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Widget Type
          </h3>
          <div className="space-y-2">
            {(Object.keys(VARIANT_INFO) as EmbedVariant[]).map((v) => (
              <label
                key={v}
                className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                  variant === v
                    ? "border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="variant"
                  value={v}
                  checked={variant === v}
                  onChange={() => setVariant(v)}
                  className="mt-0.5 accent-indigo-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {VARIANT_INFO[v].title}
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {VARIANT_INFO[v].description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Customisation options */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900">
            Customisation
          </h3>

          {/* Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Width — {width}px
            </label>
            <input
              type="range"
              min={300}
              max={800}
              step={10}
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>300px</span>
              <span>800px</span>
            </div>
          </div>

          {/* Products to show */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Products to show
            </label>
            <div className="space-y-1.5">
              {products.map((p) => (
                <label
                  key={p.type}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(p.type)}
                    onChange={() => toggleProduct(p.type)}
                    className="rounded border-gray-300 accent-indigo-600"
                  />
                  <span className="text-sm text-gray-700">{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pre-select product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Pre-select a product
            </label>
            <select
              value={preSelectedProduct}
              onChange={(e) => setPreSelectedProduct(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none"
            >
              <option value="">None (show product picker)</option>
              {products
                .filter((p) => selectedProducts.includes(p.type))
                .map((p) => (
                  <option key={p.type} value={p.type}>
                    {p.label}
                  </option>
                ))}
            </select>
          </div>

          {/* CTA Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              CTA button text
            </label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="Get a quote"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none"
            />
          </div>

          {/* Target DIV (inline only) */}
          {variant === "inline" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Target div ID
              </label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-400">#</span>
                <input
                  type="text"
                  value={targetDiv}
                  onChange={(e) => setTargetDiv(e.target.value)}
                  placeholder="my-insurance-widget"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Generated embed code */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Embed Code
            </h3>
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                copied
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {copied ? (
                <>
                  <ClipboardDocumentCheckIcon className="size-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="size-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-[11px] leading-relaxed text-gray-300 font-mono">
              <code>{fullSnippet}</code>
            </pre>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Paste this into your website&apos;s HTML, just before the closing{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-700 font-mono text-[10px]">
              &lt;/body&gt;
            </code>{" "}
            tag.
          </p>
        </div>
      </div>

      {/* ── Right column: Live Preview ────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Live Preview
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            How your widget will appear on a third-party website
          </p>
        </div>

        {/* Fake browser chrome */}
        <div className="relative bg-gray-100 p-4">
          {/* Browser window */}
          <div className="rounded-xl border border-gray-300 bg-white shadow-xl overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2.5">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-red-400" />
                <div className="size-2.5 rounded-full bg-amber-400" />
                <div className="size-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 mx-4">
                <div className="flex items-center gap-2 rounded-md bg-white border border-gray-200 px-3 py-1">
                  <svg
                    className="size-3 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                    />
                  </svg>
                  <span className="text-xs text-gray-500 font-mono">
                    www.partner-website.co.uk
                  </span>
                </div>
              </div>
            </div>

            {/* Fake page content */}
            <div className="bg-white">
              {/* Fake navbar */}
              <div className="border-b border-gray-100 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-6 rounded bg-gray-200" />
                    <div className="h-3 w-24 rounded bg-gray-200" />
                  </div>
                  <div className="flex gap-4">
                    <div className="h-3 w-12 rounded bg-gray-100" />
                    <div className="h-3 w-16 rounded bg-gray-100" />
                    <div className="h-3 w-10 rounded bg-gray-100" />
                  </div>
                </div>
              </div>

              {/* Fake page body */}
              <div className="px-6 py-8 space-y-8">
                {/* Fake heading */}
                <div className="space-y-3 max-w-md">
                  <div className="h-5 w-64 rounded bg-gray-200" />
                  <div className="h-3 w-full rounded bg-gray-100" />
                  <div className="h-3 w-4/5 rounded bg-gray-100" />
                </div>

                {/* Widget embed area */}
                {variant === "floating" ? (
                  // For floating variant, show more fake page content
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-24 rounded-lg bg-gray-50 border border-gray-100" />
                      <div className="h-24 rounded-lg bg-gray-50 border border-gray-100" />
                      <div className="h-24 rounded-lg bg-gray-50 border border-gray-100" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full rounded bg-gray-100" />
                      <div className="h-3 w-5/6 rounded bg-gray-100" />
                      <div className="h-3 w-4/6 rounded bg-gray-100" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-32 rounded-lg bg-gray-50 border border-gray-100" />
                      <div className="h-32 rounded-lg bg-gray-50 border border-gray-100" />
                    </div>
                    <div className="space-y-2 max-w-lg">
                      <div className="h-3 w-full rounded bg-gray-100" />
                      <div className="h-3 w-3/4 rounded bg-gray-100" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-20 rounded-lg bg-gray-50 border border-gray-100" />
                      <div className="h-20 rounded-lg bg-gray-50 border border-gray-100" />
                      <div className="h-20 rounded-lg bg-gray-50 border border-gray-100" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center py-4">
                      <div
                        style={{ maxWidth: `${width}px`, width: "100%" }}
                      >
                        <iframe
                          src={previewIframeSrc}
                          className="w-full"
                          style={{
                            height: "540px",
                            border: "none",
                            borderRadius: "16px",
                            boxShadow:
                              "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
                          }}
                          title="Widget preview"
                        />
                      </div>
                    </div>

                    {/* More fake content below */}
                    <div className="space-y-2 max-w-lg">
                      <div className="h-3 w-full rounded bg-gray-100" />
                      <div className="h-3 w-3/4 rounded bg-gray-100" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Floating button — rendered OUTSIDE the overflow-hidden browser window */}
          {variant === "floating" && (
            <div className="absolute bottom-8 right-8 z-10">
              <div
                className="flex size-14 items-center justify-center rounded-full text-white shadow-xl cursor-pointer transition-transform hover:scale-110 animate-bounce"
                style={{
                  backgroundColor: brand.primary_colour,
                  boxShadow: `0 8px 24px ${brand.primary_colour}40`,
                }}
              >
                <svg
                  className="size-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="absolute -top-8 right-0 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
                Get a quote →
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

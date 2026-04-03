"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  type PageConfig,
  type PageSection,
  type FaqItem,
  type TestimonialItem,
  type FeatureItem,
  DEFAULT_PAGE_CONFIG,
} from "@/types/brand";
import { getPageConfig, savePageConfig, uploadHeroImage } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Loader2,
  Upload,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Image,
  Type,
  Layers,
  Star,
  HelpCircle,
  Sparkles,
  X,
  Sun,
  Moon,
  ExternalLink,
  Video,
  Check,
  Monitor,
  Tablet,
  Smartphone,
} from "lucide-react";

// ─── Preset Video Backgrounds ────────────────────────────────

const HERO_VIDEO_PRESETS = [
  {
    name: "Abstract Flow",
    url: "https://stream.mux.com/4IMYGcL01xjs7ek5ANO17JC4VQVUTsojZlnw4fXzwSxc.m3u8",
    thumbnail: "https://image.mux.com/4IMYGcL01xjs7ek5ANO17JC4VQVUTsojZlnw4fXzwSxc/thumbnail.webp?time=2",
  },
  {
    name: "Coastal Sunset",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260306_074215_04640ca7-042c-45d6-bb56-58b1e8a42489.mp4",
    thumbnail: "",
  },
  {
    name: "Nature Walk",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260322_013248_a74099a8-be2b-4164-a823-eddd5e149fa1.mp4",
    thumbnail: "",
  },
  {
    name: "Mountain View",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_024928_1efd0b0d-6c02-45a8-8847-1030900c4f63.mp4",
    thumbnail: "",
  },
  {
    name: "City Lights",
    url: "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8",
    thumbnail: "https://image.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q/thumbnail.webp?time=2",
  },
  {
    name: "Ocean Waves",
    url: "https://stream.mux.com/Si6ej2ZRrxRCnTYBXSScDRCdd7CGnyTqiPszZcw3z4I.m3u8",
    thumbnail: "https://image.mux.com/Si6ej2ZRrxRCnTYBXSScDRCdd7CGnyTqiPszZcw3z4I/thumbnail.webp?time=2",
  },
  {
    name: "Skyscape",
    url: "https://stream.mux.com/Kec29dVyJgiPdtWaQtPuEiiGHkJIYQAVUJcNiIHUYeo.m3u8",
    thumbnail: "https://image.mux.com/Kec29dVyJgiPdtWaQtPuEiiGHkJIYQAVUJcNiIHUYeo/thumbnail.webp?time=2",
  },
  {
    name: "Northern Lights",
    url: "https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8",
    thumbnail: "https://image.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM/thumbnail.webp?time=2",
  },
];

// ─── Section Labels ──────────────────────────────────────────

const SECTION_META = {
  testimonials: {
    label: "Testimonials",
    description: "Customer quotes and ratings",
    icon: Star,
    color: "teal",
    bgClass: "bg-teal-50",
    iconClass: "text-teal-600",
    ringClass: "ring-teal-200",
    badgeClass: "bg-teal-50 text-teal-700",
    itemLabel: (n: number) => `${n} testimonial${n !== 1 ? "s" : ""}`,
  },
  faq: {
    label: "FAQ",
    description: "Frequently asked questions",
    icon: HelpCircle,
    color: "amber",
    bgClass: "bg-amber-50",
    iconClass: "text-amber-600",
    ringClass: "ring-amber-200",
    badgeClass: "bg-amber-50 text-amber-700",
    itemLabel: (n: number) => `${n} FAQ${n !== 1 ? "s" : ""}`,
  },
  features: {
    label: "Features",
    description: "Key features with icons",
    icon: Sparkles,
    color: "purple",
    bgClass: "bg-purple-50",
    iconClass: "text-purple-600",
    ringClass: "ring-purple-200",
    badgeClass: "bg-purple-50 text-purple-700",
    itemLabel: (n: number) => `${n} feature${n !== 1 ? "s" : ""}`,
  },
} as const;

// ─── Feature Icon Picker ─────────────────────────────────────

const FEATURE_ICONS = [
  "Shield", "Star", "Zap", "Heart", "Lock", "Clock",
  "DollarSign", "Users", "CheckCircle", "Award",
  "Globe", "Smartphone", "Mail", "FileText", "BarChart",
  "Umbrella", "TrendingUp", "Eye", "Wifi", "CloudRain",
];

function FeatureIconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Sparkles className="size-3.5" />
        {value || "Pick icon"}
        <ChevronDown className="size-3 text-gray-400" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 grid w-56 grid-cols-5 gap-1 rounded-lg border bg-white p-2 shadow-xl">
          {FEATURE_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => {
                onChange(icon);
                setOpen(false);
              }}
              className={`flex flex-col items-center gap-0.5 rounded-md px-1 py-1.5 text-[9px] transition-colors ${
                value === icon
                  ? "bg-purple-100 text-purple-700 font-semibold"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Sparkles className="size-3.5" />
              {icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FAQ Editor ──────────────────────────────────────────────

function FaqEditor({
  items,
  onChange,
}: {
  items: FaqItem[];
  onChange: (items: FaqItem[]) => void;
}) {
  function addItem() {
    onChange([...items, { question: "", answer: "" }]);
  }
  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }
  function updateItem(index: number, field: keyof FaqItem, value: string) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="group rounded-xl border border-amber-100 bg-amber-50/30 p-4 space-y-3 transition-all hover:border-amber-200"
        >
          <div className="flex items-start gap-3">
            <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
              Q{i + 1}
            </div>
            <div className="flex-1 space-y-2">
              <Input
                placeholder="What is this question about?"
                value={item.question}
                onChange={(e) => updateItem(i, "question", e.target.value)}
                className="font-medium"
              />
              <Textarea
                placeholder="Write a helpful answer..."
                value={item.answer}
                onChange={(e) => updateItem(i, "answer", e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>
            <button
              type="button"
              className="shrink-0 rounded-md p-1.5 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
              onClick={() => removeItem(i)}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-amber-200 bg-amber-50/50 px-3 py-2.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 hover:border-amber-300"
      >
        <Plus className="size-3.5" />
        Add Question
      </button>
    </div>
  );
}

// ─── Testimonials Editor ─────────────────────────────────────

function TestimonialsEditor({
  items,
  onChange,
}: {
  items: TestimonialItem[];
  onChange: (items: TestimonialItem[]) => void;
}) {
  function addItem() {
    onChange([...items, { name: "", quote: "", rating: 5 }]);
  }
  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }
  function updateItem(
    index: number,
    field: keyof TestimonialItem,
    value: string | number
  ) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="group rounded-xl border border-teal-100 bg-teal-50/30 p-4 space-y-3 transition-all hover:border-teal-200"
        >
          <div className="flex items-start gap-3">
            {/* Avatar initial */}
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white shadow-sm">
              {item.name ? item.name[0].toUpperCase() : "?"}
            </div>
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Customer name"
                value={item.name}
                onChange={(e) => updateItem(i, "name", e.target.value)}
                className="font-medium"
              />
              <Textarea
                placeholder="&quot;This product changed my life...&quot;"
                value={item.quote}
                onChange={(e) => updateItem(i, "quote", e.target.value)}
                rows={2}
                className="text-sm italic"
              />
              {/* Star rating */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                  Rating
                </span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => updateItem(i, "rating", star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`size-4.5 ${
                          star <= item.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-md p-1.5 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
              onClick={() => removeItem(i)}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-teal-200 bg-teal-50/50 px-3 py-2.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-50 hover:border-teal-300"
      >
        <Plus className="size-3.5" />
        Add Testimonial
      </button>
    </div>
  );
}

// ─── Features Editor ─────────────────────────────────────────

function FeaturesEditor({
  items,
  onChange,
}: {
  items: FeatureItem[];
  onChange: (items: FeatureItem[]) => void;
}) {
  function addItem() {
    onChange([...items, { icon: "Star", title: "", description: "" }]);
  }
  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }
  function updateItem(
    index: number,
    field: keyof FeatureItem,
    value: string
  ) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="group rounded-xl border border-purple-100 bg-purple-50/30 p-4 space-y-2 transition-all hover:border-purple-200"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <Sparkles className="size-4" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <FeatureIconPicker
                  value={item.icon}
                  onChange={(icon) => updateItem(i, "icon", icon)}
                />
                <Input
                  placeholder="Feature title"
                  value={item.title}
                  onChange={(e) => updateItem(i, "title", e.target.value)}
                  className="flex-1 font-medium"
                />
              </div>
              <Input
                placeholder="Short description of this feature..."
                value={item.description}
                onChange={(e) => updateItem(i, "description", e.target.value)}
                className="text-sm"
              />
            </div>
            <button
              type="button"
              className="shrink-0 rounded-md p-1.5 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
              onClick={() => removeItem(i)}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-purple-200 bg-purple-50/50 px-3 py-2.5 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-50 hover:border-purple-300"
      >
        <Plus className="size-3.5" />
        Add Feature
      </button>
    </div>
  );
}

// ─── Drag Handle Icon ────────────────────────────────────────

function GripIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <circle cx="5" cy="3" r="1.2" />
      <circle cx="11" cy="3" r="1.2" />
      <circle cx="5" cy="8" r="1.2" />
      <circle cx="11" cy="8" r="1.2" />
      <circle cx="5" cy="13" r="1.2" />
      <circle cx="11" cy="13" r="1.2" />
    </svg>
  );
}

// ─── Section Card ────────────────────────────────────────────

function SectionCard({
  section,
  onToggle,
  onMoveUp,
  onMoveDown,
  onContentChange,
  isFirst,
  isLast,
}: {
  section: PageSection;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onContentChange: (content: PageSection["content"]) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = SECTION_META[section.type];
  const Icon = meta.icon;
  const itemCount = (section.content?.items as unknown[] | undefined)?.length ?? 0;

  return (
    <div
      className={`rounded-xl border bg-white shadow-sm transition-all ${
        section.enabled
          ? "border-gray-200 hover:shadow-md"
          : "border-gray-100 opacity-60"
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Drag handle + reorder */}
        <div className="flex flex-col items-center gap-0.5">
          <button
            type="button"
            disabled={isFirst}
            onClick={onMoveUp}
            className="rounded p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-25 transition-colors"
          >
            <ChevronUp className="size-3" />
          </button>
          <GripIcon className="size-4 text-gray-300" />
          <button
            type="button"
            disabled={isLast}
            onClick={onMoveDown}
            className="rounded p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-25 transition-colors"
          >
            <ChevronDown className="size-3" />
          </button>
        </div>

        {/* Coloured icon */}
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${meta.bgClass} ${meta.iconClass} ring-1 ${meta.ringClass}`}
        >
          <Icon className="size-5" />
        </div>

        {/* Title + subtitle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900">{meta.label}</h4>
            {itemCount > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.badgeClass}`}
              >
                {meta.itemLabel(itemCount)}
              </span>
            )}
            {!section.enabled && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                Hidden from page
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">{meta.description}</p>
        </div>

        {/* Toggle */}
        <Switch checked={section.enabled} onCheckedChange={onToggle} />
      </div>

      {/* Expand trigger */}
      {section.enabled && (
        <div className="border-t border-gray-100">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50"
          >
            <span>{expanded ? "Collapse editor" : "Edit content"}</span>
            <ChevronDown
              className={`size-3.5 transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Smooth expand */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="border-t border-gray-100 px-4 py-4">
              {section.type === "faq" && (
                <FaqEditor
                  items={section.content.items as FaqItem[]}
                  onChange={(items) => onContentChange({ items })}
                />
              )}
              {section.type === "testimonials" && (
                <TestimonialsEditor
                  items={section.content.items as TestimonialItem[]}
                  onChange={(items) => onContentChange({ items })}
                />
              )}
              {section.type === "features" && (
                <FeaturesEditor
                  items={section.content.items as FeatureItem[]}
                  onChange={(items) => onContentChange({ items })}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export default function PageBuilderPage() {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [config, setConfig] = useState<PageConfig>(DEFAULT_PAGE_CONFIG);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // Load existing config + tenant slug
  useEffect(() => {
    getPageConfig().then(({ data, error, slug: tenantSlug }) => {
      if (data) {
        setConfig(data);
      }
      if (tenantSlug) {
        setSlug(tenantSlug);
      }
      if (error) {
        setStatus({ type: "error", message: error });
      }
      setIsLoading(false);
    });
  }, []);

  function updateConfig(partial: Partial<PageConfig>) {
    setConfig((prev) => ({ ...prev, ...partial }));
    setIsDirty(true);
  }

  // Push draft config to the preview iframe on every change
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(
      { type: "PAGE_BUILDER_UPDATE", config },
      "*"
    );
  }, [config]);

  // Listen for PREVIEW_READY from iframe to push initial config
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === "PREVIEW_READY") {
        iframeRef.current?.contentWindow?.postMessage(
          { type: "PAGE_BUILDER_UPDATE", config },
          "*"
        );
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  function updateSection(index: number, updates: Partial<PageSection>) {
    const sections = [...config.sections];
    sections[index] = { ...sections[index], ...updates };
    updateConfig({ sections });
  }

  function moveSection(index: number, direction: -1 | 1) {
    const sections = [...config.sections];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    // Swap orders
    const tempOrder = sections[index].order;
    sections[index] = { ...sections[index], order: sections[targetIndex].order };
    sections[targetIndex] = { ...sections[targetIndex], order: tempOrder };

    // Re-sort
    sections.sort((a, b) => a.order - b.order);
    updateConfig({ sections });
  }

  async function handleHeroUpload(file: File) {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("hero", file);

    const result = await uploadHeroImage(formData);
    setIsUploading(false);

    if (result.url) {
      updateConfig({ hero_image_url: result.url });
      setStatus({ type: "success", message: "Hero image uploaded!" });
    } else {
      setStatus({
        type: "error",
        message: result.error ?? "Failed to upload hero image",
      });
    }
  }

  function handleSave() {
    setStatus(null);
    startTransition(async () => {
      const result = await savePageConfig(config);
      if (result.success) {
        setStatus({ type: "success", message: "Page settings saved!" });
        setIsDirty(false);
      } else {
        setStatus({
          type: "error",
          message: result.error ?? "Failed to save",
        });
      }
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const viewportWidth =
    viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "375px";

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col -m-6">
      {/* ── Top bar ──────────────────────────────────── */}
      <div className="flex items-center justify-between border-b bg-white px-6 py-3 shrink-0">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Page Builder</h2>
          <p className="text-xs text-muted-foreground">
            Edit on the left, preview live on the right.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {status && (
            <div
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
                status.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle className="size-3.5" />
              ) : (
                <AlertCircle className="size-3.5" />
              )}
              {status.message}
            </div>
          )}
          {isDirty && (
            <span className="text-xs text-amber-600 font-medium">
              Unsaved changes
            </span>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending || !isDirty}
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Publishing…
              </>
            ) : (
              "Publish changes"
            )}
          </Button>
        </div>
      </div>

      {/* ── Split pane ───────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left panel — editing tabs (40%) ─────── */}
        <div className="w-[40%] shrink-0 overflow-y-auto border-r bg-gray-50/50 p-5">
          <Tabs defaultValue="hero" className="space-y-5">
            <TabsList>
              <TabsTrigger value="hero" className="gap-1.5">
                <Image className="size-3.5" />
                Hero
              </TabsTrigger>
              <TabsTrigger value="about" className="gap-1.5">
                <Type className="size-3.5" />
                About
              </TabsTrigger>
              <TabsTrigger value="sections" className="gap-1.5">
                <Layers className="size-3.5" />
                Sections
              </TabsTrigger>
            </TabsList>

            {/* ── Hero Tab ──────────────────────────── */}
            <TabsContent value="hero" className="space-y-4">
              {/* Theme Toggle */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Page Theme</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateConfig({ theme: "light" })}
                      className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 transition-all text-sm ${
                        config.theme === "light"
                          ? "border-indigo-600 ring-2 ring-indigo-600/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Sun className="size-4 text-amber-500" />
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => updateConfig({ theme: "dark" })}
                      className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 transition-all text-sm ${
                        config.theme === "dark"
                          ? "border-indigo-600 ring-2 ring-indigo-600/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Moon className="size-4 text-indigo-400" />
                      Dark
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Hero Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="hero_headline" className="text-xs">Headline</Label>
                    <Input
                      id="hero_headline"
                      placeholder="Insurance made simple"
                      value={config.hero_headline}
                      onChange={(e) =>
                        updateConfig({ hero_headline: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="hero_subheadline" className="text-xs">Subheadline</Label>
                    <Textarea
                      id="hero_subheadline"
                      placeholder="Get covered in minutes..."
                      value={config.hero_subheadline}
                      onChange={(e) =>
                        updateConfig({ hero_subheadline: e.target.value })
                      }
                      rows={2}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Hero Image</Label>
                    <div className="flex items-center gap-3">
                      {config.hero_image_url ? (
                        <div className="relative size-16 overflow-hidden rounded-lg border">
                          <img
                            src={config.hero_image_url}
                            alt="Hero"
                            className="size-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                            onClick={() =>
                              updateConfig({ hero_image_url: "" })
                            }
                          >
                            <X className="size-2.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex size-16 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                          <Image className="size-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleHeroUpload(file);
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {isUploading ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Upload className="size-3.5" />
                          )}
                          {isUploading ? "Uploading…" : "Upload"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Video Background Picker */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Video Background</Label>
                    <p className="text-[11px] text-muted-foreground">
                      Choose a looping video for your hero section. Replaces the hero image.
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {/* No video option */}
                      <button
                        type="button"
                        onClick={() => updateConfig({ hero_bg_video_url: "" })}
                        className={`group relative flex flex-col items-center justify-center rounded-lg border-2 p-3 transition-all h-16 ${
                          !config.hero_bg_video_url
                            ? "border-indigo-600 ring-2 ring-indigo-600/20"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <X className="size-4 text-gray-400" />
                        <span className="mt-0.5 text-[10px] font-medium text-gray-500">None</span>
                        {!config.hero_bg_video_url && (
                          <div className="absolute top-1 right-1 flex size-3 items-center justify-center rounded-full bg-indigo-600">
                            <Check className="size-1.5 text-white" />
                          </div>
                        )}
                      </button>

                      {HERO_VIDEO_PRESETS.map((preset) => {
                        const isSelected = config.hero_bg_video_url === preset.url;
                        const isMp4 = preset.url.endsWith(".mp4");
                        return (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={() =>
                              updateConfig({
                                hero_bg_video_url: preset.url,
                                hero_image_url: "",
                              })
                            }
                            className={`group relative overflow-hidden rounded-lg border-2 transition-all h-16 ${
                              isSelected
                                ? "border-indigo-600 ring-2 ring-indigo-600/20"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {preset.thumbnail ? (
                              <img
                                src={preset.thumbnail}
                                alt={preset.name}
                                className="absolute inset-0 size-full object-cover"
                              />
                            ) : isMp4 ? (
                              <video
                                src={preset.url}
                                muted
                                playsInline
                                className="absolute inset-0 size-full object-cover"
                                onMouseOver={(e) => (e.currentTarget as HTMLVideoElement).play()}
                                onMouseOut={(e) => {
                                  const v = e.currentTarget as HTMLVideoElement;
                                  v.pause();
                                  v.currentTime = 0;
                                }}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <Video className="size-4 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1 pt-3">
                              <span className="text-[9px] font-medium text-white">
                                {preset.name}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="absolute top-1 right-1 flex size-3 items-center justify-center rounded-full bg-indigo-600">
                                <Check className="size-1.5 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="hero_cta_primary" className="text-xs">Primary CTA</Label>
                      <Input
                        id="hero_cta_primary"
                        placeholder="View our products"
                        value={config.hero_cta_primary_text}
                        onChange={(e) =>
                          updateConfig({ hero_cta_primary_text: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="hero_cta_secondary" className="text-xs">Secondary CTA</Label>
                      <Input
                        id="hero_cta_secondary"
                        placeholder="Manage my policy"
                        value={config.hero_cta_secondary_text}
                        onChange={(e) =>
                          updateConfig({
                            hero_cta_secondary_text: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── About Tab ──────────────────────────── */}
            <TabsContent value="about" className="space-y-4">
              {/* Products Section text */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Products Section</CardTitle>
                  <CardDescription className="text-xs">
                    Customise the heading above your product cards.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="products_label" className="text-xs">Label</Label>
                    <Input
                      id="products_label"
                      placeholder="Products"
                      value={config.products_label}
                      onChange={(e) =>
                        updateConfig({ products_label: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="products_heading" className="text-xs">Heading</Label>
                    <Input
                      id="products_heading"
                      placeholder="Our insurance products"
                      value={config.products_heading}
                      onChange={(e) =>
                        updateConfig({ products_heading: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="products_description" className="text-xs">Description</Label>
                    <Input
                      id="products_description"
                      placeholder="Choose the type of cover that suits your needs"
                      value={config.products_description}
                      onChange={(e) =>
                        updateConfig({ products_description: e.target.value })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">About Section</CardTitle>
                  <CardDescription className="text-xs">
                    A paragraph about your company shown below the products grid.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    <Label htmlFor="about_text" className="text-xs">About Text</Label>
                    <Textarea
                      id="about_text"
                      placeholder="Tell your customers about your company, values, and what makes you different..."
                      value={config.about_text}
                      onChange={(e) =>
                        updateConfig({ about_text: e.target.value })
                      }
                      rows={5}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Leave blank to hide the about section.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Sections Tab ───────────────────────── */}
            <TabsContent value="sections" className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Page Sections</h3>
                <p className="text-[11px] text-muted-foreground">
                  Enable, reorder, and edit the sections below your products.
                </p>
              </div>

              <div className="space-y-3">
                {config.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section, index) => (
                    <SectionCard
                      key={section.id}
                      section={section}
                      onToggle={() =>
                        updateSection(index, { enabled: !section.enabled })
                      }
                      onMoveUp={() => moveSection(index, -1)}
                      onMoveDown={() => moveSection(index, 1)}
                      onContentChange={(content) =>
                        updateSection(index, { content })
                      }
                      isFirst={index === 0}
                      isLast={index === config.sections.length - 1}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Right panel — live preview (60%) ────── */}
        <div className="flex flex-1 flex-col bg-gray-100">
          {/* Preview toolbar */}
          <div className="flex items-center justify-between border-b bg-white px-4 py-2 shrink-0">
            <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5">
              {(
                [
                  { key: "desktop", icon: Monitor, label: "Desktop" },
                  { key: "tablet", icon: Tablet, label: "Tablet" },
                  { key: "mobile", icon: Smartphone, label: "Mobile" },
                ] as const
              ).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setViewport(key)}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                    viewport === key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Quick theme toggle */}
              <button
                type="button"
                onClick={() =>
                  updateConfig({
                    theme: config.theme === "light" ? "dark" : "light",
                  })
                }
                className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {config.theme === "light" ? (
                  <Moon className="size-3.5" />
                ) : (
                  <Sun className="size-3.5" />
                )}
                {config.theme === "light" ? "Dark" : "Light"}
              </button>

              {slug && (
                <button
                  type="button"
                  onClick={() => window.open(`/${slug}`, "_blank")}
                  className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="size-3.5" />
                  Open page
                </button>
              )}
            </div>
          </div>

          {/* Preview iframe */}
          <div className="flex-1 flex items-start justify-center overflow-auto p-4">
            <div
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
              style={{
                width: viewportWidth,
                maxWidth: "100%",
                height: "100%",
              }}
            >
              {slug ? (
                <iframe
                  ref={iframeRef}
                  src={`/preview/${slug}`}
                  className="size-full border-0"
                  title="Page preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


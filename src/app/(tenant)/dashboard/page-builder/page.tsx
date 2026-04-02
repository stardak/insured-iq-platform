"use client";

import { useEffect, useRef, useState, useTransition } from "react";
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
} from "lucide-react";

// ─── Section Labels ──────────────────────────────────────────

const SECTION_META = {
  testimonials: {
    label: "Testimonials",
    description: "Customer quotes and ratings",
    icon: Star,
  },
  faq: {
    label: "FAQ",
    description: "Frequently asked questions",
    icon: HelpCircle,
  },
  features: {
    label: "Features",
    description: "Key features with icons",
    icon: Sparkles,
  },
} as const;

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
        <div key={i} className="rounded-lg border p-3 space-y-2">
          <div className="flex items-start gap-2">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Question"
                value={item.question}
                onChange={(e) => updateItem(i, "question", e.target.value)}
              />
              <Textarea
                placeholder="Answer"
                value={item.answer}
                onChange={(e) => updateItem(i, "answer", e.target.value)}
                rows={2}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-destructive hover:text-destructive"
              onClick={() => removeItem(i)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="size-3.5" />
        Add Question
      </Button>
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
        <div key={i} className="rounded-lg border p-3 space-y-2">
          <div className="flex items-start gap-2">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Customer name"
                value={item.name}
                onChange={(e) => updateItem(i, "name", e.target.value)}
              />
              <Textarea
                placeholder="Quote / testimonial"
                value={item.quote}
                onChange={(e) => updateItem(i, "quote", e.target.value)}
                rows={2}
              />
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Rating:</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => updateItem(i, "rating", star)}
                      className="transition-colors"
                    >
                      <Star
                        className={`size-4 ${
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
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-destructive hover:text-destructive"
              onClick={() => removeItem(i)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="size-3.5" />
        Add Testimonial
      </Button>
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
        <div key={i} className="rounded-lg border p-3 space-y-2">
          <div className="flex items-start gap-2">
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Icon name (e.g. Shield)"
                  value={item.icon}
                  onChange={(e) => updateItem(i, "icon", e.target.value)}
                />
                <Input
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) => updateItem(i, "title", e.target.value)}
                />
              </div>
              <Input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(i, "description", e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-destructive hover:text-destructive"
              onClick={() => removeItem(i)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="size-3.5" />
        Add Feature
      </Button>
    </div>
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

  return (
    <Card className={!section.enabled ? "opacity-60" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {/* Reorder buttons */}
          <div className="flex flex-col gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6"
              disabled={isFirst}
              onClick={onMoveUp}
            >
              <ChevronUp className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6"
              disabled={isLast}
              onClick={onMoveDown}
            >
              <ChevronDown className="size-3.5" />
            </Button>
          </div>

          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>

          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm">{meta.label}</CardTitle>
            <CardDescription className="text-xs">
              {meta.description}
            </CardDescription>
          </div>

          <Switch checked={section.enabled} onCheckedChange={onToggle} />
        </div>
      </CardHeader>

      {section.enabled && (
        <CardContent className="pt-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mb-3 text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Collapse" : "Edit content"}
          </Button>

          {expanded && (
            <div className="mt-1">
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
          )}
        </CardContent>
      )}
    </Card>
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
  const [isUploading, setIsUploading] = useState(false);

  // Load existing config
  useEffect(() => {
    getPageConfig().then(({ data, error }) => {
      if (data) {
        setConfig(data);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Page Builder</h2>
        <p className="text-muted-foreground">
          Customise the content and layout of your public-facing customer page.
        </p>
      </div>

      {status && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
              : "border-destructive/50 bg-destructive/10 text-destructive"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          {status.message}
        </div>
      )}

      <Tabs defaultValue="hero" className="space-y-6">
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

        {/* ── Hero Tab ──────────────────────────────────── */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hero Section</CardTitle>
              <CardDescription>
                The main banner at the top of your public page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero_headline">Headline</Label>
                <Input
                  id="hero_headline"
                  placeholder="Insurance made simple"
                  value={config.hero_headline}
                  onChange={(e) =>
                    updateConfig({ hero_headline: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use the default headline.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero_subheadline">Subheadline</Label>
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

              <div className="space-y-2">
                <Label>Hero Image</Label>
                <div className="flex items-center gap-4">
                  {config.hero_image_url ? (
                    <div className="relative size-24 overflow-hidden rounded-lg border">
                      <img
                        src={config.hero_image_url}
                        alt="Hero"
                        className="size-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                        onClick={() =>
                          updateConfig({ hero_image_url: "" })
                        }
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex size-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                      <Image className="size-6 text-muted-foreground" />
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
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Upload className="size-4" />
                      )}
                      {isUploading ? "Uploading…" : "Upload Image"}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, or WebP up to 5MB. Displays as full-width background.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hero_cta_primary">Primary CTA Text</Label>
                  <Input
                    id="hero_cta_primary"
                    placeholder="View our products"
                    value={config.hero_cta_primary_text}
                    onChange={(e) =>
                      updateConfig({ hero_cta_primary_text: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero_cta_secondary">Secondary CTA Text</Label>
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

        {/* ── About Tab ─────────────────────────────────── */}
        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About Section</CardTitle>
              <CardDescription>
                A paragraph about your company shown below the products grid.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="about_text">About Text</Label>
                <Textarea
                  id="about_text"
                  placeholder="Tell your customers about your company, values, and what makes you different..."
                  value={config.about_text}
                  onChange={(e) =>
                    updateConfig({ about_text: e.target.value })
                  }
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to hide the about section on your public page.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Sections Tab ──────────────────────────────── */}
        <TabsContent value="sections" className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Page Sections</h3>
            <p className="text-xs text-muted-foreground">
              Enable, reorder, and edit the sections that appear below your products. Use the arrows to reorder.
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

      {/* Save button */}
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={isPending || !isDirty}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
        {isDirty && (
          <span className="text-sm text-muted-foreground">
            Unsaved changes
          </span>
        )}
      </div>
    </div>
  );
}

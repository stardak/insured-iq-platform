"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  brandConfigSchema,
  DEFAULT_BRAND_CONFIG,
  FONT_OPTIONS,
  type BrandConfig,
} from "@/types/brand";
import { getBrandConfig, saveBrandConfig, uploadLogo } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Mail,
  Globe,
  ShieldCheck,
  Loader2,
} from "lucide-react";

// ─── Live Preview Panel ─────────────────────────────────────

function BrandPreview({ config }: { config: BrandConfig }) {
  return (
    <Card className="sticky top-6 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Live Preview</CardTitle>
        <CardDescription>
          How your brand will appear to customers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        {/* Simulated branded header */}
        <div
          className="px-6 py-4"
          style={{ backgroundColor: config.primary_colour }}
        >
          <div className="flex items-center gap-3">
            {config.logo_url ? (
              <img
                src={config.logo_url}
                alt="Logo"
                className="size-8 rounded object-contain bg-white/20 p-0.5"
              />
            ) : (
              <div className="flex size-8 items-center justify-center rounded bg-white/20">
                <ShieldCheck className="size-4 text-white" />
              </div>
            )}
            <span
              className="font-semibold text-white"
              style={{ fontFamily: config.font }}
            >
              {config.company_name || "Your Company"}
            </span>
          </div>
        </div>

        {/* Simulated content */}
        <div className="space-y-3 px-6 pb-6">
          <div className="space-y-1">
            <h3
              className="text-lg font-bold"
              style={{
                color: config.primary_colour,
                fontFamily: config.font,
              }}
            >
              Welcome back
            </h3>
            <p
              className="text-sm text-muted-foreground"
              style={{ fontFamily: config.font }}
            >
              Manage your insurance policies in one place.
            </p>
          </div>

          <div
            className="rounded-lg px-4 py-3 text-sm font-medium text-white"
            style={{ backgroundColor: config.primary_colour }}
          >
            View My Policies
          </div>

          <div
            className="rounded-lg border px-4 py-3 text-sm font-medium"
            style={{
              borderColor: config.secondary_colour,
              color: config.secondary_colour,
            }}
          >
            Get a Quote
          </div>

          {config.support_email && (
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <Mail className="size-3" />
              <span>{config.support_email}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Colour Input ───────────────────────────────────────────

function ColourInput({
  id,
  label,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <div className="relative">
          <input
            type="color"
            id={`${id}-picker`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <div
            className="size-9 rounded-md border border-input shadow-sm"
            style={{ backgroundColor: value }}
          />
        </div>
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 font-mono"
          maxLength={7}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────

export default function BrandSettingsPage() {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<BrandConfig>({
    resolver: zodResolver(brandConfigSchema),
    defaultValues: DEFAULT_BRAND_CONFIG,
  });

  const watchedValues = watch();

  // Load existing brand config
  useEffect(() => {
    getBrandConfig().then(({ data, error }) => {
      if (data) {
        reset(data);
      }
      if (error) {
        setStatus({ type: "error", message: error });
      }
      setIsLoading(false);
    });
  }, [reset]);

  // Handle form submit
  function onSubmit(values: BrandConfig) {
    setStatus(null);
    startTransition(async () => {
      const result = await saveBrandConfig(values);
      if (result.success) {
        setStatus({ type: "success", message: "Brand settings saved!" });
        reset(values);
      } else {
        setStatus({
          type: "error",
          message: result.error ?? "Failed to save",
        });
      }
    });
  }

  // Handle logo upload
  async function handleLogoUpload(file: File) {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("logo", file);

    const result = await uploadLogo(formData);
    setIsUploading(false);

    if (result.url) {
      setValue("logo_url", result.url, { shouldDirty: true });
      setStatus({ type: "success", message: "Logo uploaded!" });
    } else {
      setStatus({
        type: "error",
        message: result.error ?? "Failed to upload logo",
      });
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
        <h2 className="text-2xl font-bold tracking-tight">Brand Settings</h2>
        <p className="text-muted-foreground">
          Customise how your brand appears to customers. Changes are reflected in
          the live preview.
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

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── Form ──────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  placeholder="Acme Insurance"
                  {...register("company_name")}
                />
                {errors.company_name && (
                  <p className="text-sm text-destructive">
                    {errors.company_name.message}
                  </p>
                )}
              </div>

              {/* Support Email */}
              <div className="space-y-2">
                <Label htmlFor="support_email">Support Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="support_email"
                    type="email"
                    placeholder="support@yourcompany.com"
                    className="pl-9"
                    {...register("support_email")}
                  />
                </div>
                {errors.support_email && (
                  <p className="text-sm text-destructive">
                    {errors.support_email.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Logo</CardTitle>
              <CardDescription>
                Upload your company logo. PNG, JPG, SVG, or WebP up to 2MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {/* Logo preview */}
                <div className="flex size-16 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                  {watchedValues.logo_url ? (
                    <img
                      src={watchedValues.logo_url}
                      alt="Logo"
                      className="size-14 rounded object-contain"
                    />
                  ) : (
                    <Globe className="size-6 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
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
                    {isUploading ? "Uploading…" : "Upload Logo"}
                  </Button>
                  {watchedValues.logo_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() =>
                        setValue("logo_url", "", { shouldDirty: true })
                      }
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>
                Choose your brand colours and typography.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <ColourInput
                  id="primary_colour"
                  label="Primary Colour"
                  value={watchedValues.primary_colour}
                  error={errors.primary_colour?.message}
                  onChange={(v) =>
                    setValue("primary_colour", v, { shouldDirty: true, shouldValidate: true })
                  }
                />
                <ColourInput
                  id="secondary_colour"
                  label="Secondary Colour"
                  value={watchedValues.secondary_colour}
                  error={errors.secondary_colour?.message}
                  onChange={(v) =>
                    setValue("secondary_colour", v, { shouldDirty: true, shouldValidate: true })
                  }
                />
              </div>

              <Separator />

              {/* Font */}
              <div className="space-y-2">
                <Label htmlFor="font">Font Family</Label>
                <Select
                  value={watchedValues.font}
                  onValueChange={(v) =>
                    setValue("font", v as BrandConfig["font"], {
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger id="font" className="w-full">
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        style={{ fontFamily: opt.value }}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending || !isDirty}>
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
        </form>

        {/* ── Live Preview ─────────────────────────────── */}
        <aside className="hidden lg:block">
          <BrandPreview config={watchedValues} />
        </aside>
      </div>
    </div>
  );
}

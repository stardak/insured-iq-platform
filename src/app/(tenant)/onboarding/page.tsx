"use client";

import { useState, useTransition, useCallback } from "react";
import { completeOnboarding, generateSlug } from "./actions";
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
  Building2,
  Globe,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function OnboardingPage() {
  const [isPending, startTransition] = useTransition();
  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompanyNameChange = useCallback(
    async (value: string) => {
      setCompanyName(value);
      if (!slugEdited && value.length > 0) {
        const generated = await generateSlug(value);
        setSlug(generated);
      }
    },
    [slugEdited]
  );

  const handleSlugChange = useCallback((value: string) => {
    setSlugEdited(true);
    // Only allow valid slug characters
    const sanitised = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 63);
    setSlug(sanitised);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("companyName", companyName);
      formData.append("slug", slug);

      const result = await completeOnboarding(formData);
      if (!result.success && result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/25">
            <Sparkles className="size-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to Insured IQ
          </h1>
          <p className="text-muted-foreground">
            Set up your company to start managing insurance products.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Form card */}
        <Card className="shadow-xl shadow-black/5">
          <CardHeader>
            <CardTitle className="text-base">Company Details</CardTitle>
            <CardDescription>
              This creates your white-label insurance tenant. You can update
              branding later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Company name */}
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="companyName"
                    placeholder="Acme Insurance"
                    value={companyName}
                    onChange={(e) => handleCompanyNameChange(e.target.value)}
                    className="pl-9"
                    required
                    minLength={2}
                    maxLength={100}
                    autoFocus
                  />
                </div>
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="slug"
                    placeholder="acme-insurance"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="pl-9 font-mono text-sm"
                    required
                    minLength={2}
                    maxLength={63}
                  />
                </div>
                {slug && (
                  <p className="text-xs text-muted-foreground">
                    Your portal will be available at{" "}
                    <span className="font-mono font-medium text-foreground">
                      {slug}.insurediq.com
                    </span>
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isPending || !companyName || !slug}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating your workspace…
                  </>
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground">
          You&apos;ll be able to customise your logo, colours, and domain in
          Brand Settings.
        </p>
      </div>
    </div>
  );
}

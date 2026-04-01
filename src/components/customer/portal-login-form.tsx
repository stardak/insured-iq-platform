"use client";

import { useSearchParams } from "next/navigation";
import { portalLogin, portalLoginWithGoogle } from "@/app/(customer)/portal/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BrandConfig } from "@/types/brand";
import Image from "next/image";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

interface PortalLoginFormProps {
  brand: BrandConfig;
  error?: string;
  tenantSlug: string;
}

export function PortalLoginForm({ brand, error, tenantSlug }: PortalLoginFormProps) {
  return (
    <Card className="w-full max-w-sm border-0 shadow-xl">
      <CardHeader className="space-y-4 text-center pb-2">
        {/* Tenant branding — no Insured IQ logo */}
        <div className="mx-auto flex items-center justify-center">
          {brand.logo_url ? (
            <Image
              src={brand.logo_url}
              alt={brand.company_name}
              width={160}
              height={48}
              className="h-12 w-auto object-contain"
            />
          ) : (
            <div
              className="flex size-14 items-center justify-center rounded-2xl text-white text-xl font-bold"
              style={{ backgroundColor: brand.primary_colour }}
            >
              {brand.company_name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <CardTitle
            className="text-xl font-semibold tracking-tight"
            style={{ color: brand.primary_colour }}
          >
            {brand.company_name}
          </CardTitle>
          <CardDescription className="mt-1">
            Sign in to view your policies
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Google OAuth */}
        <form action={portalLoginWithGoogle}>
          <Button
            type="submit"
            variant="outline"
            className="w-full h-11"
          >
            <GoogleIcon />
            Continue with Google
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              or continue with email
            </span>
          </div>
        </div>

        <form action={portalLogin} className="space-y-4">
          <input type="hidden" name="tenant" value={tenantSlug} />

          <div className="space-y-2">
            <Label htmlFor="portal-email">Email</Label>
            <Input
              id="portal-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portal-password">Password</Label>
            <Input
              id="portal-password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-white font-medium"
            style={{ backgroundColor: brand.primary_colour }}
          >
            Sign in
          </Button>
        </form>

        {brand.support_email && (
          <p className="text-center text-xs text-muted-foreground pt-2">
            Need help?{" "}
            <a
              href={`mailto:${brand.support_email}`}
              className="underline underline-offset-2 hover:opacity-80"
              style={{ color: brand.primary_colour }}
            >
              Contact support
            </a>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

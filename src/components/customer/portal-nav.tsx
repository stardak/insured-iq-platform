"use client";

import { portalSignOut } from "@/app/(customer)/portal/(authenticated)/actions";
import type { BrandConfig } from "@/types/brand";
import Image from "next/image";
import { LogOut, FileText, HelpCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PortalNavProps {
  brand: BrandConfig;
  user: {
    name: string;
    email: string;
  };
}

export function PortalNav({ brand, user }: PortalNavProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm"
      style={{ borderBottomColor: `${brand.primary_colour}15` }}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          {brand.logo_url ? (
            <Image
              src={brand.logo_url}
              alt={brand.company_name}
              width={120}
              height={36}
              className="h-9 w-auto object-contain"
            />
          ) : (
            <div className="flex items-center gap-2.5">
              <div
                className="flex size-9 items-center justify-center rounded-xl text-white text-sm font-bold"
                style={{ backgroundColor: brand.primary_colour }}
              >
                {brand.company_name.charAt(0).toUpperCase()}
              </div>
              <span className="text-lg font-semibold tracking-tight">
                {brand.company_name}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="hidden sm:flex items-center gap-1">
          <a
            href="/portal"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            style={{ color: brand.primary_colour }}
          >
            <FileText className="size-4" />
            My Policies
          </a>
          {brand.support_email && (
            <a
              href={`mailto:${brand.support_email}`}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <HelpCircle className="size-4" />
              Support
            </a>
          )}
        </nav>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-full px-2"
            >
              <div
                className="flex size-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: brand.primary_colour }}
              >
                {initials}
              </div>
              <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
                {user.name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="sm:hidden" asChild>
              <a href="/portal" className="flex items-center gap-2">
                <FileText className="size-4" />
                My Policies
              </a>
            </DropdownMenuItem>
            {brand.support_email && (
              <DropdownMenuItem className="sm:hidden" asChild>
                <a href={`mailto:${brand.support_email}`} className="flex items-center gap-2">
                  <HelpCircle className="size-4" />
                  Support
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="sm:hidden" />
            <DropdownMenuItem asChild>
              <form action={portalSignOut} className="w-full">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 text-destructive"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

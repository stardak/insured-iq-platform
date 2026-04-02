"use client";

import { useState } from "react";
import { ExternalLink, Globe, Copy, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PublicUrlCard({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="bg-primary/[0.03] border-primary/20">
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Globe className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            Your customer page is live
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">
            {url}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Copy URL
              </>
            )}
          </Button>
          <Button size="sm" className="gap-1.5" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5" />
              Open
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

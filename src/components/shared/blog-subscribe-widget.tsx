"use client";

import { useState } from "react";

interface Props {
  hostId: string;
  accentColour?: string;
}

export function BlogSubscribeWidget({ hostId, accentColour = "#4F46E5" }: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) return;
    setState("loading");

    try {
      const res = await fetch("/api/blog/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId, email, name, consent }),
      });

      if (res.ok) {
        setState("success");
      } else {
        const data = await res.json() as { error?: string };
        setErrorMsg(data.error ?? "Something went wrong.");
        setState("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div className="mb-3 text-3xl">🎉</div>
        <h3 className="text-lg font-bold text-gray-900">You&apos;re subscribed!</h3>
        <p className="mt-2 text-sm text-gray-500">
          You&apos;ll get an email whenever a new post is published.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900">Stay in the loop</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get notified when new articles are published. Unsubscribe any time.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={{ "--tw-ring-color": accentColour } as React.CSSProperties}
        />
        <input
          id="subscribe-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
        />

        <label className="flex items-start gap-2.5 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 shrink-0 rounded"
            required
          />
          I agree to receive blog updates. Unsubscribe any time.
        </label>

        {state === "error" && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={state === "loading" || !consent}
          className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          style={{ backgroundColor: accentColour }}
        >
          {state === "loading" ? "Subscribing…" : "Subscribe to updates"}
        </button>
      </form>
    </div>
  );
}

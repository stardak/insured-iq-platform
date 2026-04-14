"use client";

import { useState, useCallback, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import type { BlogPost } from "@prisma/client";
import {
  ArrowLeftIcon,
  EyeIcon,
  SparklesIcon,
  DocumentTextIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import {
  createBlogPost,
  updateBlogPost,
  publishBlogPost,
  unpublishBlogPost,
  uploadBlogCoverImage,
  type BlogPostInput,
} from "@/lib/actions/blog";

// ─── Utilities ───────────────────────────────────────────────

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function readingTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// ─── Types ───────────────────────────────────────────────────

type Mode = "new" | "edit";

interface Props {
  mode: Mode;
  post?: BlogPost | null;
  hostSlug?: string | null;
}

// ─── Colour picker ───────────────────────────────────────────

function ColourPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const PRESETS = [
    "#111827", "#374151", "#6B7280", "#EF4444", "#F97316",
    "#EAB308", "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899",
    "#FFFFFF", "#4F46E5",
  ];

  function handleOpen() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen((o) => !o);
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        title={label}
        onClick={handleOpen}
        className="flex items-center gap-1 rounded px-1.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
      >
        <span
          className="inline-block h-3 w-3 rounded-sm border border-gray-300"
          style={{ background: value }}
        />
        <span className="hidden sm:inline">{label}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[9999] rounded-lg border border-gray-200 bg-white p-2 shadow-xl"
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="grid grid-cols-6 gap-1.5 w-[120px]">
              {PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="h-4 w-4 rounded-sm border border-gray-200 transition-transform hover:scale-110"
                  style={{ background: c }}
                  onClick={() => {
                    onChange(c);
                    setOpen(false);
                  }}
                />
              ))}
            </div>
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="mt-2 w-full h-7 rounded cursor-pointer"
            />
          </div>
        </>
      )}
    </>
  );
}

// ─── Toolbar ─────────────────────────────────────────────────

function Toolbar({ editor }: { editor: Editor | null }) {
  const [textColour, setTextColour] = useState("#111827");
  const [highlightColour, setHighlightColour] = useState("#FEF08A");

  if (!editor) return null;

  const btn = (
    active: boolean,
    onClick: () => void,
    title: string,
    children: React.ReactNode
  ) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "rounded px-1.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-indigo-100 text-indigo-700"
          : "text-gray-600 hover:bg-gray-100"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-3 py-1.5">
      {/* Headings */}
      {btn(editor.isActive("heading", { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), "Heading 1", "H1")}
      {btn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "Heading 2", "H2")}
      {btn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), "Heading 3", "H3")}

      <span className="mx-1 h-4 w-px bg-gray-200" />

      {/* Inline */}
      {btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), "Bold", <strong>B</strong>)}
      {btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), "Italic", <em>I</em>)}
      {btn(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), "Underline", <u>U</u>)}
      {btn(editor.isActive("strike"), () => editor.chain().focus().toggleStrike().run(), "Strike", <s>S</s>)}

      <span className="mx-1 h-4 w-px bg-gray-200" />

      {/* Align */}
      {btn(editor.isActive({ textAlign: "left" }), () => editor.chain().focus().setTextAlign("left").run(), "Align left", "≡")}
      {btn(editor.isActive({ textAlign: "center" }), () => editor.chain().focus().setTextAlign("center").run(), "Align center", "≡̈")}
      {btn(editor.isActive({ textAlign: "right" }), () => editor.chain().focus().setTextAlign("right").run(), "Align right", "≡")}

      <span className="mx-1 h-4 w-px bg-gray-200" />

      {/* Lists */}
      {btn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), "Bullet list", "• —")}
      {btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), "Ordered list", "1.")}
      {btn(editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), "Blockquote", "❝")}

      <span className="mx-1 h-4 w-px bg-gray-200" />

      {/* Link */}
      {btn(editor.isActive("link"), () => {
        if (editor.isActive("link")) {
          editor.chain().focus().unsetLink().run();
        } else {
          const url = window.prompt("URL");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }
      }, "Link", "🔗")}

      <span className="mx-1 h-4 w-px bg-gray-200" />

      {/* Colours */}
      <ColourPicker
        value={textColour}
        label="Text"
        onChange={(c) => {
          setTextColour(c);
          editor.chain().focus().setColor(c).run();
        }}
      />
      <ColourPicker
        value={highlightColour}
        label="Highlight"
        onChange={(c) => {
          setHighlightColour(c);
          editor.chain().focus().toggleHighlight({ color: c }).run();
        }}
      />
    </div>
  );
}

// ─── SEO Panel ───────────────────────────────────────────────

function SeoPanel({
  seoTitle,
  setSeoTitle,
  seoDescription,
  setSeoDescription,
  focusKeyword,
  setFocusKeyword,
  title,
}: {
  seoTitle: string;
  setSeoTitle: (v: string) => void;
  seoDescription: string;
  setSeoDescription: (v: string) => void;
  focusKeyword: string;
  setFocusKeyword: (v: string) => void;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const previewTitle = seoTitle || title || "Page title";
  const previewDesc = seoDescription || "Meta description will appear here…";

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="flex items-center gap-2">
          <DocumentTextIcon className="h-4 w-4 text-gray-500" />
          SEO Settings
        </span>
        <span className="text-gray-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4">
          {/* Google snippet preview */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
            <p className="text-[13px] text-blue-600 font-medium truncate">{previewTitle}</p>
            <p className="text-[11px] text-green-700">insurediq.com › blog</p>
            <p className="text-[12px] text-gray-600 mt-0.5 line-clamp-2">{previewDesc}</p>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-medium text-gray-700">SEO Title</label>
              <span className={cn("text-xs", seoTitle.length < 50 || seoTitle.length > 60 ? "text-amber-500" : "text-green-600")}>
                {seoTitle.length}/60
              </span>
            </div>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="SEO optimised title…"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-medium text-gray-700">Meta Description</label>
              <span className={cn("text-xs", seoDescription.length < 150 || seoDescription.length > 160 ? "text-amber-500" : "text-green-600")}>
                {seoDescription.length}/160
              </span>
            </div>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Compelling meta description…"
              rows={3}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Focus Keyword</label>
            <input
              type="text"
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              placeholder="e.g. insurance blog"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI Assist Sidebar ────────────────────────────────────────

function AiSidebar({
  content,
  onClose,
}: {
  content: string;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<string>("");
  const [instruction, setInstruction] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const MODES = [
    { id: "expand", label: "Expand" },
    { id: "punchier", label: "Make punchier" },
    { id: "headlines", label: "Suggest headlines" },
    { id: "grammar", label: "Fix grammar" },
  ];

  async function generate() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/ai/blog-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: mode || undefined, instruction: instruction || undefined, fullContent: content }),
      });
      const data = await res.json() as { result?: string };
      setResult(data.result ?? "No result returned.");
    } catch {
      setResult("Error calling AI. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed right-0 top-0 z-50 h-full w-80 border-l border-gray-200 bg-white shadow-xl flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-4 w-4 text-indigo-600" />
          <span className="font-semibold text-sm text-gray-900">AI Assist</span>
        </div>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium text-gray-500">Quick actions</p>
          <div className="grid grid-cols-2 gap-1.5">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id === mode ? "" : m.id)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                  mode === m.id
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-700">
            Or describe what you want
          </label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. Make the intro more conversational…"
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={loading || (!mode && !instruction)}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Generating…
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4" />
              Generate
            </>
          )}
        </button>

        {result && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-xs font-medium text-gray-600">Result</p>
              <button
                type="button"
                onClick={copy}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                {copied ? (
                  <><CheckIcon className="h-3.5 w-3.5 text-green-500" /> Copied</>
                ) : (
                  <><ClipboardDocumentIcon className="h-3.5 w-3.5" /> Copy</>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Cover Image Picker ──────────────────────────────────────

interface PexelsPhoto {
  id: number;
  thumb: string;
  full: string;
  alt: string;
  credit: string;
}

function CoverImagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"pexels" | "upload" | "url">("pexels");
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [manualUrl, setManualUrl] = useState(value);
  const fileRef = useRef<HTMLInputElement>(null);

  async function searchPexels(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(`/api/pexels?query=${encodeURIComponent(query)}&per_page=15`);
      const data = await res.json() as { photos?: PexelsPhoto[]; error?: string };
      if (data.error) {
        setSearchError(data.error);
      } else {
        setPhotos(data.photos ?? []);
        if (!data.photos?.length) setSearchError("No photos found. Try a different search.");
      }
    } catch {
      setSearchError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("cover", file);
      const res = await uploadBlogCoverImage(formData);
      if (res.url) {
        onChange(res.url);
        setOpen(false);
      } else {
        setUploadError(res.error ?? "Upload failed");
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function selectPhoto(photo: PexelsPhoto) {
    onChange(photo.full);
    setOpen(false);
  }

  function applyManualUrl() {
    onChange(manualUrl);
    setOpen(false);
  }

  return (
    <div>
      {/* Preview + trigger */}
      <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
        {value ? (
          <>
            <img src={value} alt="Cover" className="h-40 w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-white"
              >
                Change image
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-32 w-full flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 18.75h19.5M3.75 6.75h.008v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span className="text-sm font-medium">Add cover image</span>
            <span className="text-xs">Search Pexels or upload your own</span>
          </button>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative z-10 flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl" style={{ maxHeight: "85vh" }}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-base font-semibold text-gray-900">Cover Image</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="size-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-5">
              {([
                { id: "pexels", label: "🔍 Pexels" },
                { id: "upload", label: "📁 Upload" },
                { id: "url",    label: "🔗 URL" },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                    tab === t.id
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Pexels */}
              {tab === "pexels" && (
                <div className="space-y-4">
                  <form onSubmit={searchPexels} className="flex gap-2">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search free photos (e.g. insurance, family, home)…"
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={searching || !query.trim()}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {searching ? "…" : "Search"}
                    </button>
                  </form>

                  {searchError && (
                    <p className="text-sm text-red-600">{searchError}</p>
                  )}

                  {photos.length > 0 && (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        {photos.map((photo) => (
                          <button
                            key={photo.id}
                            type="button"
                            onClick={() => selectPhoto(photo)}
                            className="group relative overflow-hidden rounded-lg"
                          >
                            <img
                              src={photo.thumb}
                              alt={photo.alt}
                              className="h-28 w-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                              <span className="w-full truncate px-2 pb-1.5 text-[10px] text-white/80">
                                © {photo.credit}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="text-center text-[11px] text-gray-400">
                        Photos provided by{" "}
                        <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline">
                          Pexels
                        </a>
                      </p>
                    </>
                  )}

                  {!photos.length && !searchError && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <svg className="mb-3 size-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
                      </svg>
                      <p className="text-sm">Search for free stock photos</p>
                    </div>
                  )}
                </div>
              )}

              {/* Upload */}
              {tab === "upload" && (
                <div className="space-y-4">
                  <div
                    className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 py-16 hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors cursor-pointer"
                    onClick={() => fileRef.current?.click()}
                  >
                    <svg className="size-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        {uploading ? "Uploading…" : "Click to upload"}
                      </p>
                      <p className="text-xs text-gray-400">PNG, JPG, WebP or GIF up to 8 MB</p>
                    </div>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={handleUpload}
                  />
                  {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
                </div>
              )}

              {/* URL */}
              {tab === "url" && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Image URL</label>
                    <input
                      type="url"
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {manualUrl && (
                    <img src={manualUrl} alt="Preview" className="h-40 w-full rounded-lg object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                  )}
                  <button
                    type="button"
                    onClick={applyManualUrl}
                    disabled={!manualUrl.trim()}
                    className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Use this URL
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Editor ─────────────────────────────────────────────

export function BlogEditorClient({ mode, post, hostSlug }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? "");
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(post?.seo_description ?? "");
  const [focusKeyword, setFocusKeyword] = useState(post?.focus_keyword ?? "");
  const [status, setStatus] = useState<string>(post?.status ?? "DRAFT");
  const [postId, setPostId] = useState<string | null>(post?.id ?? null);
  const [postSlug, setPostSlug] = useState<string | null>(post?.slug ?? null);
  const [aiOpen, setAiOpen] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [seoLoading, setSeoLoading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
    ],
    content: post?.content ?? "",
    editorProps: {
      attributes: {
        class:
          "min-h-[400px] px-6 py-5 focus:outline-none prose prose-lg max-w-none text-gray-800",
      },
    },
  });

  const getFormData = useCallback((): BlogPostInput => ({
    title,
    content: editor?.getHTML() ?? "",
    excerpt,
    cover_image: coverImage || undefined,
    tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    seo_title: seoTitle || undefined,
    seo_description: seoDescription || undefined,
    focus_keyword: focusKeyword || undefined,
  }), [title, editor, excerpt, coverImage, tags, seoTitle, seoDescription, focusKeyword]);

  async function handleSave() {
    setSaveMsg("Saving…");
    if (!postId) {
      const res = await createBlogPost(getFormData());
      if (res.data) {
        setPostId(res.data.id);
        setPostSlug(res.data.slug);
        setSaveMsg("Saved ✓");
        router.replace(`/dashboard/blog/${res.data.id}/edit`);
      } else {
        setSaveMsg("Error saving");
      }
    } else {
      const res = await updateBlogPost(postId, getFormData());
      if (res.data) {
        setPostSlug(res.data.slug);
        setSaveMsg("Saved ✓");
      } else {
        setSaveMsg("Error saving");
      }
    }
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function handlePreview() {
    await handleSave();
    if (postSlug && hostSlug) {
      window.open(`/${hostSlug}/blog/${postSlug}?preview=1`, "_blank");
    }
  }

  async function handlePublishToggle() {
    if (!postId) {
      await handleSave();
      return;
    }
    startTransition(async () => {
      if (status === "PUBLISHED") {
        await unpublishBlogPost(postId);
        setStatus("DRAFT");
      } else {
        // Save first, then publish
        await updateBlogPost(postId, getFormData());
        await publishBlogPost(postId);
        setStatus("PUBLISHED");
      }
    });
  }

  async function handleSeoOptimise() {
    setSeoLoading(true);
    try {
      const res = await fetch("/api/ai/blog-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: editor?.getText() ?? "" }),
      });
      const data = await res.json() as {
        seoTitle?: string;
        seoDescription?: string;
        focusKeyword?: string;
      };
      if (data.seoTitle) setSeoTitle(data.seoTitle);
      if (data.seoDescription) setSeoDescription(data.seoDescription);
      if (data.focusKeyword) setFocusKeyword(data.focusKeyword);
    } catch {
      // ignore
    } finally {
      setSeoLoading(false);
    }
  }

  const mins = readingTime(editor?.getText() ?? "");
  const isPublished = status === "PUBLISHED";

  return (
    <>
      {/* AI Sidebar */}
      {aiOpen && (
        <AiSidebar
          content={editor?.getHTML() ?? ""}
          onClose={() => setAiOpen(false)}
        />
      )}

      <div className={cn("flex flex-col min-h-screen bg-gray-50", aiOpen && "mr-80")}>
        {/* ── Sticky Top Bar ─────────────────────────────── */}
        <div className="sticky top-0 z-40 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {/* Left */}
            <button
              type="button"
              onClick={() => router.push("/dashboard/blog")}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Blog
            </button>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="truncate text-sm font-semibold text-gray-900 max-w-xs">
                {title || "Untitled post"}
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  isPublished
                    ? "bg-green-100 text-green-700"
                    : status === "ARCHIVED"
                    ? "bg-gray-100 text-gray-500"
                    : "bg-amber-100 text-amber-700"
                )}
              >
                {status}
              </span>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 ml-auto">
              {/* SEO optimise */}
              <button
                type="button"
                onClick={handleSeoOptimise}
                disabled={seoLoading}
                className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <DocumentTextIcon className="h-4 w-4" />
                {seoLoading ? "Optimising…" : "SEO Optimise"}
              </button>

              {/* AI Assist */}
              <button
                type="button"
                onClick={() => setAiOpen((o) => !o)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium",
                  aiOpen
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                )}
              >
                <SparklesIcon className="h-4 w-4" />
                AI Assist
              </button>

              {/* Save */}
              <button
                type="button"
                onClick={handleSave}
                className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {saveMsg || "Save draft"}
              </button>

              {/* Preview (only once we have a post ID) */}
              {postId && hostSlug && (
                <button
                  type="button"
                  onClick={handlePreview}
                  className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <EyeIcon className="h-4 w-4" />
                  Preview
                </button>
              )}

              {/* Publish / Unpublish */}
              <button
                type="button"
                onClick={handlePublishToggle}
                disabled={isPending}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60",
                  isPublished
                    ? "bg-gray-600 hover:bg-gray-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                )}
              >
                {isPending ? "…" : isPublished ? "Unpublish" : "Publish"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Editor Body ─────────────────────────────────── */}
        <div className="mx-auto w-full max-w-3xl px-4 py-8 space-y-6">

          {/* Cover image */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Cover Image
            </label>
            <CoverImagePicker
              value={coverImage}
              onChange={setCoverImage}
            />
          </div>

          {/* Title */}
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title…"
            rows={2}
            className="w-full resize-none border-0 bg-transparent text-4xl font-bold text-gray-900 placeholder-gray-300 focus:outline-none"
          />

          {/* Excerpt */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Short Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A compelling one-sentence summary of this post…"
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Rich text editor */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
            <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
              {mins} min read · {editor?.storage?.characterCount?.words?.() ?? 0} words
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Tags <span className="font-normal text-gray-400">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="insurance, health, tips"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* SEO Panel */}
          <SeoPanel
            seoTitle={seoTitle}
            setSeoTitle={setSeoTitle}
            seoDescription={seoDescription}
            setSeoDescription={setSeoDescription}
            focusKeyword={focusKeyword}
            setFocusKeyword={setFocusKeyword}
            title={title}
          />
        </div>
      </div>

      <style>{`
        .ProseMirror h1 { font-size: 2rem; font-weight: 800; margin: 1.5rem 0 0.75rem; }
        .ProseMirror h2 { font-size: 1.55rem; font-weight: 700; margin: 1.25rem 0 0.5rem; }
        .ProseMirror h3 { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .ProseMirror blockquote { border-left: 3px solid #4F46E5; background: #f9fafb; padding: 0.75rem 1rem; margin: 1rem 0; border-radius: 0 6px 6px 0; color: #374151; }
        .ProseMirror p { margin: 0.75rem 0; }
        .ProseMirror a { color: #4F46E5; text-decoration: underline; }
        .ProseMirror code { background: #1e1e2e; color: #cdd6f4; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.875em; }
        .ProseMirror pre { background: #1e1e2e; color: #cdd6f4; padding: 1rem; border-radius: 8px; margin: 1rem 0; overflow-x: auto; }
        .ProseMirror ul { list-style: disc; padding-left: 1.5rem; margin: 0.75rem 0; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.5rem; margin: 0.75rem 0; }
      `}</style>
    </>
  );
}

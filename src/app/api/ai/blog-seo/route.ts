import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { title?: string; content?: string };
    const { title, content } = body;

    if (!title && !content) {
      return NextResponse.json(
        { error: "title or content is required", code: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          seoTitle: title ? title.slice(0, 60) : "Add your SEO title",
          seoDescription: "Add your meta description (150–160 chars).",
          focusKeyword: "",
          readabilityTip: "OpenAI key not configured — add OPENAI_API_KEY to enable AI suggestions.",
          altTextSuggestion: "Descriptive alt text for your cover image",
        },
        { status: 200 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const prompt = `You are an SEO expert. Given a blog post title and content excerpt, return ONLY a JSON object (no markdown, no code block) with these fields:
- seoTitle: string (50–60 chars, compelling, includes main keyword)
- seoDescription: string (150–160 chars, includes keyword, clear value proposition)
- focusKeyword: string (the primary keyword to target)
- readabilityTip: string (one concise tip to improve readability)
- altTextSuggestion: string (suggested alt text for the cover image)

Title: ${title ?? ""}
Content excerpt: ${(content ?? "").slice(0, 800)}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(raw) as Record<string, string>;
    } catch {
      parsed = {
        seoTitle: title?.slice(0, 60) ?? "",
        seoDescription: "",
        focusKeyword: "",
        readabilityTip: raw,
        altTextSuggestion: "",
      };
    }

    return NextResponse.json(parsed);
  } catch (e) {
    console.error("[ai/blog-seo]", e);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

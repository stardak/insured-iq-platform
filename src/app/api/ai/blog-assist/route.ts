import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const MODES: Record<string, string> = {
  expand: "Expand this content to be more detailed and informative, adding relevant examples and depth. Keep the same tone.",
  punchier: "Rewrite this content to be punchier, more engaging, and concise. Cut filler words. Make every sentence count.",
  headlines: "Suggest 5 compelling blog post headline variations for this content. Return as a numbered list.",
  grammar: "Fix any grammar, spelling, and clarity issues in this content. Return the corrected text only.",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      mode?: string;
      instruction?: string;
      fullContent?: string;
    };
    const { mode, instruction, fullContent } = body;

    if (!fullContent) {
      return NextResponse.json(
        { error: "fullContent is required", code: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { result: "AI assistance requires an OpenAI API key. Add OPENAI_API_KEY to your environment variables." },
        { status: 200 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const systemInstruction = mode && MODES[mode]
      ? MODES[mode]
      : (instruction ?? "Improve this content as a professional editor.");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional blog editor. Return only the requested output, no preamble.",
        },
        {
          role: "user",
          content: `${systemInstruction}\n\nContent:\n${fullContent.slice(0, 3000)}`,
        },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const result = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ result });
  } catch (e) {
    console.error("[ai/blog-assist]", e);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

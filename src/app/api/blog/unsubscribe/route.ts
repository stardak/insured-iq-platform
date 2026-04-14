import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse(unsubscribePage("Invalid link", "This unsubscribe link is not valid."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const subscriber = await prisma.blogSubscriber.findUnique({
      where: { unsubscribe_token: token },
    });

    if (!subscriber) {
      return new NextResponse(unsubscribePage("Invalid link", "This unsubscribe link is not valid or has already been used."), {
        status: 404,
        headers: { "Content-Type": "text/html" },
      });
    }

    await prisma.blogSubscriber.update({
      where: { id: subscriber.id },
      data: { subscribed: false },
    });

    return new NextResponse(
      unsubscribePage("Unsubscribed", `You've been successfully unsubscribed. You won't receive any more blog updates.`),
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch (e) {
    console.error("[blog/unsubscribe]", e);
    return new NextResponse(unsubscribePage("Error", "Something went wrong. Please try again later."), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
}

function unsubscribePage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #f9fafb; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: #fff; border-radius: 12px; padding: 48px 40px; max-width: 440px; width: 100%; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06); }
    .icon { font-size: 40px; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 12px; }
    p { font-size: 15px; color: #6b7280; line-height: 1.6; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${title === "Unsubscribed" ? "✓" : "⚠️"}</div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}

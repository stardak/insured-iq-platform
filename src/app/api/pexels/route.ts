import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  const page = request.nextUrl.searchParams.get("page") ?? "1";
  const perPage = request.nextUrl.searchParams.get("per_page") ?? "15";

  if (!query?.trim()) {
    return NextResponse.json({ photos: [] });
  }

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "PEXELS_API_KEY is not configured." },
      { status: 503 }
    );
  }

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`;

  const res = await fetch(url, {
    headers: { Authorization: apiKey },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Pexels request failed" },
      { status: res.status }
    );
  }

  const data = await res.json() as {
    photos: Array<{
      id: number;
      src: { medium: string; large2x: string };
      alt: string;
      photographer: string;
    }>;
    total_results: number;
  };

  return NextResponse.json({
    photos: data.photos.map((p) => ({
      id: p.id,
      thumb: p.src.medium,
      full: p.src.large2x,
      alt: p.alt,
      credit: p.photographer,
    })),
    total: data.total_results,
  });
}

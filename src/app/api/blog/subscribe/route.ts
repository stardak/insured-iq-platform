import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      hostId?: string;
      email?: string;
      name?: string;
      consent?: boolean;
    };

    const { hostId, email, name, consent } = body;

    if (!consent) {
      return NextResponse.json(
        { error: "Consent is required", code: "CONSENT_REQUIRED" },
        { status: 400 }
      );
    }

    if (!hostId || !email) {
      return NextResponse.json(
        { error: "hostId and email are required", code: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: hostId },
      select: { id: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found", code: "TENANT_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Upsert subscriber (re-subscribe if previously unsubscribed)
    await prisma.blogSubscriber.upsert({
      where: { tenant_id_email: { tenant_id: hostId, email } },
      create: {
        tenant_id: hostId,
        email,
        name: name ?? null,
        subscribed: true,
        source: "widget",
      },
      update: {
        subscribed: true,
        name: name ?? undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[blog/subscribe]", e);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

import { generatePropertyPoster } from "@/app/actions/ai";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { propertyId?: string };
    if (!body.propertyId?.trim()) {
      return NextResponse.json({ error: "propertyId is required." }, { status: 400 });
    }

    const result = await generatePropertyPoster(body.propertyId.trim());

    if (result.code === "UPGRADE") {
      return NextResponse.json(result, { status: 402 });
    }
    if (result.code === "UNAUTHORIZED") {
      return NextResponse.json(result, { status: 401 });
    }
    if (result.error) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

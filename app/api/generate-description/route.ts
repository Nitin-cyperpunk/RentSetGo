import { NextResponse } from "next/server";

import { generateListingDescription } from "@/app/actions/ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fd = new FormData();
    for (const [key, value] of Object.entries(body)) {
      if (Array.isArray(value)) {
        for (const v of value) fd.append(key, String(v));
      } else if (value != null) {
        fd.set(key, String(value));
      }
    }
    const result = await generateListingDescription(fd);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

import { timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseProducten } from "@/lib/producten";

const REQUIRED_STRING_FIELDS = [
  "naam",
  "email",
  "telefoonnummer",
  "adres",
  "bezorgmethode",
  "betaalmethode",
] as const;

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.N8N_ORDERS_WEBHOOK_SECRET;
  if (!expected) return false;

  const provided = request.headers.get("x-webhook-secret") ?? "";
  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(provided);

  return (
    expectedBuf.length === providedBuf.length &&
    timingSafeEqual(expectedBuf, providedBuf)
  );
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof body[field] !== "string" || body[field].trim() === "") {
      return NextResponse.json(
        { error: `Missing or invalid field: ${field}` },
        { status: 400 }
      );
    }
  }

  let producten;
  try {
    producten = parseProducten(body.producten);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid producten" },
      { status: 400 }
    );
  }

  let totaalprijs = 0;
  if (body.totaalprijs !== undefined) {
    const value = Number(body.totaalprijs);
    if (!Number.isFinite(value) || value < 0) {
      return NextResponse.json(
        { error: "totaalprijs must be a non-negative number" },
        { status: 400 }
      );
    }
    totaalprijs = value;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      naam: body.naam,
      email: body.email,
      telefoonnummer: body.telefoonnummer,
      adres: body.adres,
      producten,
      bezorgmethode: body.bezorgmethode,
      betaalmethode: body.betaalmethode,
      totaalprijs,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to insert order:", error.message);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }

  return NextResponse.json({ order: data }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { getProductByCode } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim();

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const product = await getProductByCode(code);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

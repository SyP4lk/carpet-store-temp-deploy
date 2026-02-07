import { NextResponse } from "next/server";
import { getProductByCode } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = (url.searchParams.get("code") ?? "").trim();

  if (!code || code.length > 64) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const product = await getProductByCode(code);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

import { type NextRequest, NextResponse } from "next/server";
import { localeMiddleware } from "./lib/middleware/localeMiddleware";

export async function middleware(req: NextRequest) {
  const localeResponse = await localeMiddleware(req);
  if (localeResponse) return localeResponse
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static (public static files)
     * - Files with extensions (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|static|.*\\.).*)',
  ],
};
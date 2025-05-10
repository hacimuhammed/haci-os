import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "./lib/auth";

export async function middleware(request: NextRequest) {
  // const session = await auth.api.getSession({
  //   headers: request.headers,
  // });

  // /os yoluna erişim kontrolü
  // if (request.nextUrl.pathname.startsWith("/os")) {
  //   if (!session) {
  //     return NextResponse.redirect(new URL("/auth", request.url));
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/os/:path*"],
};

import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, isAuthed } from "./lib/auth";

export function proxy(req: NextRequest) {
  if (isAuthed(req.cookies.get(COOKIE)?.value)) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/api/"))
    return new NextResponse("Unauthorized", { status: 401 });
  return NextResponse.redirect(new URL("/login", req.url));
}

// everything except the login page/endpoint and Next internals
export const config = {
  matcher: ["/((?!login|api/login|_next|favicon.ico).*)"],
};

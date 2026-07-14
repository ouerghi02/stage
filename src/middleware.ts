// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ADMIN_ROLE = "admin"; // garde en phase avec src/lib/rbac.ts
const ADMIN_ONLY_PATHS = ["/form", "/categorie", "/api/submissions", "/api/stats"];

export default withAuth(
  function middleware(req) {
    const isAdminPath = ADMIN_ONLY_PATHS.some((path) => req.nextUrl.pathname.startsWith(path));
    const roles = (req.nextauth?.token?.roles as string[] | undefined) ?? [];

    if (isAdminPath && !roles.includes(ADMIN_ROLE)) {
      if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/form", "/submit", "/categorie", "/api/submit", "/api/submissions", "/api/stats"],
};
/* // src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ADMIN_ROLE = "admin"; // ajuste ici si le nom réel est différent
const ADMIN_ONLY_PATHS = ["/form", "/categorie", "/api/submissions"];

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
};*/
// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/api/auth/signin",
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/",           // Page d'accueil
    "/form",       // Formulaire
    "/submit",     // Page de soumission (si elle existe)
    "/api/submit", // API soumission
    "/api/stats",  // API statistiques
    "/api/submissions", // API liste des soumissions
  ],
};

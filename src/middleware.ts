export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/form", "/submit", "/api/submit", "/api/submissions"],
};

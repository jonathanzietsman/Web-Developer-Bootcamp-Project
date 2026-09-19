// src/middleware.ts
export { auth as default } from "~/server/auth";

export const config = {
  matcher: [
    "/",
    "/pos/:path*",
    "/cash/:path*",
    "/products/:path*",
  ],
};
import NextAuth from "next-auth";
import { authConfig } from "~/server/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/",
    "/pos/:path*",
    "/cash/:path*",
    "/products/:path*",
  ],
};
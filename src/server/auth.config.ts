// src/server/auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [
    // Keep provider definitions here, but DO NOT import Prisma or adapters
  ],
  pages: {
    // signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl: _nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
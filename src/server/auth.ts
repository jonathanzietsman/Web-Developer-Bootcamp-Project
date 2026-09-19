// src/server/auth.ts
import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/server/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: "Developer Access",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "developer" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = typeof credentials?.username === "string" ? credentials.username.trim() : "";
        const password = typeof credentials?.password === "string" ? credentials.password.trim() : "";

        if (username === "developer" && password === "dev123") {
          const devUser = await db.user.upsert({
            where: { email: "developer@apexpos.local" },
            update: { name: "Lead Developer" },
            create: {
              id: "developer-user-1",
              name: "Lead Developer",
              email: "developer@apexpos.local",
            },
          });

          return {
            id: devUser.id,
            name: devUser.name,
            email: devUser.email,
          };
        }
        return null;
      },
    }),
  ],
});

export const getServerAuthSession = () => auth();
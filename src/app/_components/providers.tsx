// src/app/_components/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "~/trpc/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <TRPCReactProvider>{children}</TRPCReactProvider>
    </SessionProvider>
  );
}
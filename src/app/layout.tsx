// src/app/layout.tsx
import "~/styles/globals.css";
import { GeistSans } from 'geist/font/sans';
import { type Metadata } from 'next';
import { Providers } from "~/app/_components/providers";
import { Navbar } from "~/app/_components/navbar";
import GlobalActivityTracker from './_components/GlobalActivityTracker';

export const metadata: Metadata = {
  title: 'ApexPOS - Enterprise Tactical Terminal',
  description: 'Next-generation T3 Stack Point of Sale System',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} dark`}>
      <body className="bg-slate-950 text-slate-100 min-h-screen selection:bg-cyan-500 selection:text-slate-950 font-mono">
        <Providers>
          {/* Global Listener Active Across Entire App */}
          <GlobalActivityTracker />
          
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
// src/app/_components/navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { 
  ShoppingCart, 
  Package, 
  DollarSign, 
  BarChart3,
  Database, 
  LogOut, 
  Zap,
  Terminal,
  Activity,
  Tag,
  Menu,
  X
} from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isAuthenticated = status === "authenticated";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer automatically on path change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Command", icon: Zap },
    { href: "/pos", label: "POS", icon: ShoppingCart },
    { href: "/inventory", label: "Inventory", icon: Package },
    { href: "/manager/promotions", label: "Promotions", icon: Tag },
    { href: "/cash", label: "Cash Drawer", icon: DollarSign },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/database", label: "Database", icon: Database },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/30 bg-slate-950/95 backdrop-blur-2xl font-mono shadow-[0_10px_30px_rgba(0,0,0,0.9)]">
      <div className="flex w-full items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
        
        {/* Left: Brand & Desktop Navigation */}
        <div className="flex items-center gap-6 lg:gap-10">
          <Link href="/" className="flex items-center gap-3 text-cyan-400 font-bold tracking-wider text-base group">
            <span className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-cyan-400/60 bg-cyan-950/70 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:border-cyan-300 group-hover:scale-105 transition-all">
              <Zap className="h-5 w-5 animate-pulse text-cyan-300" />
            </span>
            <div className="flex flex-col">
              <span className="text-white tracking-widest font-black text-sm">APEX_OS</span>
              <span className="text-[10px] text-cyan-400/80 tracking-widest font-mono">CORE // 2.4</span>
            </div>
          </Link>

          {/* Desktop Navigation Links (xl screens) */}
          {isAuthenticated && (
            <nav className="hidden xl:flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 p-1.5 rounded-2xl shadow-inner">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                      isActive
                        ? "border border-cyan-500/60 bg-cyan-500/25 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                        : "text-slate-400 hover:bg-slate-800/80 hover:text-white border border-transparent"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-cyan-300" : "text-slate-500"}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right: Status, Credentials & Mobile Toggle */}
        <div className="flex items-center gap-3 sm:gap-6">
          
          {/* Tactical Status Pill */}
          <div className="hidden lg:flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3.5 py-1.5 text-xs text-emerald-400 font-semibold shadow-inner">
            <Activity className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
            <span className="tracking-wider text-[11px]">SECURE RELAY</span>
          </div>

          {status === "loading" ? (
            <div className="h-10 w-28 sm:w-36 animate-pulse rounded-xl bg-slate-900 border border-slate-800" />
          ) : isAuthenticated && session?.user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2.5 rounded-xl border border-cyan-500/30 bg-slate-900/90 py-1 pl-1.5 pr-3 shadow-md">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? "User"}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-lg object-cover border border-cyan-500/50 shadow-sm"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/50 text-xs font-bold shadow-sm">
                    {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-extrabold leading-tight text-cyan-200">
                    {session.user.name ?? "Operator"}
                  </p>
                  <p className="text-[10px] text-slate-400 tracking-wider font-semibold">AUTHORIZED</p>
                </div>
              </div>

              <button
                onClick={() => void signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/15 p-2 sm:px-3.5 sm:py-2 text-xs font-extrabold text-rose-300 transition hover:bg-rose-500/25 hover:border-rose-400 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                title="Disconnect Session"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">DISCONNECT</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => void signIn()}
              className="flex items-center gap-2 rounded-xl border border-cyan-500/60 bg-cyan-500/25 px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-extrabold text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition hover:bg-cyan-500/35 cursor-pointer"
            >
              <Terminal className="h-4 w-4" />
              <span>AUTHENTICATE</span>
            </button>
          )}

          {/* Mobile Menu Hamburger Button (< xl screens) */}
          {isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex xl:hidden items-center justify-center p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-slate-950/98 px-4 py-4 backdrop-blur-3xl space-y-1.5 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition ${
                  isActive
                    ? "border border-cyan-500/60 bg-cyan-500/20 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-cyan-300" : "text-slate-500"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
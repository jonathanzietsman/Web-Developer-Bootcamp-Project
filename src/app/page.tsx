// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getStoredLogs,
  pushTelemetry,
  clearTelemetry,
  type TelemetryLog,
} from "@/utils/telemetry";
import {
  Terminal,
  Activity,
  Home,
  Layers,
  BarChart3,
  Database,
  X,
  ChevronRight,
  RefreshCw,
  ShoppingCart,
  DollarSign,
  Package,
  ShieldAlert,
  Zap,
  Lock,
  ArrowUpRight,
  Radio,
  Cpu,
  Trash2,
  Filter,
  ArrowUpDown,
  Globe,
  MousePointer,
  Server,
  Tag,
  UserPlus,
  LogIn,
} from "lucide-react";

function getRelativeTime(timestampInput: string) {
  const now = new Date().getTime();
  const then = new Date(timestampInput).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (isNaN(seconds) || seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function HomePage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { data: session, status } = useSession();

  // Auth form states
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: cashSummary,
    isLoading: cashLoading,
    refetch: refetchCash,
  } = api.cashLog.getSummary.useQuery(undefined, {
    enabled: !!session,
  });
  const {
    data: products,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = api.product.getAll.useQuery(undefined, {
    enabled: !!session,
  });
  const { data: promotions } = api.promotion.getAll.useQuery(undefined, {
    enabled: !!session,
  });

  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const initialLogs = getStoredLogs();
    if (initialLogs.length === 0) {
      pushTelemetry("SYS", "Quantum-secure ledger core initialized.");
      pushTelemetry(
        "SYS",
        "Node authentication verified via JWT/Credentials provider.",
      );
      pushTelemetry(
        "SYS",
        "PostgreSQL instance connected via Supabase prisma pool.",
      );
    }
    setLogs(getStoredLogs());

    const handleUpdate = () => {
      setLogs(getStoredLogs());
    };

    window.addEventListener("apex_telemetry_update", handleUpdate);
    return () =>
      window.removeEventListener("apex_telemetry_update", handleUpdate);
  }, []);

  const handleGlobalSync = async () => {
    setIsSyncing(true);
    pushTelemetry(
      "API",
      "Manual telemetry ping & registry synchronization initiated...",
    );
    await Promise.all([refetchCash(), refetchProducts()]);
    setTimeout(() => {
      setIsSyncing(false);
      pushTelemetry(
        "API",
        "Neural link refreshed. All sector nodes successfully verified.",
      );
    }, 600);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setIsSubmitting(true);

    if (authMode === "register") {
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = (await res.json()) as { message?: string };

        if (!res.ok) {
          setAuthError(data.message ?? "Registration failed.");
          setIsSubmitting(false);
          return;
        }

        setAuthSuccess("Account created successfully! Signing in...");
        pushTelemetry(
          "SYS",
          `New user registered [${email}]. Authenticating...`,
        );

        const signInRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInRes?.error) {
          setAuthError(
            "Account created, but sign in failed. Please log in manually.",
          );
        }
      } catch {
        setAuthError("An unexpected error occurred during registration.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      pushTelemetry("SYS", `Attempting credentials sign in for [${email}]...`);
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      setIsSubmitting(false);

      if (signInRes?.error) {
        setAuthError("Invalid email or password.");
      } else {
        pushTelemetry("SYS", "Authentication successful.");
      }
    }
  };

  const totalProducts = products?.length ?? 0;
  const lowStockCount = products?.filter((p) => p.stockQty < 5).length ?? 0;
  const totalValuation =
    products?.reduce((acc, p) => acc + p.price * p.stockQty, 0) ?? 0;
  const totalPromotions = promotions?.length ?? 0;

  const filteredLogs = logs
    .filter((l) => filterType === "ALL" || l.type === filterType)
    .sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      const validTimeA = isNaN(timeA) ? 0 : timeA;
      const validTimeB = isNaN(timeB) ? 0 : timeB;
      return sortOrder === "latest"
        ? validTimeB - validTimeA
        : validTimeA - validTimeB;
    });

  if (status === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center bg-slate-950 font-mono text-cyan-400">
        <div className="flex animate-pulse items-center gap-3 rounded-2xl border border-cyan-500/30 bg-slate-900/80 px-6 py-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <Cpu className="h-5 w-5 animate-spin text-cyan-400" />
          <span className="text-xs font-bold tracking-widest">
            ESTABLISHING SECURE HANDSHAKE...
          </span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="relative flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center bg-slate-950 p-4 font-mono text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]"></div>

        <div className="relative w-full max-w-md space-y-6 rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-8 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/60 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Lock className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">
              APEX_OS // AUTH GATEWAY
            </h1>
            <p className="mt-1.5 text-xs text-slate-400">
              Enter operator credentials to initiate command session.
            </p>
          </div>

          <div className="flex rounded-xl border border-slate-800 bg-slate-950/60 p-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setAuthError("");
                setAuthSuccess("");
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                authMode === "login"
                  ? "border border-cyan-500/50 bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setAuthError("");
                setAuthSuccess("");
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                authMode === "register"
                  ? "border border-cyan-500/50 bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              REGISTER
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
            {authMode === "register" && (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Operator Name"
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@apexpos.com"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {authError && (
              <p className="pt-1 text-xs font-semibold text-rose-400">
                {authError}
              </p>
            )}
            {authSuccess && (
              <p className="pt-1 text-xs font-semibold text-emerald-400">
                {authSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-500/60 bg-cyan-500/25 py-3 text-xs font-bold text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition hover:bg-cyan-500/35 disabled:opacity-50"
            >
              {authMode === "login" ? (
                <LogIn className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {isSubmitting
                ? "PROCESSING..."
                : authMode === "login"
                  ? "AUTHENTICATE"
                  : "CREATE ACCOUNT"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 font-mono text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      
      {/* TOP COMMAND SUB-HEADER */}
      <header className="sticky top-16 z-20 flex shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 py-3.5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsNavOpen(true)}
            className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 shadow-sm transition hover:border-cyan-400 hover:bg-cyan-900/50"
            title="Open System Drawer"
          >
            <Terminal className="h-4 w-4 transition-transform group-hover:scale-110" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="flex items-center gap-2 text-xs sm:text-sm font-bold tracking-wider text-white uppercase">
                <Cpu className="h-4 w-4 text-cyan-400" />
                ApexOS Command Matrix
              </h1>
              <span className="hidden sm:flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></span>
                ACTIVE LINK
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
            <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
            <span>PostgreSQL Pool Ready</span>
          </div>
          <button
            onClick={handleGlobalSync}
            disabled={isSyncing}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/50 px-3.5 py-1.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-900/60 disabled:opacity-50 shadow-inner"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-cyan-400 ${isSyncing ? "animate-spin" : ""}`}
            />
            <span>{isSyncing ? "SYNCING..." : "SYNC NODES"}</span>
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT BODY */}
      <main className="mx-auto flex w-full max-w-[1700px] flex-1 flex-col space-y-6 p-4 sm:p-6 lg:p-8">
        
        {/* Quick Action Navigation Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Link
            href="/pos"
            onClick={() =>
              pushTelemetry("NAV", "Navigated to POS Terminal (/pos)")
            }
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg backdrop-blur-xl transition hover:border-cyan-500/50 hover:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/60 text-cyan-400">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-400" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold tracking-wider text-white uppercase">
                POS Terminal
              </div>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Execute sales & checkout cart items
              </p>
            </div>
          </Link>

          <Link
            href="/inventory"
            onClick={() =>
              pushTelemetry("NAV", "Navigated to Inventory Matrix (/inventory)")
            }
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg backdrop-blur-xl transition hover:border-cyan-500/50 hover:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/60 text-cyan-400">
                <Package className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-400" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold tracking-wider text-white uppercase">
                Inventory Matrix
              </div>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Manage SKUs and stock levels
              </p>
            </div>
          </Link>

          <Link
            href="/manager/promotions"
            onClick={() =>
              pushTelemetry(
                "NAV",
                "Navigated to Promotions Manager (/manager/promotions)",
              )
            }
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg backdrop-blur-xl transition hover:border-cyan-500/50 hover:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/60 text-cyan-400">
                <Tag className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-400" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold tracking-wider text-white uppercase">
                Promotions Engine
              </div>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Configure discounts & bundles
              </p>
            </div>
          </Link>

          <Link
            href="/cash"
            onClick={() =>
              pushTelemetry("NAV", "Navigated to Cash Drawer (/cash)")
            }
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg backdrop-blur-xl transition hover:border-cyan-500/50 hover:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/60 text-cyan-400">
                <DollarSign className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-400" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold tracking-wider text-white uppercase">
                Cash Drawer
              </div>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Till audits & float adjustments
              </p>
            </div>
          </Link>

          <Link
            href="/database"
            onClick={() =>
              pushTelemetry("NAV", "Navigated to Database Nodes (/database)")
            }
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg backdrop-blur-xl transition hover:border-cyan-500/50 hover:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/60 text-cyan-400">
                <Database className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-400" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold tracking-wider text-white uppercase">
                Database Nodes
              </div>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Inspect Supabase status
              </p>
            </div>
          </Link>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Till Liquidity</span>
              <DollarSign className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-white">
              {cashLoading
                ? "..."
                : `R${(cashSummary?.balance ?? 0).toFixed(2)}`}
            </p>
            <p className="text-[10px] text-slate-500 font-bold">
              In: +R{(cashSummary?.totalIn ?? 0).toFixed(2)} | Out: -R
              {(cashSummary?.totalOut ?? 0).toFixed(2)}
            </p>
          </div>

          <div className="space-y-1.5 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Asset Valuation</span>
              <Zap className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-white">
              {productsLoading ? "..." : `R${totalValuation.toFixed(2)}`}
            </p>
            <p className="text-[10px] text-slate-500 font-bold">
              Calculated across {totalProducts} indexed SKUs
            </p>
          </div>

          <div className="space-y-1.5 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Active Promotions</span>
              <Tag className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-white">{totalPromotions}</p>
            <p className="text-[10px] text-slate-500 font-bold">
              Bundle rules active in register
            </p>
          </div>

          <div className="space-y-1.5 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Stock Anomalies</span>
              <ShieldAlert className="h-4 w-4 text-rose-400" />
            </div>
            <p
              className={`text-2xl font-black ${lowStockCount > 0 ? "text-rose-400" : "text-emerald-400"}`}
            >
              {productsLoading ? "..." : lowStockCount}
            </p>
            <p className="text-[10px] text-slate-500 font-bold">
              {lowStockCount > 0
                ? "Low stock threshold reached"
                : "All SKUs within safe margins"}
            </p>
          </div>
        </div>

        {/* Lower Section: Telemetry & Inventory Split */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Telemetry Log Feed */}
          <div className="flex flex-col h-[500px] rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl lg:col-span-1">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-white uppercase">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <span>Neural Telemetry</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => clearTelemetry()}
                  title="Clear Telemetry Log Buffer"
                  className="cursor-pointer p-1 text-slate-500 transition hover:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <Activity className="h-4 w-4 animate-pulse text-emerald-400" />
              </div>
            </div>

            <div className="my-2.5 flex shrink-0 items-center justify-between gap-2 overflow-x-auto pb-1 text-[10px] font-bold">
              <div className="flex items-center gap-1">
                <Filter className="h-3 w-3 shrink-0 text-slate-500" />
                {["ALL", "NAV", "CLICK", "API", "SYS"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`cursor-pointer rounded-lg border px-2 py-0.5 transition ${
                      filterType === type
                        ? "border-cyan-500/60 bg-cyan-500/20 text-cyan-200"
                        : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  setSortOrder((prev) =>
                    prev === "latest" ? "oldest" : "latest",
                  )
                }
                className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-0.5 text-slate-300 transition hover:text-white"
              >
                <ArrowUpDown className="h-3 w-3 text-cyan-400" />
                <span>{sortOrder === "latest" ? "LATEST" : "OLDEST"}</span>
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-1 text-xs text-slate-300 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const badgeColor =
                    log.type === "NAV"
                      ? "text-purple-400 border-purple-500/30 bg-purple-950/30"
                      : log.type === "CLICK"
                        ? "text-emerald-400 border-emerald-500/30 bg-emerald-950/30"
                        : log.type === "API"
                          ? "text-blue-400 border-blue-500/30 bg-blue-950/30"
                          : "text-cyan-400 border-cyan-500/30 bg-cyan-950/30";

                  const LogIcon =
                    log.type === "NAV"
                      ? Globe
                      : log.type === "CLICK"
                        ? MousePointer
                        : log.type === "API"
                          ? Activity
                          : Server;

                  return (
                    <div
                      key={log.id}
                      className="flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 shadow-inner"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 ${badgeColor}`}
                        >
                          <LogIcon className="h-2.5 w-2.5" />
                          {log.type}
                        </span>
                        <span className="text-slate-500 font-semibold">
                          {getRelativeTime(log.timestamp)}
                        </span>
                      </div>
                      <span className="text-xs break-all text-slate-300 mt-1 font-mono">
                        {log.message}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  No telemetry signals matching criteria.
                </div>
              )}
            </div>

            <div className="mt-3 flex shrink-0 items-center justify-between border-t border-slate-800 pt-2.5 text-[10px] font-bold text-slate-500 uppercase">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                SESSION ACTIVE
              </span>
              <span>LOGS: {logs.length}</span>
            </div>
          </div>

          {/* Sub-Matrix Inventory Overview */}
          <div className="flex flex-col h-[500px] rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl lg:col-span-2">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <h2 className="text-xs font-bold tracking-wider text-white uppercase">
                  Live Inventory Sub-Matrix
                </h2>
              </div>
              <Link
                href="/inventory"
                onClick={() =>
                  pushTelemetry(
                    "NAV",
                    "Redirected to full Inventory Matrix from homepage",
                  )
                }
                className="text-xs font-bold text-cyan-400 transition hover:text-cyan-300"
              >
                View Full Matrix &rarr;
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900 text-[10px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="px-3 pb-3">Product Name</th>
                    <th className="px-3 pb-3">SKU</th>
                    <th className="px-3 pb-3">Unit Price</th>
                    <th className="px-3 pb-3">Stock Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {productsLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-12 text-center text-xs text-cyan-400 font-semibold"
                      >
                        Querying database records...
                      </td>
                    </tr>
                  ) : products && products.length > 0 ? (
                    products.map((product) => (
                      <tr
                        key={product.id}
                        onClick={() =>
                          pushTelemetry(
                            "CLICK",
                            `Inspected asset node [SKU: ${product.sku}] - ${product.name}`,
                          )
                        }
                        className="cursor-pointer transition hover:bg-slate-800/50"
                      >
                        <td className="px-3 py-3 font-bold text-white">
                          {product.name}
                        </td>
                        <td className="px-3 py-3 font-mono text-cyan-400">
                          {product.sku}
                        </td>
                        <td className="px-3 py-3 font-semibold text-slate-200">
                          R{product.price.toFixed(2)}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                              product.stockQty < 5
                                ? "border-rose-500/30 bg-rose-950/30 text-rose-400"
                                : "border-emerald-500/30 bg-emerald-950/30 text-emerald-400"
                            }`}
                          >
                            {product.stockQty} UNITS
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-12 text-center text-xs text-slate-500"
                      >
                        No active stock entries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* QUICK SYSTEM NAVIGATION DRAWER */}
      <AnimatePresence mode="wait">
        {isNavOpen && (
          <div className="pointer-events-auto fixed inset-0 z-[100]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNavOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="absolute inset-y-0 left-0 z-10 flex w-80 flex-col justify-between border-r border-slate-800 bg-slate-900 p-6 shadow-2xl font-mono"
            >
              <div>
                <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/60 text-cyan-400 shadow-inner">
                      <Terminal className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xs font-black tracking-widest text-white uppercase">
                        APEX_OS
                      </h2>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        QUICK NAV DRAWER
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNavOpen(false)}
                    className="cursor-pointer rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-2 text-xs font-bold">
                  <Link
                    href="/"
                    onClick={() => setIsNavOpen(false)}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-cyan-500/50 bg-cyan-500/20 px-4 py-3 text-cyan-200 shadow-sm transition"
                  >
                    <div className="flex items-center gap-3">
                      <Home className="h-4 w-4 text-cyan-400" />
                      <span>Command Center</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-cyan-400" />
                  </Link>

                  <Link
                    href="/pos"
                    onClick={() => setIsNavOpen(false)}
                    className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-slate-300 transition hover:border-slate-700 hover:text-white"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="h-4 w-4 text-slate-400 transition group-hover:text-cyan-400" />
                      <span>POS Terminal</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    href="/inventory"
                    onClick={() => setIsNavOpen(false)}
                    className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-slate-300 transition hover:border-slate-700 hover:text-white"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="h-4 w-4 text-slate-400 transition group-hover:text-cyan-400" />
                      <span>Inventory Matrix</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    href="/manager/promotions"
                    onClick={() => setIsNavOpen(false)}
                    className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-slate-300 transition hover:border-slate-700 hover:text-white"
                  >
                    <div className="flex items-center gap-3">
                      <Tag className="h-4 w-4 text-slate-400 transition group-hover:text-cyan-400" />
                      <span>Promotions Manager</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    href="/cash"
                    onClick={() => setIsNavOpen(false)}
                    className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-slate-300 transition hover:border-slate-700 hover:text-white"
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-slate-400 transition group-hover:text-cyan-400" />
                      <span>Cash Drawer</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    href="/analytics"
                    onClick={() => setIsNavOpen(false)}
                    className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-slate-300 transition hover:border-slate-700 hover:text-white"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-4 w-4 text-slate-400 transition group-hover:text-cyan-400" />
                      <span>Sales Analytics</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    href="/database"
                    onClick={() => setIsNavOpen(false)}
                    className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-slate-300 transition hover:border-slate-700 hover:text-white"
                  >
                    <div className="flex items-center gap-3">
                      <Database className="h-4 w-4 text-slate-400 transition group-hover:text-cyan-400" />
                      <span>Database Nodes</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </nav>
              </div>

              <div className="border-t border-slate-800 pt-4 text-[10px] text-slate-500 font-semibold uppercase">
                APEXOS T3 ENGINE v2.4
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
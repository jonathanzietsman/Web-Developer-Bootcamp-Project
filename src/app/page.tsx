// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { getStoredLogs, pushTelemetry, clearTelemetry, type TelemetryLog } from "@/utils/telemetry";
import { 
  Terminal, 
  Activity, 
  ShieldCheck, 
  Home, 
  Layers, 
  BarChart3, 
  Database, 
  LogOut, 
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
  Tag // <-- Added Tag icon
} from "lucide-react";

// Helper function for human-readable relative timestamps
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

  const { data: cashSummary, isLoading: cashLoading, refetch: refetchCash } = api.cashLog.getSummary.useQuery(undefined, {
    enabled: !!session,
  });
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = api.product.getAll.useQuery(undefined, {
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
      pushTelemetry("SYS", "Node authentication verified via JWT/OAuth bridge.");
      pushTelemetry("SYS", "PostgreSQL instance connected via Supabase prisma pool.");
    }
    setLogs(getStoredLogs());

    const handleUpdate = () => {
      setLogs(getStoredLogs());
    };

    window.addEventListener("apex_telemetry_update", handleUpdate);
    return () => window.removeEventListener("apex_telemetry_update", handleUpdate);
  }, []);

  const handleGlobalSync = async () => {
    setIsSyncing(true);
    pushTelemetry("API", "Manual telemetry ping & registry synchronization initiated...");
    await Promise.all([refetchCash(), refetchProducts()]);
    setTimeout(() => {
      setIsSyncing(false);
      pushTelemetry("API", "Neural link refreshed. All sector nodes successfully verified.");
    }, 600);
  };

  const totalProducts = products?.length ?? 0;
  const lowStockCount = products?.filter((p) => p.stockQty < 5).length ?? 0;
  const totalValuation = products?.reduce((acc, p) => acc + (p.price * p.stockQty), 0) ?? 0;
  const totalPromotions = promotions?.length ?? 0;

  const filteredLogs = logs
    .filter(l => filterType === "ALL" || l.type === filterType)
    .sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      
      const validTimeA = isNaN(timeA) ? 0 : timeA;
      const validTimeB = isNaN(timeB) ? 0 : timeB;

      return sortOrder === "latest" ? validTimeB - validTimeA : validTimeA - validTimeB;
    });

  if (status === "loading") {
    return (
      <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#090D16] text-indigo-400 font-sans flex items-center justify-center">
        <div className="flex items-center gap-3 animate-pulse">
          <Cpu className="h-5 w-5 animate-spin" />
          <span className="text-xs font-semibold">ESTABLISHING SECURE HANDSHAKE...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#090D16] text-slate-100 font-sans flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative max-w-md w-full rounded-2xl border border-white/5 bg-[#0E1526]/90 p-8 shadow-2xl backdrop-blur-2xl text-center space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 shadow-inner">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white uppercase">ApexOS // Auth Gateway</h1>
            <p className="text-xs text-slate-400 mt-1.5">Restricted Terminal Access. Authenticate to initialize the POS matrix.</p>
          </div>
          <button
            onClick={() => {
              pushTelemetry("SYS", "Initializing NextAuth OAuth gateway provider...");
              void signIn();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            <Zap className="h-4 w-4" />
            INITIALIZE AUTHENTICATION
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#090D16] text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* TOP HEADER */}
      <header className="relative z-20 flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#0D1322]/80 backdrop-blur-xl shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => setIsNavOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-indigo-400 hover:bg-white/10 hover:border-indigo-500/30 transition shadow-inner cursor-pointer group"
            title="Open System Navigation"
          >
            <Terminal className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-indigo-400" />
                ApexOS Command Center
              </h1>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                SYSTEM ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Next-generation enterprise point of sale and tactical terminal ledger</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-1.5 text-xs text-slate-300">
            <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>Nodes Connected</span>
          </div>
          <button
            onClick={handleGlobalSync}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-indigo-400 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "SYNCING..." : "SYNC NODES"}</span>
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT BODY */}
      <main className="relative flex flex-1 flex-col overflow-hidden p-6 lg:p-8 space-y-6 max-w-[1700px] w-full mx-auto">
        
        {/* Quick Action Navigation Cards Grid (Expanded to 5 items) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 shrink-0">
          <Link 
            href="/pos" 
            onClick={() => pushTelemetry("NAV", "Navigated to POS Terminal (/pos)")}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0E1526]/80 p-4 backdrop-blur-xl transition hover:border-indigo-500/30 hover:bg-[#121B32] shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider">POS Terminal</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Execute sales, manage cart items & checkout</p>
            </div>
          </Link>

          <Link 
            href="/inventory" 
            onClick={() => pushTelemetry("NAV", "Navigated to Inventory Matrix (/inventory)")}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0E1526]/80 p-4 backdrop-blur-xl transition hover:border-indigo-500/30 hover:bg-[#121B32] shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Package className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider">Inventory Matrix</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Manage SKUs, stock levels, and pricing data</p>
            </div>
          </Link>

          {/* Added Promotions Quick Card */}
          <Link 
            href="/manager/promotions" 
            onClick={() => pushTelemetry("NAV", "Navigated to Promotions Manager (/manager/promotions)")}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0E1526]/80 p-4 backdrop-blur-xl transition hover:border-indigo-500/30 hover:bg-[#121B32] shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Tag className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider">Promotions Engine</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Configure bundle specials & discount rules</p>
            </div>
          </Link>

          <Link 
            href="/cash" 
            onClick={() => pushTelemetry("NAV", "Navigated to Cash Drawer (/cash)")}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0E1526]/80 p-4 backdrop-blur-xl transition hover:border-indigo-500/30 hover:bg-[#121B32] shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <DollarSign className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider">Cash Drawer</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Till audits, cash drops, and float adjustments</p>
            </div>
          </Link>

          <Link 
            href="/database" 
            onClick={() => pushTelemetry("NAV", "Navigated to Database Nodes (/database)")}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0E1526]/80 p-4 backdrop-blur-xl transition hover:border-indigo-500/30 hover:bg-[#121B32] shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Database className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider">Database Nodes</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Inspect cluster health and prisma cluster status</p>
            </div>
          </Link>
        </div>

        {/* Core Metrics Matrix Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 shrink-0">
          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-4 backdrop-blur-xl shadow-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Till Liquidity</span>
              <DollarSign className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {cashLoading ? "..." : `R${(cashSummary?.balance ?? 0).toFixed(2)}`}
            </p>
            <p className="text-[10px] text-slate-500">
              In: +R{(cashSummary?.totalIn ?? 0).toFixed(2)} | Out: -R{(cashSummary?.totalOut ?? 0).toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-4 backdrop-blur-xl shadow-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Asset Valuation</span>
              <Zap className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {productsLoading ? "..." : `R${totalValuation.toFixed(2)}`}
            </p>
            <p className="text-[10px] text-slate-500">Calculated across {totalProducts} indexed SKUs</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-4 backdrop-blur-xl shadow-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Active Promotions</span>
              <Tag className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white">{totalPromotions}</p>
            <p className="text-[10px] text-slate-500">Bundle rules active in register</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-4 backdrop-blur-xl shadow-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Stock Anomalies</span>
              <ShieldAlert className="h-4 w-4 text-rose-400" />
            </div>
            <p className={`text-2xl font-bold ${lowStockCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {productsLoading ? "..." : lowStockCount}
            </p>
            <p className="text-[10px] text-slate-500">
              {lowStockCount > 0 ? "Action required: Threshold breached" : "All nodes within safe margins"}
            </p>
          </div>
        </div>

        {/* Lower Grid: Telemetry Stream & Inventory Sub-Matrix */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 w-full flex-1 min-h-0 overflow-hidden">
          
          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 backdrop-blur-xl shadow-xl flex flex-col xl:col-span-1 h-full min-h-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Terminal className="h-4 w-4 text-indigo-400" />
                <span>Neural Telemetry Stream</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => clearTelemetry()}
                  title="Clear Log Buffer"
                  className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
              </div>
            </div>

            <div className="flex items-center justify-between my-2.5 gap-2 overflow-x-auto pb-1 text-[10px] font-bold shrink-0">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3 w-3 text-slate-500 shrink-0" />
                {["ALL", "NAV", "CLICK", "API", "SYS"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                      filterType === type 
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20" 
                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSortOrder(prev => prev === "latest" ? "oldest" : "latest")}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg border bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer shrink-0"
                title="Toggle Action Time Sort Order"
              >
                <ArrowUpDown className="h-3 w-3 text-indigo-400" />
                <span>{sortOrder === "latest" ? "LATEST" : "OLDEST"}</span>
              </button>
            </div>

            <div className="mt-1 flex-1 space-y-2 overflow-y-auto text-xs text-slate-300 font-mono pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const badgeColor = 
                    log.type === "NAV" ? "text-purple-400 border-purple-500/20 bg-purple-500/10" :
                    log.type === "CLICK" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" :
                    log.type === "API" ? "text-blue-400 border-blue-500/20 bg-blue-500/10" :
                    "text-indigo-400 border-indigo-500/20 bg-indigo-500/10";

                  const LogIcon = 
                    log.type === "NAV" ? Globe :
                    log.type === "CLICK" ? MousePointer :
                    log.type === "API" ? Activity :
                    Server;

                  return (
                    <div key={log.id} className="flex flex-col gap-1.5 border-l-2 border-indigo-500/50 pl-3 py-2 bg-[#070A12] rounded-r-xl border-y border-r border-white/5 shadow-inner">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] uppercase font-bold ${badgeColor}`}>
                          <LogIcon className="h-2.5 w-2.5" />
                          {log.type}
                        </span>
                        <span className="text-slate-400 font-semibold tracking-wide" title={log.timestamp}>
                          {getRelativeTime(log.timestamp)}
                        </span>
                      </div>
                      <span className="break-all text-slate-200 text-xs leading-relaxed">{log.message}</span>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">No telemetry signals matching filter criteria.</div>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/5 text-[11px] text-slate-500 flex justify-between font-bold items-center shrink-0">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                PERSISTENT SESSION ACTIVE
              </span>
              <span>BUFFER: {logs.length}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 backdrop-blur-xl shadow-xl space-y-3 xl:col-span-2 flex flex-col h-full min-h-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Live Inventory Sub-Matrix</h2>
              </div>
              <Link 
                href="/inventory" 
                onClick={() => pushTelemetry("NAV", "Redirected to full Inventory Matrix from dashboard")}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
              >
                View Full Matrix &rarr;
              </Link>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="sticky top-0 bg-[#0E1526] z-10 border-b border-white/5 text-[10px] uppercase text-slate-500 font-semibold">
                  <tr>
                    <th className="pb-3 px-3">Asset Designation</th>
                    <th className="pb-3 px-3">SKU Hash</th>
                    <th className="pb-3 px-3">Unit Value</th>
                    <th className="pb-3 px-3">Stock Node</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {productsLoading ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-indigo-400 text-xs">Querying cluster database...</td>
                    </tr>
                  ) : products && products.length > 0 ? (
                    products.map((product) => (
                      <tr 
                        key={product.id} 
                        onClick={() => pushTelemetry("CLICK", `Inspected asset node [SKU: ${product.sku}] - ${product.name}`)}
                        className="hover:bg-white/[0.02] transition cursor-pointer"
                      >
                        <td className="py-3 px-3 font-bold text-white">{product.name}</td>
                        <td className="py-3 px-3 font-mono text-indigo-400">{product.sku}</td>
                        <td className="py-3 px-3 text-slate-200 font-semibold">R{product.price.toFixed(2)}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                              product.stockQty < 5
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            }`}
                          >
                            {product.stockQty} UNITS
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-500 text-xs">No assets detected in current sector.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </main>

      {/* NAVIGATION DRAWER */}
      <AnimatePresence mode="wait">
        {isNavOpen && (
          <div className="fixed inset-0 z-[100] pointer-events-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNavOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="absolute inset-y-0 left-0 w-80 bg-[#0A0E1A] border-r border-white/10 p-6 flex flex-col justify-between shadow-2xl z-10"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-5 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-inner">
                      <Terminal className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-white tracking-wider uppercase">APEX_OS</h2>
                      <p className="text-[11px] text-slate-400">Navigation Hub</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsNavOpen(false)} 
                    className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-2 text-xs">
                  <Link 
                    href="/" 
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-white font-semibold transition cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Home className="h-4 w-4 text-indigo-400" />
                      <span>Command Center</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-indigo-400" />
                  </Link>

                  <Link 
                    href="/pos" 
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/10 hover:text-white hover:bg-white/5 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition" />
                      <span className="font-medium">POS Terminal</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link 
                    href="/inventory" 
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/10 hover:text-white hover:bg-white/5 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition" />
                      <span className="font-medium">Inventory Matrix</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  {/* Added Promotions in Drawer */}
                  <Link 
                    href="/manager/promotions" 
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/10 hover:text-white hover:bg-white/5 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Tag className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition" />
                      <span className="font-medium">Promotions Manager</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link 
                    href="/cash" 
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/10 hover:text-white hover:bg-white/5 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition" />
                      <span className="font-medium">Cash Drawer</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link 
                    href="/analytics" 
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/10 hover:text-white hover:bg-white/5 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition" />
                      <span className="font-medium">Sales Analytics</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link 
                    href="/database" 
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/10 hover:text-white hover:bg-white/5 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Database className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition" />
                      <span className="font-medium">Database Nodes</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </nav>
              </div>

              <div className="pt-4 border-t border-white/5 text-[11px]"></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
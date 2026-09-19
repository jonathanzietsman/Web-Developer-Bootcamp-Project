// src/app/analytics/page.tsx
"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { pushTelemetry } from "@/utils/telemetry";
import { 
  BarChart3, 
  Terminal, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  Home, 
  Layers, 
  Database, 
  X, 
  ChevronRight, 
  ArrowUpRight, 
  RefreshCw,
  Cpu,
  PackagePlus,
  Zap,
  ShieldAlert,
  FileSpreadsheet,
  DollarSign,
  Tag,
  Wallet
} from "lucide-react";

export default function AnalyticsPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<"TODAY" | "WEEK" | "MONTH">("TODAY");
  const [simulationMultiplier, setSimulationMultiplier] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch product catalog via tRPC
  const { data: products, isLoading, refetch } = api.product.getAll.useQuery();

  // Computed metrics based on real product data and simulation toggles
  const rawCatalogValue = products?.reduce((acc, p) => acc + p.price * p.stockQty, 0) ?? 0;
  const totalCatalogValue = rawCatalogValue * simulationMultiplier;
  const activeSKUsCount = products?.length ?? 0;
  const lowStockProducts = products?.filter((p) => p.stockQty < 10) ?? [];
  const outOfStockCount = products?.filter((p) => p.stockQty === 0).length ?? 0;

  // Base revenue scale modified by time range & simulation
  const timeMultiplier = timeRange === "TODAY" ? 1 : timeRange === "WEEK" ? 6.5 : 28;
  const baseRevenue = 4892.50 * timeMultiplier * simulationMultiplier;
  const totalTransactions = Math.round(128 * timeMultiplier * simulationMultiplier);

  const handleSimulateSurge = () => {
    setIsSimulating(true);
    pushTelemetry("CLICK", "Triggered load surge simulation toggle");
    setTimeout(() => {
      setSimulationMultiplier(prev => {
        const nextVal = Number((prev === 1 ? 1.35 : 1).toFixed(2));
        pushTelemetry("SIMULATION", `Simulation multiplier updated to ${nextVal}x`);
        return nextVal;
      });
      setIsSimulating(false);
    }, 600);
  };

  const handleTimeRangeChange = (range: "TODAY" | "WEEK" | "MONTH") => {
    setTimeRange(range);
    pushTelemetry("CLICK", `Switched analytics time range view to [${range}]`);
  };

  const handleExportCSV = () => {
    pushTelemetry("EXPORT", `Exported telemetry log report for [${timeRange}] range`);
    alert("Telemetry CSV report exported successfully.");
  };

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#090D16] text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Subtle modern ambient background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* TOP HEADER */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/5 bg-[#0D1322]/80 backdrop-blur-xl shadow-sm shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            type="button"
            onClick={() => {
              setIsNavOpen(true);
              pushTelemetry("NAV", "Opened main navigation menu from Analytics");
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-indigo-400 hover:bg-white/10 hover:border-indigo-500/30 transition shadow-inner cursor-pointer group"
            title="Open System Navigation"
          >
            <Terminal className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 sm:gap-2.5">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-400 hidden sm:inline" />
                Sales Analytics & Operational Intelligence
              </h1>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>POSTGRESQL // CONNECTED</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block mt-0.5">Live operational telemetry, revenue throughput, and stock valuation matrix</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              pushTelemetry("API", "Manually synced sales telemetry & inventory catalog");
              refetch();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-200 text-xs hover:bg-white/10 hover:border-white/20 transition cursor-pointer shadow-inner"
          >
            <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline font-medium">SYNC DATA</span>
          </button>
          
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-1.5 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>SECURE NODE</span>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT BODY */}
      <div className="relative flex flex-1 flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1700px] w-full mx-auto custom-scrollbar">
        
        {/* Control Bar & Simulation Engine Banner */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#0E1526]/80 border border-white/5 p-5 sm:p-6 rounded-2xl backdrop-blur-xl shadow-xl shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 shadow-inner">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Telemetry & Load Simulation Engine</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Active multiplier profile: <span className="text-indigo-400 font-bold">{simulationMultiplier}x load</span></p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            {/* Simulation Toggle Button */}
            <button
              onClick={handleSimulateSurge}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                simulationMultiplier > 1 
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-lg shadow-amber-500/10" 
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Zap className={`h-4 w-4 ${isSimulating ? "animate-spin text-amber-400" : "text-amber-400"}`} />
              <span>{simulationMultiplier > 1 ? "SIMULATION SURGE ACTIVE" : "TRIGGER LOAD SURGE"}</span>
            </button>

            {/* Time Range Selector */}
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#070A12] p-1.5 shadow-inner">
              {(["TODAY", "WEEK", "MONTH"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    timeRange === range 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4 shrink-0">
          
          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-2 group hover:border-indigo-500/30 transition">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">Gross Revenue ({timeRange})</span>
              <span className="flex items-center text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +14.2%
              </span>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">
              R{baseRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500">Aggregated register shift logs</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-2 group hover:border-indigo-500/30 transition">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">Total Transactions</span>
              <span className="flex items-center text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +8.7%
              </span>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{totalTransactions}</p>
            <p className="text-[11px] text-slate-500">Successful checkout node events</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-2 group hover:border-rose-500/30 transition">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">Stock Alerts</span>
              <span className="flex items-center text-rose-400 text-[10px] font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                {outOfStockCount} Out of Stock
              </span>
            </div>
            <p className="text-2xl font-bold text-rose-400 tracking-tight">{lowStockProducts.length}</p>
            <p className="text-[11px] text-slate-500">SKUs below safety threshold</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-2 group hover:border-indigo-500/30 transition">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">Catalog Asset Value</span>
              <span className="flex items-center text-indigo-400 text-[10px] font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                {activeSKUsCount} SKUs
              </span>
            </div>
            <p className="text-2xl font-bold text-emerald-400 tracking-tight">
              R{totalCatalogValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500">Total active inventory worth</p>
          </div>

        </div>

        {/* Operational Section: Throughput Visualizer & Low Stock Restock Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
          
          {/* Simulated Throughput Hourly Bar Visualizer */}
          <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Hourly Revenue Throughput</h3>
              </div>
              <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                <span>LIVE STREAM</span>
              </span>
            </div>

            <div className="h-60 flex items-end gap-2 sm:gap-3 pt-6 pb-2 px-2 border-b border-white/5 bg-[#070A12]/50 rounded-xl shadow-inner">
              {[40, 55, 30, 85, 60, 90, 95, 70, 85, 100, 75, 60].map((val, idx) => {
                const adjustedVal = Math.min(100, Math.round(val * simulationMultiplier));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[9px] text-indigo-400 opacity-0 group-hover:opacity-100 transition font-mono font-bold">
                      R{Math.round(adjustedVal * 15 * (timeRange === "WEEK" ? 6 : 1))}
                    </div>
                    <div 
                      style={{ height: `${adjustedVal}%` }} 
                      className="w-full rounded-t-lg bg-gradient-to-t from-indigo-950 via-indigo-600 to-indigo-400 group-hover:to-cyan-300 transition-all duration-300 shadow-md shadow-indigo-500/20"
                    />
                    <span className="text-[10px] text-slate-500 font-mono">{idx + 8}:00</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Peak Velocity Node: 17:00 - 18:00</span>
              </span>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition cursor-pointer font-semibold"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>EXPORT TELEMETRY CSV</span>
              </button>
            </div>
          </div>

          {/* Low Stock Restock Quick Action Panel */}
          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Restock Queue</h3>
              </div>
              <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                {lowStockProducts.length} CRITICAL SKUS
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-60 custom-scrollbar">
              {isLoading ? (
                <div className="flex h-40 items-center justify-center text-indigo-400 text-xs gap-2">
                  <Cpu className="h-4 w-4 animate-spin" />
                  <span>FETCHING CATALOG NODES...</span>
                </div>
              ) : lowStockProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-xs text-center gap-2">
                  <ShieldCheck className="h-8 w-8 text-emerald-400 opacity-80" />
                  <span className="font-medium text-slate-400">All inventory items are above critical stock limits.</span>
                </div>
              ) : (
                lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#070A12]/60 hover:bg-white/[0.02] transition">
                    <div className="pr-2 min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{product.name}</p>
                      <p className="text-[10px] text-rose-400 font-medium mt-0.5">Stock Qty: {product.stockQty}</p>
                    </div>
                    <Link
                      href="/inventory"
                      onClick={() => pushTelemetry("NAV", `Navigated to inventory matrix to restock item [${product.sku}]`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold hover:bg-indigo-600 hover:text-white transition cursor-pointer shrink-0"
                    >
                      <PackagePlus className="h-3.5 w-3.5" />
                      <span>Restock</span>
                    </Link>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-white/5 pt-3 text-center">
              <Link 
                href="/inventory" 
                onClick={() => pushTelemetry("NAV", "Navigated to full inventory matrix from analytics restock queue")}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 transition font-semibold"
              >
                Open full inventory management matrix &rarr;
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Section: Top SKUs Valuation Ranking */}
        <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4 shrink-0">
          <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Top Performing SKUs by Asset Yield</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">PRISMA // SORTED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {isLoading ? (
              <div className="col-span-full py-8 text-center text-xs text-indigo-400 animate-pulse flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading SKU ranking metrics...</span>
              </div>
            ) : (
              products?.slice(0, 4).map((product, idx) => (
                <div key={product.id} className="p-4 rounded-xl border border-white/5 bg-[#070A12]/60 hover:bg-white/[0.02] transition flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      RANK #0{idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">SKU: {product.sku}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 truncate">{product.name}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-xs font-bold text-emerald-400">R{product.price.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400">{product.stockQty} units remaining</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* MODERN SLIDE-OUT NAVIGATION DRAWER */}
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
                    onClick={() => { setIsNavOpen(false); pushTelemetry("NAV", "Navigated to Command Center (/)"); }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/10 hover:text-white hover:bg-white/5 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Home className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition" />
                      <span className="font-medium">Command Center</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link 
                    href="/pos" 
                    onClick={() => { setIsNavOpen(false); pushTelemetry("NAV", "Navigated to POS Terminal (/pos)"); }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/10 hover:text-white hover:bg-white/5 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Home className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition" />
                      <span className="font-medium">POS Terminal</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link 
                    href="/manager/promotions" 
                    onClick={() => { setIsNavOpen(false); pushTelemetry("NAV", "Navigated to Promotions Manager (/manager/promotions)"); }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/10 hover:text-white hover:bg-white/5 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Tag className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition" />
                      <span className="font-medium">Promotions Manager</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link 
                    href="/inventory" 
                    onClick={() => { setIsNavOpen(false); pushTelemetry("NAV", "Navigated to Inventory Matrix (/inventory)"); }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/10 hover:text-white hover:bg-white/5 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition" />
                      <span className="font-medium">Inventory Matrix</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link 
                    href="/cash" 
                    onClick={() => { setIsNavOpen(false); pushTelemetry("NAV", "Navigated to Cash Drawer (/cash)"); }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/10 hover:text-white hover:bg-white/5 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition" />
                      <span className="font-medium">Cash Drawer & Sales</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link 
                    href="/analytics" 
                    onClick={() => { setIsNavOpen(false); pushTelemetry("NAV", "Navigated to Sales Analytics (/analytics)"); }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-white font-semibold transition cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-4 w-4 text-indigo-400" />
                      <span>Sales Analytics</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-indigo-400" />
                  </Link>

                  <Link 
                    href="/database" 
                    onClick={() => { setIsNavOpen(false); pushTelemetry("NAV", "Navigated to Database Nodes (/database)"); }}
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

              <div className="pt-4 border-t border-white/5 text-[11px] text-slate-500 flex items-center justify-between">
                <span>System Build v2.4</span>
                <span className="text-emerald-400 font-mono">Secure</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
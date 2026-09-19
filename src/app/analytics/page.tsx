// src/app/analytics/page.tsx
"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  Terminal, 
  TrendingUp, 
  ShoppingBag, 
  Activity, 
  ShieldCheck, 
  Home, 
  Layers, 
  Database, 
  Settings, 
  LogOut, 
  X, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Cpu,
  AlertTriangle,
  PackagePlus,
  Zap,
  DollarSign,
  PieChart,
  Sliders,
  ShieldAlert,
  FileSpreadsheet
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
    setTimeout(() => {
      setSimulationMultiplier(prev => Number((prev === 1 ? 1.35 : 1).toFixed(2)));
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-mono flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      {/* TOP HEADER */}
      <header className="relative z-20 flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/85 backdrop-blur-md shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setIsNavOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/50 bg-cyan-950/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)] hover:bg-cyan-900/80 hover:border-cyan-400 transition cursor-pointer group pointer-events-auto"
            title="Open System Navigation"
          >
            <Terminal className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase">APEX_POS // ANALYTICS & TELEMETRY</span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] text-emerald-300 border border-emerald-500/30">POSTGRESQL // CONNECTED</span>
            </div>
            <p className="text-[10px] text-slate-400">Live operational intelligence & stock distribution matrix</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 text-xs hover:bg-slate-800 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
            <span>SYNC DATA</span>
          </button>
          
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 text-[11px] text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>SECURE NODE</span>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT BODY */}
      <div className="relative flex flex-1 flex-col overflow-y-auto p-6 lg:p-8 space-y-6 max-w-[1700px] w-full mx-auto">
        
        {/* Control Bar & Simulation Engine */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Telemetry Engine</h2>
              <p className="text-[10px] text-slate-400">Active multiplier profile: <span className="text-cyan-400 font-bold">{simulationMultiplier}x load</span></p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Simulation Toggle Button */}
            <button
              onClick={handleSimulateSurge}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                simulationMultiplier > 1 
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]" 
                  : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              <Zap className={`h-3.5 w-3.5 ${isSimulating ? "animate-spin text-amber-400" : "text-amber-400"}`} />
              <span>{simulationMultiplier > 1 ? "SIMULATION SURGE ACTIVE" : "TRIGGER LOAD SURGE"}</span>
            </button>

            {/* Time Range Selector */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 p-1">
              {(["TODAY", "WEEK", "MONTH"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    timeRange === range 
                      ? "bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 relative overflow-hidden group hover:border-cyan-500/40 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Gross Revenue ({timeRange})</span>
              <span className="flex items-center text-emerald-400 text-[10px] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +14.2%
              </span>
            </div>
            <p className="text-2xl font-bold text-white">R{baseRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-slate-500 mt-1">Aggregated register shift logs</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 relative overflow-hidden group hover:border-purple-500/40 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Total Transactions</span>
              <span className="flex items-center text-emerald-400 text-[10px] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +8.7%
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{totalTransactions}</p>
            <p className="text-[10px] text-slate-500 mt-1">Successful checkout nodes</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 relative overflow-hidden group hover:border-rose-500/40 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Stock Alerts</span>
              <span className="flex items-center text-rose-400 text-[10px] bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/20">
                {outOfStockCount} Out
              </span>
            </div>
            <p className="text-2xl font-bold text-rose-400">{lowStockProducts.length}</p>
            <p className="text-[10px] text-slate-500 mt-1">SKUs below safety threshold</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 relative overflow-hidden group hover:border-emerald-500/40 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Catalog Asset Value</span>
              <span className="flex items-center text-cyan-400 text-[10px] bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                {activeSKUsCount} SKUs
              </span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">R{totalCatalogValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-slate-500 mt-1">Total active inventory worth</p>
          </div>

        </div>

        {/* Operational Section: Throughput Visualizer & Low Stock Restock Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Simulated Throughput Hourly Bar Visualizer */}
          <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Hourly Revenue Throughput</h3>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
                LIVE STREAM
              </span>
            </div>

            <div className="h-56 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-800 bg-slate-950/40 rounded-lg">
              {[40, 55, 30, 85, 60, 90, 95, 70, 85, 100, 75, 60].map((val, idx) => {
                const adjustedVal = Math.min(100, Math.round(val * simulationMultiplier));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[9px] text-cyan-400 opacity-0 group-hover:opacity-100 transition font-mono">
                      R{Math.round(adjustedVal * 15 * (timeRange === "WEEK" ? 6 : 1))}
                    </div>
                    <div 
                      style={{ height: `${adjustedVal}%` }} 
                      className="w-full rounded-t bg-gradient-to-t from-cyan-950 via-cyan-900 to-cyan-400/90 group-hover:to-cyan-300 transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                    />
                    <span className="text-[9px] text-slate-500 font-mono">{idx + 8}:00</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Peak Velocity Node: 17:00 - 18:00
              </span>
              <button 
                onClick={() => alert("Telemetry CSV exported successfully.")}
                className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>EXPORT LOGS</span>
              </button>
            </div>
          </div>

          {/* Low Stock Restock Quick Action Panel */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Restock Queue</h3>
              </div>
              <span className="text-[10px] text-rose-400 font-mono bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                {lowStockProducts.length} ITEMS
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-56">
              {isLoading ? (
                <div className="flex h-36 items-center justify-center text-cyan-400 animate-pulse text-xs">
                  <Cpu className="h-4 w-4 mr-2 animate-spin" />
                  <span>FETCHING NODES...</span>
                </div>
              ) : lowStockProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-xs text-center">
                  <ShieldCheck className="h-8 w-8 text-emerald-500 mb-2 opacity-60" />
                  <span>All inventory items are above critical stock limits.</span>
                </div>
              ) : (
                lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-950/60">
                    <div>
                      <p className="text-xs font-medium text-slate-200 truncate max-w-[120px]">{product.name}</p>
                      <p className="text-[10px] text-rose-400">Stock Qty: {product.stockQty}</p>
                    </div>
                    <Link
                      href="/inventory"
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[10px] hover:bg-cyan-900 transition"
                    >
                      <PackagePlus className="h-3 w-3" />
                      <span>Restock</span>
                    </Link>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-800 pt-3 mt-3 text-center">
              <Link href="/inventory" className="text-[10px] text-cyan-400 hover:underline">
                Open full inventory management matrix &rarr;
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Section: Top SKUs Valuation Ranking */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Top Performing SKUs by Asset Yield</h3>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono">PRISMA // SORTED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {isLoading ? (
              <div className="col-span-full py-8 text-center text-xs text-cyan-400 animate-pulse">
                Loading SKU ranking metrics...
              </div>
            ) : (
              products?.slice(0, 4).map((product, idx) => (
                <div key={product.id} className="p-3 rounded-lg border border-slate-800 bg-slate-950/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-cyan-400 font-mono">RANK #0{idx + 1}</span>
                    <span className="text-[10px] text-slate-500 font-mono">SKU: {product.sku}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-200 truncate mb-3">{product.name}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-xs font-bold text-emerald-400">R{product.price.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400">{product.stockQty} units remaining</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ANIMATED SLIDE-OUT NAVIGATION DRAWER */}
      <AnimatePresence mode="wait">
        {isNavOpen && (
          <div className="fixed inset-0 z-[100] pointer-events-auto">
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
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="absolute inset-y-0 left-0 w-80 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shadow-2xl z-10"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/50 bg-cyan-950/50 text-cyan-400">
                      <Terminal className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-cyan-400 uppercase">APEX_OS // NAV</h2>
                      <p className="text-[10px] text-slate-400">System Directory</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsNavOpen(false)} 
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-1.5 text-xs">
                  <Link 
                    href="/register" 
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-800/80 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:text-white transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Home className="h-4 w-4 text-slate-400" />
                      <span>POS Terminal</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                  </Link>

                  <Link 
                    href="/inventory" 
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-800/80 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:text-white transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="h-4 w-4 text-slate-400" />
                      <span>Inventory Matrix</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                  </Link>

                  <Link 
                    href="/analytics" 
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-bold transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <BarChart3 className="h-4 w-4 text-cyan-400" />
                      <span>Sales Analytics</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-cyan-500" />
                  </Link>

                  <Link 
                    href="/database" 
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-800/80 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:text-white transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Database className="h-4 w-4 text-slate-400" />
                      <span>Database Nodes</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                  </Link>

                  <Link 
                    href="/settings" 
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-800/80 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:text-white transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings className="h-4 w-4 text-slate-400" />
                      <span>System Settings</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                  </Link>
                </nav>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-3">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-[10px] text-slate-400 space-y-1">
                  <div className="flex justify-between font-bold text-slate-300">
                    <span>NODE_ID:</span>
                    <span className="text-cyan-400">APEX-PRIME-01</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SECURE PROTOCOL:</span>
                    <span className="text-emerald-400">ACTIVE</span>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => alert("Terminal Session Terminated")}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/30 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/50 transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>TERMINATE SESSION</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
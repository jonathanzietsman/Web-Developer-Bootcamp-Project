// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { 
  Cpu, 
  Activity, 
  DollarSign, 
  Package, 
  ShieldAlert, 
  TrendingUp, 
  Terminal, 
  Zap, 
  RefreshCw,
  Layers,
  Radio
} from "lucide-react";

export default function DashboardPage() {
  const { data: cashSummary, isLoading: cashLoading, refetch: refetchCash } = api.cashLog.getSummary.useQuery();
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = api.product.getAll.useQuery();

  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setTelemetryLogs([
      "SYS_INIT: Quantum-secure ledger core initialized.",
      "SEC_PROTOCOL: Node authentication verified via JWT/OAuth bridge.",
      "DB_CLUSTER: PostgreSQL instance connected via Supabase prisma pool.",
      "POS_CORE: Terminal modules loaded successfully."
    ]);
  }, []);

  const handleGlobalSync = async () => {
    setIsSyncing(true);
    setTelemetryLogs(prev => [`[${new Date().toLocaleTimeString()}] Manual telemetry ping initiated...`, ...prev.slice(0, 6)]);
    await Promise.all([refetchCash(), refetchProducts()]);
    setTimeout(() => {
      setIsSyncing(false);
      setTelemetryLogs(prev => [`[${new Date().toLocaleTimeString()}] Neural link refreshed. All registries synced.`, ...prev.slice(0, 6)]);
    }, 600);
  };

  const totalProducts = products?.length ?? 0;
  const lowStockCount = products?.filter((p) => p.stockQty < 5).length ?? 0;
  const totalValuation = products?.reduce((acc, p) => acc + (p.price * p.stockQty), 0) ?? 0;

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 p-6 lg:p-8 font-mono selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Background Cyber Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      {/* Full Viewport Width Container */}
      <div className="relative w-full max-w-none space-y-6">
        
        {/* Top Command Bar */}
        <div className="flex flex-col gap-4 rounded-2xl border border-cyan-500/40 bg-slate-900/90 p-5 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between shadow-[0_0_30px_rgba(6,182,212,0.2)]">
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/60 bg-cyan-950/70 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Cpu className="h-6 w-6 animate-pulse" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black tracking-widest text-cyan-400">APEX_OS // COMMAND_CENTER</h1>
                <span className="rounded-lg bg-cyan-500/15 px-2.5 py-1 text-[11px] font-bold text-cyan-300 border border-cyan-500/40">v4.8-STABLE</span>
              </div>
              <p className="text-xs text-slate-400 tracking-wider">Autonomous Point-of-Sale Telemetry & Liquidity Matrix</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-2 text-xs text-emerald-400 font-bold shadow-inner">
              <Radio className="h-4 w-4 animate-pulse" />
              <span className="tracking-wider">SUB-ROUTINES: ACTIVE</span>
            </div>
            <button
              onClick={handleGlobalSync}
              disabled={isSyncing}
              className="flex items-center gap-2.5 rounded-xl border border-cyan-500/50 bg-cyan-500/20 px-5 py-2.5 text-xs font-extrabold text-cyan-200 transition hover:bg-cyan-500/30 hover:border-cyan-400 active:scale-95 disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.25)]"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "SYNCING..." : "PULSE_SYNC"}
            </button>
          </div>
        </div>

        {/* Core Metrics Matrix (4-Column Fluid Grid) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 w-full">
          
          {/* Till Balance */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl transition hover:border-cyan-500/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]">
            <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Till Liquidity</span>
              <DollarSign className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-white">
                {cashLoading ? "..." : `$${cashSummary?.balance.toFixed(2) ?? "0.00"}`}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-cyan-300 font-semibold">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>In: +${cashSummary?.totalIn.toFixed(2) ?? "0.00"} | Out: -${cashSummary?.totalOut.toFixed(2) ?? "0.00"}</span>
            </div>
          </div>

          {/* Catalog Valuation */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl transition hover:border-purple-500/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]">
            <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Asset Valuation</span>
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-white">
                {productsLoading ? "..." : `$${totalValuation.toFixed(2)}`}
              </span>
            </div>
            <div className="mt-3 text-[11px] text-purple-300 font-semibold">
              Calculated across {totalProducts} indexed SKUs
            </div>
          </div>

          {/* Active SKUs */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl transition hover:border-blue-500/60 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]">
            <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Indexed Products</span>
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-white">
                {productsLoading ? "..." : totalProducts}
              </span>
            </div>
            <div className="mt-3 text-[11px] text-blue-300 font-semibold">
              Database state: Synchronized
            </div>
          </div>

          {/* System Warnings / Low Stock */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl transition hover:border-rose-500/60 hover:shadow-[0_0_25px_rgba(244,63,94,0.15)]">
            <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Stock Anomalies</span>
              <ShieldAlert className="h-5 w-5 text-rose-400" />
            </div>
            <div className="mt-4">
              <span className={`text-3xl font-black tracking-tight ${lowStockCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                {productsLoading ? "..." : lowStockCount}
              </span>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 font-semibold">
              {lowStockCount > 0 ? "Action required: Threshold breached" : "All nodes within safe margins"}
            </div>
          </div>

        </div>

        {/* Lower Grid: Telemetry Log + Product Matrix Preview */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 w-full">
          
          {/* Terminal Diagnostics Feed */}
          <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-xl shadow-xl xl:col-span-1">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5 text-xs font-extrabold text-cyan-400 uppercase tracking-widest">
                <Terminal className="h-4 w-4" />
                <span>Neural Telemetry Stream</span>
              </div>
              <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
            </div>
            <div className="mt-4 flex-1 space-y-2.5 overflow-y-auto max-h-80 text-xs text-slate-300 font-mono">
              {telemetryLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2.5 border-l-2 border-cyan-500/50 pl-3 py-1 bg-slate-950/60 rounded-r-lg">
                  <span className="text-cyan-400 font-bold">&gt;</span>
                  <span className="break-all">{log}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between font-bold">
              <span>BUFFER: STABLE</span>
              <span>ENC: AES-256</span>
            </div>
          </div>

          {/* Inventory Tactical Stream */}
          <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-xl xl:col-span-2 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5 text-xs font-extrabold text-purple-400 uppercase tracking-widest">
                <Layers className="h-4 w-4" />
                <span>Live Inventory Sub-Matrix</span>
              </div>
              <span className="text-xs text-slate-400 font-semibold">Showing top indexed assets</span>
            </div>

            <div className="mt-4 overflow-x-auto flex-1">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="pb-3.5 font-bold">Asset Designation</th>
                    <th className="pb-3.5 font-bold">SKU Hash</th>
                    <th className="pb-3.5 font-bold">Unit Value</th>
                    <th className="pb-3.5 font-bold">Stock Node</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {productsLoading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">Querying cluster database...</td>
                    </tr>
                  ) : products && products.length > 0 ? (
                    products.slice(0, 5).map((product) => (
                      <tr key={product.id} className="transition hover:bg-slate-800/50">
                        <td className="py-4 font-bold text-white">{product.name}</td>
                        <td className="py-4 font-mono text-cyan-400">{product.sku}</td>
                        <td className="py-4 text-slate-200 font-semibold">${product.price.toFixed(2)}</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                            product.stockQty < 5 
                              ? "bg-rose-950/80 text-rose-400 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]" 
                              : "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                          }`}>
                            {product.stockQty} UNITS
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">No assets detected in current sector.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
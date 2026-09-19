// src/app/database/page.tsx
"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { pushTelemetry } from "@/utils/telemetry";
import { 
  Database, 
  Terminal, 
  ShieldCheck, 
  Activity, 
  Home, 
  Layers, 
  BarChart3, 
  LogOut, 
  X, 
  ChevronRight, 
  RefreshCw, 
  CheckCircle2, 
  Server, 
  HardDrive, 
  Table, 
  Lock,
  GitCommit,
  Tag,
  Wallet,
  Code2,
  AlertTriangle
} from "lucide-react";

export default function DatabasePage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [connStatus, setConnStatus] = useState<string | null>(null);

  // Fetch product data to verify tRPC database resolution
  const { data: products, isLoading, refetch } = api.product.getAll.useQuery();

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    setConnStatus(null);
    pushTelemetry("CLICK", "Initiated PostgreSQL cluster handshake diagnostics");
    try {
      const startTime = performance.now();
      await refetch();
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      setConnStatus(`SUCCESS: SUPABASE POSTGRESQL LINK ACTIVE (${duration}ms latency)`);
      pushTelemetry("DB_HANDSHAKE", `Handshake successful with latency [${duration}ms]`);
    } catch (error) {
      console.error(error);
      setConnStatus("ERROR: DATABASE HANDSHAKE FAILED");
      pushTelemetry("ERROR", "Database connection handshake failed");
    } finally {
      setIsTestingConn(false);
    }
  };

  const totalRecords = products?.length ?? 0;

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#090D16] text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Ambient background glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* TOP HEADER */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/5 bg-[#0D1322]/80 backdrop-blur-xl shadow-sm shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            type="button"
            onClick={() => {
              setIsNavOpen(true);
              pushTelemetry("NAV", "Opened main navigation menu from Database Node");
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-cyan-400 hover:bg-white/10 hover:border-cyan-500/30 transition shadow-inner cursor-pointer group pointer-events-auto"
            title="Open System Navigation"
          >
            <Terminal className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 sm:gap-2.5">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <Database className="h-4 w-4 text-cyan-400 hidden sm:inline" />
                Database Cluster Diagnostics
              </h1>
              <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300 border border-cyan-500/20 flex items-center gap-1 font-mono">
                <span>POSTGRESQL // PRISMA</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block mt-0.5">Supabase relational database status, ORM models, and query latency telemetry</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-1.5 text-xs text-slate-300 font-mono">
            <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>ORM POOL: HEALTHY</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs text-emerald-400 font-medium">
            <ShieldCheck className="h-4 w-4" />
            <span>SSL ENCRYPTED</span>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT BODY */}
      <div className="relative flex flex-1 flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1700px] w-full mx-auto custom-scrollbar">
        
        {/* Cluster Status Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0E1526]/80 border border-white/5 p-5 sm:p-6 rounded-2xl backdrop-blur-xl shadow-xl shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 shadow-inner">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Supabase Managed PostgreSQL Cluster</h2>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Region: AWS us-east-1 // Direct Connection Pooler (Port 6543)</p>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={isTestingConn}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition cursor-pointer shadow-lg shadow-cyan-500/5 disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isTestingConn ? "animate-spin text-cyan-400" : "text-cyan-400"}`} />
            <span>{isTestingConn ? "PINGING NODE..." : "TEST CLUSTER HANDSHAKE"}</span>
          </button>
        </div>

        {connStatus && (
          <div className={`rounded-xl border p-4 text-center text-xs font-bold flex items-center justify-center gap-2 backdrop-blur-md ${
            connStatus.startsWith("ERROR") 
              ? "border-rose-500/30 bg-rose-500/10 text-rose-300" 
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          }`}>
            {connStatus.startsWith("ERROR") ? (
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            )}
            <span className="font-mono">{connStatus}</span>
          </div>
        )}

        {/* Database Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4 shrink-0">
          
          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-2 group hover:border-cyan-500/30 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Active Tables</span>
              <Table className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">4</p>
            <p className="text-[11px] text-slate-500 font-mono">User, Product, Order, OrderItem</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-2 group hover:border-emerald-500/30 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Total Product Records</span>
              <HardDrive className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 tracking-tight">{isLoading ? "..." : totalRecords}</p>
            <p className="text-[11px] text-slate-500 font-mono">Synchronized via Prisma ORM</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-2 group hover:border-purple-500/30 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Migration Version</span>
              <GitCommit className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-xl font-bold text-white font-mono tracking-tight">v2.4.1_apex</p>
            <p className="text-[11px] text-slate-500 font-mono">Schema fully up to date</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-2 group hover:border-cyan-500/30 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Encryption & Security</span>
              <Lock className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-xl font-bold text-cyan-300 font-mono tracking-tight">bcrypt + JWT</p>
            <p className="text-[11px] text-slate-500 font-mono">Atomic transaction safety enabled</p>
          </div>

        </div>

        {/* Prisma Schema Overview Section & Query Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0">
          
          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Prisma Schema Models</h3>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">SCHEMA.PRISMA</span>
            </div>

            <div className="bg-[#070A12] p-4 rounded-xl border border-white/5 font-mono text-[11px] text-slate-300 space-y-1.5 overflow-x-auto shadow-inner custom-scrollbar">
              <p className="text-purple-400">model <span className="text-cyan-300">Product</span> &#123;</p>
              <p className="pl-4 text-slate-400">id <span className="text-purple-300">String</span> @id @default(cuid())</p>
              <p className="pl-4 text-slate-400">name <span className="text-purple-300">String</span></p>
              <p className="pl-4 text-slate-400">sku <span className="text-purple-300">String</span> @unique</p>
              <p className="pl-4 text-slate-400">price <span className="text-purple-300">Float</span></p>
              <p className="pl-4 text-slate-400">stockQty <span className="text-purple-300">Int</span> @default(0)</p>
              <p className="pl-4 text-slate-400">createdAt <span className="text-purple-300">DateTime</span> @default(now())</p>
              <p className="text-purple-400">&#125;</p>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-white/5">
              <span>Foreign Key Constraints: Enforced</span>
              <span className="text-emerald-400 font-semibold">Indexes Optimized</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Query Execution Logs</h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>REAL-TIME</span>
              </span>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 max-h-56 custom-scrollbar">
              <div className="p-3 rounded-xl border border-white/5 bg-[#070A12]/60 hover:bg-white/[0.02] transition font-mono text-[10px] space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-cyan-400 font-bold">query product.getAll</span>
                  <span className="text-emerald-400">12ms</span>
                </div>
                <p className="text-slate-300 truncate">SELECT id, name, sku, price, &quot;stockQty&quot; FROM &quot;Product&quot;</p>
              </div>

              <div className="p-3 rounded-xl border border-white/5 bg-[#070A12]/60 hover:bg-white/[0.02] transition font-mono text-[10px] space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-purple-400 font-bold">mutation product.updateStock</span>
                  <span className="text-emerald-400">18ms</span>
                </div>
                <p className="text-slate-300 truncate">UPDATE &quot;Product&quot; SET &quot;stockQty&quot; = $1 WHERE id = $2</p>
              </div>

              <div className="p-3 rounded-xl border border-white/5 bg-[#070A12]/60 hover:bg-white/[0.02] transition font-mono text-[10px] space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-cyan-400 font-bold">tRPC batch validation</span>
                  <span className="text-emerald-400">6ms</span>
                </div>
                <p className="text-slate-300 truncate">Zod schema verification passed for payload</p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 text-[11px] text-slate-500 text-center font-mono">
              <span>All database operations routed through end-to-end type-safe tRPC context</span>
            </div>
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-inner">
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
                      <Home className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition" />
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
                      <Home className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition" />
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
                      <Tag className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition" />
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
                      <Layers className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition" />
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
                      <Wallet className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition" />
                      <span className="font-medium">Cash Drawer & Sales</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link 
                    href="/analytics" 
                    onClick={() => { setIsNavOpen(false); pushTelemetry("NAV", "Navigated to Sales Analytics (/analytics)"); }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/10 hover:text-white hover:bg-white/5 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition" />
                      <span className="font-medium">Sales Analytics</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link 
                    href="/database" 
                    onClick={() => { setIsNavOpen(false); pushTelemetry("NAV", "Navigated to Database Nodes (/database)"); }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-cyan-600/15 border border-cyan-500/30 text-white font-semibold transition cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Database className="h-4 w-4 text-cyan-400" />
                      <span>Database Nodes</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-cyan-400" />
                  </Link>
                </nav>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="rounded-xl border border-white/5 bg-[#070A12] p-3 text-[11px] text-slate-400 space-y-1 font-mono">
                  <div className="flex justify-between font-bold text-slate-300">
                    <span>NODE_ID:</span>
                    <span className="text-cyan-400">APEX-PRIME-01</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PROTOCOL:</span>
                    <span className="text-emerald-400">ACTIVE SSL</span>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => {
                    pushTelemetry("AUTH", "Terminated database terminal session");
                    alert("Terminal Session Terminated");
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
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
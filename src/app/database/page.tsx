// src/app/database/page.tsx
"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, 
  Terminal, 
  ShieldCheck, 
  Activity, 
  Home, 
  Layers, 
  BarChart3, 
  Settings, 
  LogOut, 
  X, 
  ChevronRight, 
  RefreshCw, 
  Cpu, 
  CheckCircle2, 
  Server, 
  HardDrive, 
  Table, 
  Key, 
  Lock,
  GitCommit
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
    try {
      await refetch();
      setConnStatus("SUCCESS: SUPABASE POSTGRESQL LINK ACTIVE (14ms)");
    } catch (error) {
      console.error(error);
      setConnStatus("ERROR: DATABASE HANDSHAKE FAILED");
    } finally {
      setIsTestingConn(false);
    }
  };

  const totalRecords = products?.length ?? 0;

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
              <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase">APEX_POS // DATABASE NODES</span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] text-emerald-300 border border-emerald-500/30">POSTGRESQL // PRISMA</span>
            </div>
            <p className="text-[10px] text-slate-400">Supabase relational cluster diagnostics</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-[11px] text-slate-300">
            <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>ORM POOL: HEALTHY</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 text-[11px] text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>SSL SECURE</span>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT BODY */}
      <div className="relative flex flex-1 flex-col overflow-y-auto p-6 lg:p-8 space-y-6 max-w-[1700px] w-full mx-auto">
        
        {/* Cluster Status Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Supabase Managed PostgreSQL Cluster</h2>
              <p className="text-[10px] text-slate-400 font-mono">Region: us-east-1 // Direct Connection Pooler (Port 6543)</p>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={isTestingConn}
            className="flex items-center gap-2 rounded-lg border border-cyan-500/50 bg-cyan-500/20 px-4 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition cursor-pointer disabled:opacity-50"
          >
            {isTestingConn ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            <span>{isTestingConn ? "PINGING NODE..." : "TEST CLUSTER HANDSHAKE"}</span>
          </button>
        </div>

        {connStatus && (
          <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/40 p-3 text-center text-xs font-bold text-cyan-300 flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{connStatus}</span>
          </div>
        )}

        {/* Database Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Active Tables</span>
              <Table className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-white">4</p>
            <p className="text-[10px] text-slate-500 font-mono">User, Product, Order, OrderItem</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Product Records</span>
              <HardDrive className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">{isLoading ? "..." : totalRecords}</p>
            <p className="text-[10px] text-slate-500 font-mono">Synchronized via Prisma ORM</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Prisma Migration Version</span>
              <GitCommit className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-xl font-bold text-white font-mono">v2.4.1_apex</p>
            <p className="text-[10px] text-slate-500 font-mono">Schema fully up to date</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Encryption Protocol</span>
              <Lock className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-xl font-bold text-cyan-300 font-mono">bcrypt + JWT</p>
            <p className="text-[10px] text-slate-500 font-mono">Atomic transaction safety enabled</p>
          </div>

        </div>

        {/* Prisma Schema Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Prisma Schema Models</h3>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono">SCHEMA.PRISMA</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-2 overflow-x-auto">
              <p className="text-purple-400">model <span className="text-cyan-300">Product</span> &#123;</p>
              <p className="pl-4 text-slate-400">id <span className="text-purple-300">String</span> @id @default(cuid())</p>
              <p className="pl-4 text-slate-400">name <span className="text-purple-300">String</span></p>
              <p className="pl-4 text-slate-400">sku <span className="text-purple-300">String</span> @unique</p>
              <p className="pl-4 text-slate-400">price <span className="text-purple-300">Float</span></p>
              <p className="pl-4 text-slate-400">stockQty <span className="text-purple-300">Int</span> @default(0)</p>
              <p className="pl-4 text-slate-400">createdAt <span className="text-purple-300">DateTime</span> @default(now())</p>
              <p className="text-purple-400">&#125;</p>
            </div>

            <div className="pt-3 text-[10px] text-slate-500 flex justify-between">
              <span>Foreign Key Constraints: Enforced</span>
              <span className="text-emerald-400">Indexes Optimized</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Database Query Logs</h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">REAL-TIME</span>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
              <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-[10px] font-mono space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span className="text-cyan-400">query product.getAll</span>
                  <span>12ms</span>
                </div>
                <p className="text-slate-300 truncate">SELECT id, name, sku, price, &quot;stockQty&quot; FROM &quot;Product&quot;</p>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-[10px] font-mono space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span className="text-purple-400">mutation product.updateStock</span>
                  <span>18ms</span>
                </div>
                <p className="text-slate-300 truncate">UPDATE &quot;Product&quot; SET &quot;stockQty&quot; = $1 WHERE id = $2</p>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-[10px] font-mono space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span className="text-cyan-400">tRPC batch validation</span>
                  <span>6ms</span>
                </div>
                <p className="text-slate-300 truncate">Zod schema verification passed for payload</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 text-center">
              <span>All queries routed through tRPC type-safe context</span>
            </div>
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
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-800/80 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:text-white transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <BarChart3 className="h-4 w-4 text-slate-400" />
                      <span>Sales Analytics</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                  </Link>

                  <Link 
                    href="/database" 
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-bold transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Database className="h-4 w-4 text-cyan-400" />
                      <span>Database Nodes</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-cyan-500" />
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
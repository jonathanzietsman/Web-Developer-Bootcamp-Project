// src/app/settings/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, 
  Terminal, 
  ShieldCheck, 
  Activity, 
  Home, 
  Layers, 
  BarChart3, 
  Database, 
  LogOut, 
  X, 
  ChevronRight, 
  Save, 
  Printer, 
  Percent, 
  Lock, 
  UserCheck, 
  CheckCircle2, 
  SlidersHorizontal,
  Bell
} from "lucide-react";

export default function SettingsPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);

  // Form States
  const [terminalName, setTerminalName] = useState("APEX-PRIME-01");
  const [taxRate, setTaxRate] = useState("8.25");
  const [receiptPrinter, setReceiptPrinter] = useState("EPSON TM-T20III (USB)");
  const [autoOfflineCache, setAutoOfflineCache] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [securityLevel, setSecurityLevel] = useState("HIGH (PIN + JWT)");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
    }, 3000);
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
              <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase">APEX_POS // SYSTEM SETTINGS</span>
              <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[9px] text-cyan-300 border border-cyan-500/30">CONFIG_NODE</span>
            </div>
            <p className="text-[10px] text-slate-400">Terminal preferences and security parameters</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-[11px] text-slate-300">
            <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>CONFIG: SYNCHRONIZED</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 text-[11px] text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>ADMIN LOCKED</span>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT BODY */}
      <div className="relative flex flex-1 flex-col overflow-y-auto p-6 space-y-6">
        
        {/* Success Banner */}
        {savedStatus && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>SUCCESS: SYSTEM CONFIGURATION VARIABLES UPDATED & PERSISTED</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
          
          {/* Left / Main Configuration Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Terminal Configuration */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Terminal Parameters</h3>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">CORE_CONFIG</span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Terminal Designation ID</label>
                  <input
                    type="text"
                    value={terminalName}
                    onChange={(e) => setTerminalName(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Unique identifier reported in sales audit logs and tRPC mutations.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">Default Sales Tax Rate (%)</label>
                    <div className="relative">
                      <Percent className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={taxRate}
                        onChange={(e) => setTaxRate(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 pl-9 text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">Receipt Hardware Interface</label>
                    <div className="relative">
                      <Printer className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
                      <select
                        value={receiptPrinter}
                        onChange={(e) => setReceiptPrinter(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 pl-9 text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
                      >
                        <option>EPSON TM-T20III (USB)</option>
                        <option>STAR MICRONICS TSP100 (LAN)</option>
                        <option>VIRTUAL PDF PRINTER</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Offline Cache & Audio Toggles */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Bell className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Peripherals & Caching</h3>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">IO_PREFS</span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/60">
                  <div>
                    <p className="font-bold text-slate-200">Offline Transaction Caching</p>
                    <p className="text-[10px] text-slate-400">Store completed orders locally when Supabase connection drops, syncing on reconnect.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoOfflineCache}
                    onChange={(e) => setAutoOfflineCache(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/60">
                  <div>
                    <p className="font-bold text-slate-200">Terminal Audio Feedback</p>
                    <p className="text-[10px] text-slate-400">Play synthetic beep tones upon barcode scanning and checkout completion.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundEffects}
                    onChange={(e) => setSoundEffects(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Security & Actions */}
          <div className="space-y-6">
            
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Lock className="h-4 w-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Security Profile</h3>
                </div>
                <span className="text-[10px] text-purple-400 font-mono">AUTH</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Access Protocol</label>
                  <select
                    value={securityLevel}
                    onChange={(e) => setSecurityLevel(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
                  >
                    <option>HIGH (PIN + JWT)</option>
                    <option>STANDARD (PIN ONLY)</option>
                    <option>DEVELOPER BYPASS</option>
                  </select>
                </div>

                <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 text-[10px] text-slate-400 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span>ENCRYPTION:</span>
                    <span className="text-emerald-400">BCRYPT_10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SESSION TTL:</span>
                    <span className="text-cyan-400">8 HOURS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ROLE:</span>
                    <span className="text-purple-400">STORE_ADMIN</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-cyan-500/50 bg-cyan-500/20 py-3 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                >
                  <Save className="h-4 w-4" />
                  <span>APPLY SYSTEM SETTINGS</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
                <UserCheck className="h-4 w-4 text-emerald-400" />
                <span>Active Operator Session</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Authenticated as store manager with full inventory write privileges and ledger access.</p>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-[10px] text-slate-500 font-mono">
                <span>NODE_VER: v2.4.1</span>
                <span className="text-emerald-400">ONLINE</span>
              </div>
            </div>

          </div>

        </form>

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
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-bold transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings className="h-4 w-4 text-cyan-400" />
                      <span>System Settings</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-cyan-500" />
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
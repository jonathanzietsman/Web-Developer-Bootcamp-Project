"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { pushTelemetry } from "@/utils/telemetry";
import { 
  Terminal, 
  Tag, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  RefreshCw, 
  Home, 
  ShoppingCart, 
  Layers, 
  BarChart3, 
  Database, 
  Percent,
  X,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Zap,
  HelpCircle,
  AlertCircle
} from "lucide-react";

export default function PromotionsPage() {
  const utils = api.useUtils();
  const { data: promotions, isLoading } = api.promotion.getAll.useQuery();
  
  const [name, setName] = useState("");
  const [skuPattern, setSkuPattern] = useState("");
  const [requiredQty, setRequiredQty] = useState<number>(2);
  const [bundlePrice, setBundlePrice] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);

  const createMutation = api.promotion.create.useMutation({
    onSuccess: () => {
      void utils.promotion.invalidate();
      pushTelemetry("API", `Successfully created new promotion rule: ${name}`);
      setName("");
      setSkuPattern("");
      setRequiredQty(2);
      setBundlePrice("");
    },
  });

  const deleteMutation = api.promotion.delete.useMutation({
    onSuccess: () => {
      void utils.promotion.invalidate();
      pushTelemetry("API", `Removed promotion node from active engine.`);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !skuPattern || !bundlePrice) return;
    pushTelemetry("CLICK", `Triggered promotion creation for: ${name}`);
    createMutation.mutate({
      name,
      targetSkuPattern: skuPattern.toLowerCase().trim(),
      requiredQty: Number(requiredQty),
      bundlePrice: Number(bundlePrice),
    });
  };

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#090D16] text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* TOP HEADER */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/5 bg-[#0D1322]/80 backdrop-blur-xl shadow-sm shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            type="button"
            onClick={() => {
              setIsNavOpen(true);
              pushTelemetry("NAV", "Opened main navigation menu from Promotions");
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-indigo-400 hover:bg-white/10 hover:border-indigo-500/30 transition shadow-inner cursor-pointer group"
            title="Open System Navigation"
          >
            <Terminal className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 sm:gap-2.5">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <Tag className="h-4 w-4 text-indigo-400 hidden sm:inline" />
                Promotions & Special Deals Manager
              </h1>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>LIVE RULE SYNC</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block mt-0.5">Automated cart discounts, SKU keyword triggers, and register bundle logic</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-1.5 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Active Discount Engine</span>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <div className="relative flex flex-1 overflow-y-auto lg:overflow-hidden p-4 sm:p-6 lg:p-8 gap-6 max-w-[1500px] w-full mx-auto flex-col lg:flex-row custom-scrollbar">
        
        {/* CREATE FORM PANEL */}
        <div className="w-full lg:w-[420px] bg-[#0E1526]/80 border border-white/5 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col shrink-0 h-fit space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Configure Bundle Rule
            </h2>
            <Sparkles className="h-4 w-4 text-indigo-400/50" />
          </div>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1.5">Special Title</label>
              <input 
                type="text"
                placeholder="e.g. 4g Hydro Special or Edible Combo" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#070A12] p-3 rounded-xl border border-white/10 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition shadow-inner"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-medium">SKU Pattern Matcher</label>
                <span className="text-[10px] text-indigo-400 flex items-center gap-1 font-mono">
                  <Zap className="h-3 w-3" /> Auto-Trigger
                </span>
              </div>
              <input 
                type="text"
                placeholder="e.g. hydro, gummy, or PR-" 
                value={skuPattern} 
                onChange={e => setSkuPattern(e.target.value)}
                className="w-full bg-[#070A12] p-3 rounded-xl border border-white/10 text-white font-mono placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition shadow-inner"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed flex items-start gap-1">
                <HelpCircle className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                <span>Triggers automatically in the POS register when matching product SKUs are added.</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1.5">Required Units</label>
                <input 
                  type="number" 
                  min="1"
                  value={requiredQty} 
                  onChange={e => setRequiredQty(Number(e.target.value))}
                  className="w-full bg-[#070A12] p-3 rounded-xl border border-white/10 text-white focus:border-indigo-500 focus:outline-none transition shadow-inner [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  required
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1.5">Bundle Price (R)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="250.00" 
                  value={bundlePrice} 
                  onChange={e => setBundlePrice(e.target.value)}
                  className="w-full bg-[#070A12] p-3 rounded-xl border border-white/10 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition shadow-inner [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {createMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              <span>Save & Deploy Bundle Special</span>
            </button>
          </form>
        </div>

        {/* ACTIVE PROMOTIONS LIST */}
        <div className="flex-1 bg-[#0E1526]/80 border border-white/5 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Percent className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Active POS Register Rules
                </h2>
                <p className="text-[11px] text-slate-500 hidden sm:block">Rules evaluated during checkout transactions</p>
              </div>
            </div>
            <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
              {promotions?.length ?? 0} ACTIVE RULES
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {isLoading ? (
              <div className="h-64 lg:h-full flex items-center justify-center text-indigo-400 text-xs gap-3">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Loading active promotional structures...</span>
              </div>
            ) : promotions?.length === 0 ? (
              <div className="h-64 lg:h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-3 py-12">
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <Tag className="h-6 w-6" />
                </div>
                <span className="font-medium text-slate-400">No active promotions found. Create one using the form.</span>
              </div>
            ) : (
              <AnimatePresence>
                {promotions?.map((promo) => (
                  <motion.div 
                    key={promo.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#070A12] p-4 rounded-xl border border-white/5 text-xs hover:border-indigo-500/30 transition shadow-inner group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white text-sm group-hover:text-indigo-300 transition">{promo.name}</p>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                          ID: {promo.id.slice(-6)}
                        </span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        Trigger: Buy <span className="text-indigo-400 font-bold">{promo.requiredQty}×</span> matching <span className="text-indigo-400 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">&quot;{promo.targetSkuPattern}&quot;</span> for <span className="text-emerald-400 font-bold">R{Number(promo.bundlePrice).toFixed(2)}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <button 
                        onClick={() => {
                          pushTelemetry("CLICK", `Deactivated promotion rule: ${promo.name}`);
                          deleteMutation.mutate({ id: promo.id });
                        }}
                        disabled={deleteMutation.isPending}
                        className="w-full sm:w-auto bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3.5 py-2 rounded-xl hover:bg-rose-500/20 transition cursor-pointer flex items-center justify-center gap-1.5 font-semibold text-xs disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Deactivate Rule</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
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
                      <ShoppingCart className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition" />
                      <span className="font-medium">POS Terminal</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link 
                    href="/manager/promotions" 
                    onClick={() => { setIsNavOpen(false); pushTelemetry("NAV", "Navigated to Promotions Manager (/manager/promotions)"); }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-white font-semibold transition cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Tag className="h-4 w-4 text-indigo-400" />
                      <span>Promotions Manager</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-indigo-400" />
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
                    href="/analytics" 
                    onClick={() => { setIsNavOpen(false); pushTelemetry("NAV", "Navigated to Sales Analytics (/analytics)"); }}
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
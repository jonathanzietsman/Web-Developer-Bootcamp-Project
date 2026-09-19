"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import Link from "next/link";
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
  ChevronRight
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
      pushTelemetry("API", `Successfully created new promotion node: ${name}`);
      setName("");
      setSkuPattern("");
      setRequiredQty(2);
      setBundlePrice("");
    },
  });

  const deleteMutation = api.promotion.delete.useMutation({
    onSuccess: () => {
      void utils.promotion.invalidate();
      pushTelemetry("API", `Removed promotion node from register index.`);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !skuPattern || !bundlePrice) return;
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
                <Tag className="h-4 w-4 text-indigo-400" />
                Promotions & Bundle Engine Manager
              </h1>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE DB SYNC
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Manage store-wide bundle specials and promotional pricing rules on the fly</p>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <div className="relative flex flex-1 overflow-hidden p-6 lg:p-8 gap-6 max-w-[1400px] w-full mx-auto flex-col lg:flex-row">
        
        {/* CREATE FORM PANEL */}
        <div className="w-full lg:w-[420px] bg-[#0E1526]/80 border border-white/5 rounded-2xl p-6 backdrop-blur-xl shadow-xl flex flex-col shrink-0 h-fit">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Bundle Deal
          </h2>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Special Name</label>
              <input 
                type="text"
                placeholder="e.g. 4g Hydro Special" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#070A12] p-3 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition shadow-inner"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">SKU Keyword Match</label>
              <input 
                type="text"
                placeholder="e.g. hydro or gummy" 
                value={skuPattern} 
                onChange={e => setSkuPattern(e.target.value)}
                className="w-full bg-[#070A12] p-3 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition shadow-inner"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">Triggers automatically when scanned item includes this text.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">Required Qty</label>
                <input 
                  type="number" 
                  min="1"
                  value={requiredQty} 
                  onChange={e => setRequiredQty(Number(e.target.value))}
                  className="w-full bg-[#070A12] p-3 rounded-xl border border-white/10 text-white focus:border-indigo-500 focus:outline-none transition shadow-inner"
                  required
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">Bundle Price (R)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="250.00" 
                  value={bundlePrice} 
                  onChange={e => setBundlePrice(e.target.value)}
                  className="w-full bg-[#070A12] p-3 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition shadow-inner"
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
              <span>Save & Activate Special</span>
            </button>
          </form>
        </div>

        {/* ACTIVE PROMOTIONS LIST */}
        <div className="flex-1 bg-[#0E1526]/80 border border-white/5 rounded-2xl p-6 backdrop-blur-xl shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 shrink-0">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Percent className="h-4 w-4 text-indigo-400" />
              Active Register Promotions
            </h2>
            <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300 border border-white/10">
              {promotions?.length ?? 0} ACTIVE RULES
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-indigo-400 text-xs gap-3">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Loading active promotional structures...</span>
              </div>
            ) : promotions?.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <Tag className="h-8 w-8 text-slate-600" />
                <span>No active promotions found. Create one using the form.</span>
              </div>
            ) : (
              promotions?.map(promo => (
                <div key={promo.id} className="flex justify-between items-center bg-[#070A12] p-4 rounded-xl border border-white/5 text-xs hover:border-indigo-500/30 transition shadow-inner">
                  <div className="space-y-1">
                    <p className="font-bold text-white text-sm">{promo.name}</p>
                    <p className="text-slate-400">
                      Trigger: Buy <span className="text-indigo-400 font-bold">{promo.requiredQty}</span> matching <span className="text-indigo-400 font-mono">&quot;{promo.targetSkuPattern}&quot;</span> for <span className="text-emerald-400 font-bold">R{Number(promo.bundlePrice).toFixed(2)}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => deleteMutation.mutate({ id: promo.id })}
                    className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3.5 py-2 rounded-xl hover:bg-rose-500/20 transition cursor-pointer flex items-center gap-1.5 font-semibold"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Disable</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* NAVIGATION DRAWER */}
      {isNavOpen && (
        <div className="fixed inset-0 z-[100] pointer-events-auto">
          <div onClick={() => setIsNavOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute inset-y-0 left-0 w-80 bg-[#0A0E1A] border-r border-white/10 p-6 flex flex-col justify-between shadow-2xl z-10">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white tracking-wider uppercase">APEX_OS</h2>
                    <p className="text-[11px] text-slate-400">Navigation Hub</p>
                  </div>
                </div>
                <button onClick={() => setIsNavOpen(false)} className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-2 text-xs">
                <Link href="/" onClick={() => setIsNavOpen(false)} className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 hover:bg-white/5 transition">
                  <div className="flex items-center gap-3"><Home className="h-4 w-4 text-slate-400" /><span>Command Center</span></div>
                </Link>
                <Link href="/pos" onClick={() => setIsNavOpen(false)} className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 hover:bg-white/5 transition">
                  <div className="flex items-center gap-3"><ShoppingCart className="h-4 w-4 text-slate-400" /><span>POS Terminal</span></div>
                </Link>
                <Link href="/manager/promotions" onClick={() => setIsNavOpen(false)} className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-white font-semibold">
                  <div className="flex items-center gap-3"><Tag className="h-4 w-4 text-indigo-400" /><span>Promotions Manager</span></div>
                </Link>
                <Link href="/inventory" onClick={() => setIsNavOpen(false)} className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 hover:bg-white/5 transition">
                  <div className="flex items-center gap-3"><Layers className="h-4 w-4 text-slate-400" /><span>Inventory Matrix</span></div>
                </Link>
                <Link href="/analytics" onClick={() => setIsNavOpen(false)} className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 hover:bg-white/5 transition">
                  <div className="flex items-center gap-3"><BarChart3 className="h-4 w-4 text-slate-400" /><span>Sales Analytics</span></div>
                </Link>
                <Link href="/database" onClick={() => setIsNavOpen(false)} className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 hover:bg-white/5 transition">
                  <div className="flex items-center gap-3"><Database className="h-4 w-4 text-slate-400" /><span>Database Nodes</span></div>
                </Link>
              </nav>
            </div>
            <div className="pt-4 border-t border-white/5 text-[11px] text-slate-500 flex justify-between">
              <span>System Build v2.4</span><span className="text-emerald-400 font-mono">Secure</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
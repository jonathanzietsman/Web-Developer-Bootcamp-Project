// src/app/cash/page.tsx
"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, 
  Terminal, 
  Activity, 
  ShieldCheck, 
  Home, 
  Layers, 
  BarChart3, 
  Database, 
  X, 
  ChevronRight, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Trash2,
  Download,
  Wallet,
  CreditCard
} from "lucide-react";

// CSV Conversion Helper
function convertToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; header: string }[]
): string {
  const headers = columns.map((col) => `"${col.header}"`).join(",");
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const val = row[col.key];
        const stringVal = val === null || val === undefined ? "" : String(val);
        return `"${stringVal.replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  return [headers, ...rows].join("\r\n");
}

export default function CashPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [method, setMethod] = useState<"CASH" | "CARD">("CASH");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [activeTab, setActiveTab] = useState<"CASH" | "CARD">("CASH");

  const utils = api.useUtils();

  // Queries
  const { data: summary, isLoading: isSummaryLoading } = api.cashLog.getSummary.useQuery();
  const { data: logs, isLoading: isLogsLoading } = api.cashLog.getAll.useQuery();

  // Filter logs based on method tabs
  const cashLogs = logs?.filter((log) => (log.method ?? "CASH") !== "CARD") ?? [];
  const cardLogs = logs?.filter((log) => log.method === "CARD") ?? [];
  const activeLogs = activeTab === "CASH" ? cashLogs : cardLogs;

  // Mutations
  const createLog = api.cashLog.create.useMutation({
    onSuccess: async () => {
      setAmount("");
      setReason("");
      await utils.cashLog.invalidate();
    },
  });

  const deleteLog = api.cashLog.delete.useMutation({
    onSuccess: async () => {
      await utils.cashLog.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent, selectedMethod: "CASH" | "CARD" = "CASH") => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !reason.trim()) return;

    createLog.mutate({
      type,
      method: selectedMethod,
      amount: parsedAmount,
      reason: reason.trim(),
    });
  };

  const handleExportCSV = () => {
    if (!logs || logs.length === 0) return;

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      type: log.type,
      method: log.method ?? "CASH",
      amount: log.amount.toFixed(2),
      reason: log.reason,
      user: log.user?.name ?? log.user?.email ?? "System",
      createdAt: new Date(log.createdAt).toLocaleString(),
    }));

    const csvContent = convertToCSV(formattedLogs, [
      { key: "id", header: "Transaction ID" },
      { key: "type", header: "Type" },
      { key: "method", header: "Method" },
      { key: "amount", header: "Amount (R)" },
      { key: "reason", header: "Reason" },
      { key: "user", header: "Logged By" },
      { key: "createdAt", header: "Date & Time" },
    ]);

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const timestamp = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `cash_card_audit_${timestamp}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#090D16] text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Subtle modern ambient background gradients */}
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
                <Wallet className="h-4 w-4 text-indigo-400" />
                Cash Drawer & Sales Ledger
              </h1>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                SYSTEM ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Monitor physical cash liquidity, card processing volume, and audit transactions</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-1.5 text-xs text-slate-300">
            <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>Drawer Relay: Secure</span>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-1.5 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Encrypted Ledger</span>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT BODY */}
      <div className="relative flex flex-1 flex-col overflow-y-auto p-6 lg:p-8 space-y-6 max-w-[1700px] w-full mx-auto">
        
        {/* Action Header Banner with CSV Export */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0E1526]/80 border border-white/5 p-6 rounded-2xl backdrop-blur-xl shadow-xl shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 shadow-inner">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Liquidity & Sales Analytics</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Real-time ledger tracking for cash drawer liquidity and card transactions</p>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={!logs || logs.length === 0}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition cursor-pointer disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            <span>EXPORT AUDIT CSV</span>
          </button>
        </div>

        {/* Metrics Grid (Correctly accounting for Card Payouts/Refunds & Net Totals) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6 shrink-0">
          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-6 backdrop-blur-xl shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Current Till Balance</span>
              <Wallet className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {isSummaryLoading ? "..." : `R${(summary?.balance ?? 0).toFixed(2)}`}
            </p>
            <p className="text-[11px] text-slate-500">Physical drawer liquidity</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-6 backdrop-blur-xl shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Net Card Payments</span>
              <CreditCard className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-cyan-400">
              {isSummaryLoading ? "..." : `R${(summary?.totalCard ?? 0).toFixed(2)}`}
            </p>
            <p className="text-[11px] text-slate-500">Card sales minus card refunds</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-6 backdrop-blur-xl shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Card Out (Refunds)</span>
              <TrendingDown className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400">
              {isSummaryLoading ? "..." : `-R${(summary?.totalCardOut ?? 0).toFixed(2)}`}
            </p>
            <p className="text-[11px] text-slate-500">Cumulative card deductions</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-6 backdrop-blur-xl shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Gross Total</span>
              <DollarSign className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-indigo-400">
              {isSummaryLoading ? "..." : `R${(summary?.grossTotal ?? 0).toFixed(2)}`}
            </p>
            <p className="text-[11px] text-slate-500">Combined net cash + net card</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-6 backdrop-blur-xl shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Cash In (Drops)</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              {isSummaryLoading ? "..." : `+R${(summary?.totalIn ?? 0).toFixed(2)}`}
            </p>
            <p className="text-[11px] text-slate-500">Cumulative positive cash</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-6 backdrop-blur-xl shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Cash Out (Payouts)</span>
              <TrendingDown className="h-4 w-4 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-rose-400">
              {isSummaryLoading ? "..." : `-R${(summary?.totalOut ?? 0).toFixed(2)}`}
            </p>
            <p className="text-[11px] text-slate-500">Cumulative drawer withdrawals</p>
          </div>
        </div>

        {/* Adjustment Form */}
        <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-6 backdrop-blur-xl shadow-xl shrink-0">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-5">Record Manual Float Adjustment / Cash Drop / Card Refund</h2>
          <form className="space-y-4" onSubmit={(e) => handleSubmit(e, method)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Method</label>
                <select
                  className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none transition shadow-inner"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as "CASH" | "CARD")}
                >
                  <option value="CASH">CASH</option>
                  <option value="CARD">CARD</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Amount (R)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">R</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition shadow-inner"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Reason / Note</label>
                <input
                  type="text"
                  placeholder="e.g., Initial float, Card customer refund"
                  className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition shadow-inner"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                onClick={() => setType("IN")}
                disabled={createLog.isPending}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {createLog.isPending && type === "IN" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                <span>{createLog.isPending && type === "IN" ? "PROCESSING..." : "RECORD IN (+)"}</span>
              </button>
              <button
                type="submit"
                onClick={() => setType("OUT")}
                disabled={createLog.isPending}
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 py-3 text-xs font-bold text-white shadow-lg shadow-rose-600/20 transition cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {createLog.isPending && type === "OUT" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TrendingDown className="h-4 w-4" />}
                <span>{createLog.isPending && type === "OUT" ? "PROCESSING..." : "RECORD OUT (-)"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Split Ledger History Table */}
        <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Recent Activity Ledger</h2>
            
            {/* Tab Switcher */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("CASH")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "CASH" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                Cash Ledger ({cashLogs.length})
              </button>
              <button
                onClick={() => setActiveTab("CARD")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "CARD" ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30" : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                Card Ledger ({cardLogs.length})
              </button>
            </div>
          </div>

          {isLogsLoading ? (
            <div className="flex h-32 items-center justify-center text-indigo-400 text-xs gap-3">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span className="font-medium">Loading transaction logs...</span>
            </div>
          ) : activeLogs.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
              <span className="font-medium text-slate-400">No {activeTab.toLowerCase()} transactions logged yet.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-white/5 text-[10px] uppercase text-slate-500 font-semibold">
                  <tr>
                    <th className="pb-3 px-3">Type</th>
                    <th className="pb-3 px-3">Method</th>
                    <th className="pb-3 px-3">Amount</th>
                    <th className="pb-3 px-3">Reason</th>
                    <th className="pb-3 px-3">Logged By</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                            log.type === "IN"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10">
                          {log.method ?? "CASH"}
                        </span>
                      </td>
                      <td className={`py-3.5 px-3 font-bold font-mono ${log.type === "IN" ? "text-emerald-400" : "text-rose-400"}`}>
                        {log.type === "IN" ? "+R" : "-R"}{log.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-slate-200">{log.reason}</td>
                      <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                        {log.user?.name ?? log.user?.email ?? "System"}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => deleteLog.mutate({ id: log.id })}
                          disabled={deleteLog.isPending}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer inline-flex items-center justify-center"
                          title="Delete Log"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                    href="/pos" 
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/10 hover:text-white hover:bg-white/5 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Home className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition" />
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

                  <Link 
                    href="/cash" 
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-white font-semibold transition cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-indigo-400" />
                      <span>Cash Drawer & Sales</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-indigo-400" />
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
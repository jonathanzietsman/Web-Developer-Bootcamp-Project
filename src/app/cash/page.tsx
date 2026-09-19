// src/app/cash/page.tsx
"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { pushTelemetry } from "@/utils/telemetry";
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
  CreditCard,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Receipt
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
      pushTelemetry("API", `Recorded manual cash/card adjustment [${type} - ${method}]: R${amount}`);
      setAmount("");
      setReason("");
      await utils.cashLog.invalidate();
    },
  });

  const deleteLog = api.cashLog.delete.useMutation({
    onSuccess: async () => {
      pushTelemetry("API", "Removed transaction log entry from cash ledger.");
      await utils.cashLog.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent, selectedMethod: "CASH" | "CARD" = "CASH") => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !reason.trim()) return;

    pushTelemetry("CLICK", `Triggered cash adjustment submit [${type}]: R${parsedAmount}`);
    createLog.mutate({
      type,
      method: selectedMethod,
      amount: parsedAmount,
      reason: reason.trim(),
    });
  };

  const handleExportCSV = () => {
    if (!logs || logs.length === 0) return;

    pushTelemetry("EXPORT", `Exported cash ledger audit CSV (${logs.length} records)`);

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
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/5 bg-[#0D1322]/80 backdrop-blur-xl shadow-sm shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            type="button"
            onClick={() => {
              setIsNavOpen(true);
              pushTelemetry("NAV", "Opened main navigation menu from Cash Drawer");
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-indigo-400 hover:bg-white/10 hover:border-indigo-500/30 transition shadow-inner cursor-pointer group"
            title="Open System Navigation"
          >
            <Terminal className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 sm:gap-2.5">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <Wallet className="h-4 w-4 text-indigo-400 hidden sm:inline" />
                Cash Drawer & Sales Ledger
              </h1>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>DRAWER RELAY ACTIVE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block mt-0.5">Physical cash drawer liquidity, card volume tracking, and real-time ledger audits</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-1.5 text-xs text-slate-300">
            <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>Hardware Relay Connected</span>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-1.5 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Encrypted Ledger</span>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT BODY */}
      <div className="relative flex flex-1 flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1700px] w-full mx-auto custom-scrollbar">
        
        {/* Action Header Banner with CSV Export */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0E1526]/80 border border-white/5 p-5 sm:p-6 rounded-2xl backdrop-blur-xl shadow-xl shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 shadow-inner">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Liquidity & Sales Analytics</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Real-time ledger tracking for physical till balances and electronic card transactions</p>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={!logs || logs.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition cursor-pointer disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            <span>EXPORT AUDIT CSV</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 shrink-0">
          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">Current Till Balance</span>
              <Wallet className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">
              {isSummaryLoading ? "..." : `R${(summary?.balance ?? 0).toFixed(2)}`}
            </p>
            <p className="text-[11px] text-slate-500">Physical drawer liquidity</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">Net Card Payments</span>
              <CreditCard className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-cyan-400 tracking-tight">
              {isSummaryLoading ? "..." : `R${(summary?.totalCard ?? 0).toFixed(2)}`}
            </p>
            <p className="text-[11px] text-slate-500">Card sales minus card refunds</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">Card Refunds / Out</span>
              <ArrowDownRight className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400 tracking-tight">
              {isSummaryLoading ? "..." : `-R${(summary?.totalCardOut ?? 0).toFixed(2)}`}
            </p>
            <p className="text-[11px] text-slate-500">Cumulative card deductions</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">Gross Ledger Total</span>
              <DollarSign className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-indigo-400 tracking-tight">
              {isSummaryLoading ? "..." : `R${(summary?.grossTotal ?? 0).toFixed(2)}`}
            </p>
            <p className="text-[11px] text-slate-500">Combined net cash + net card</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">Total Cash In (Drops)</span>
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 tracking-tight">
              {isSummaryLoading ? "..." : `+R${(summary?.totalIn ?? 0).toFixed(2)}`}
            </p>
            <p className="text-[11px] text-slate-500">Cumulative positive cash</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">Total Cash Out (Payouts)</span>
              <ArrowDownRight className="h-4 w-4 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-rose-400 tracking-tight">
              {isSummaryLoading ? "..." : `-R${(summary?.totalOut ?? 0).toFixed(2)}`}
            </p>
            <p className="text-[11px] text-slate-500">Cumulative drawer withdrawals</p>
          </div>
        </div>

        {/* Adjustment Form */}
        <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl shrink-0 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Receipt className="h-4 w-4 text-indigo-400" />
              Manual Float Adjustment / Cash Drop / Card Refund
            </h2>
            <span className="text-[11px] text-slate-500">Instant Till Sync</span>
          </div>

          <form className="space-y-4" onSubmit={(e) => handleSubmit(e, method)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Payment Method</label>
                <select
                  className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-3 text-xs text-white focus:border-indigo-500 focus:outline-none transition shadow-inner cursor-pointer"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as "CASH" | "CARD")}
                >
                  <option value="CASH">CASH (Physical Drawer)</option>
                  <option value="CARD">CARD (Terminal Relay)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Amount (R)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">R</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-3 pl-10 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition shadow-inner [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Reason / Audit Note</label>
                <input
                  type="text"
                  placeholder="e.g., Opening float, Petty cash drop, Customer refund"
                  className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-3 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition shadow-inner"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                onClick={() => setType("IN")}
                disabled={createLog.isPending}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {createLog.isPending && type === "IN" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                <span>{createLog.isPending && type === "IN" ? "PROCESSING..." : "RECORD DEPOSIT / IN (+)"}</span>
              </button>
              <button
                type="submit"
                onClick={() => setType("OUT")}
                disabled={createLog.isPending}
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 py-3 text-xs font-bold text-white shadow-lg shadow-rose-600/20 transition cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {createLog.isPending && type === "OUT" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TrendingDown className="h-4 w-4" />}
                <span>{createLog.isPending && type === "OUT" ? "PROCESSING..." : "RECORD PAYOUT / OUT (-)"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Split Ledger History Table */}
        <div className="rounded-2xl border border-white/5 bg-[#0E1526]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Recent Activity Ledger</h2>
              <p className="text-[11px] text-slate-500">Historical trail of float changes and manual entries</p>
            </div>
            
            {/* Tab Switcher */}
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("CASH")}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === "CASH" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                <Wallet className="h-3.5 w-3.5" />
                <span>Cash ({cashLogs.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("CARD")}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === "CARD" ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30" : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Card ({cardLogs.length})</span>
              </button>
            </div>
          </div>

          {isLogsLoading ? (
            <div className="flex h-40 items-center justify-center text-indigo-400 text-xs gap-3">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span className="font-medium">Loading transaction logs...</span>
            </div>
          ) : activeLogs.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
              <Wallet className="h-8 w-8 text-slate-600 mb-1" />
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
                    <th className="pb-3 px-3">Timestamp</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {activeLogs.map((log) => (
                      <motion.tr 
                        key={log.id} 
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/[0.02] transition group"
                      >
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                              log.type === "IN"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {log.type === "IN" ? "+ IN" : "- OUT"}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10">
                            {log.method ?? "CASH"}
                          </span>
                        </td>
                        <td className={`py-3.5 px-3 font-bold font-mono text-sm ${log.type === "IN" ? "text-emerald-400" : "text-rose-400"}`}>
                          {log.type === "IN" ? "+R" : "-R"}{log.amount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-3 text-slate-200 font-medium">{log.reason}</td>
                        <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                          {log.user?.name ?? log.user?.email ?? "System"}
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 text-[11px] font-mono">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => deleteLog.mutate({ id: log.id })}
                            disabled={deleteLog.isPending}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer inline-flex items-center justify-center opacity-80 group-hover:opacity-100 disabled:opacity-40"
                            title="Delete Log"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
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
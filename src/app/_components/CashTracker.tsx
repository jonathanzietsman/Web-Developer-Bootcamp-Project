"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

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

export function CashTracker() {
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const utils = api.useUtils();

  // Queries
  const { data: summary, isLoading: isSummaryLoading } =
    api.cashLog.getSummary.useQuery();
  const { data: logs, isLoading: isLogsLoading } =
    api.cashLog.getAll.useQuery();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !reason.trim()) return;

    createLog.mutate({
      type,
      amount: parsedAmount,
      reason: reason.trim(),
    });
  };

  const handleExportCSV = () => {
    if (!logs || logs.length === 0) return;

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      type: log.type,
      amount: log.amount.toFixed(2),
      reason: log.reason,
      user: log.user?.name ?? log.user?.email ?? "System",
      createdAt: new Date(log.createdAt).toLocaleString(),
    }));

    const csvContent = convertToCSV(formattedLogs, [
      { key: "id", header: "Transaction ID" },
      { key: "type", header: "Type" },
      { key: "amount", header: "Amount ($)" },
      { key: "reason", header: "Reason" },
      { key: "user", header: "Logged By" },
      { key: "createdAt", header: "Date & Time" },
    ]);

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const timestamp = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `cash_log_audit_${timestamp}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Cash Drawer Tracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor till totals, record payouts, and export cash logs.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={!logs || logs.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Drawer Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Current Balance
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {isSummaryLoading
              ? "..."
              : `$${(summary?.balance ?? 0).toFixed(2)}`}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Total Cash In
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {isSummaryLoading
              ? "..."
              : `+$${(summary?.totalIn ?? 0).toFixed(2)}`}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
            Total Cash Out
          </p>
          <p className="mt-2 text-3xl font-bold text-rose-600 dark:text-rose-400">
            {isSummaryLoading
              ? "..."
              : `-$${(summary?.totalOut ?? 0).toFixed(2)}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Log Entry Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Log Transaction
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Transaction Type
              </label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("IN")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    type === "IN"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  Cash In (+)
                </button>
                <button
                  type="button"
                  onClick={() => setType("OUT")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    type === "OUT"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  Cash Out (-)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Reason / Note
              </label>
              <input
                type="text"
                placeholder="e.g., Initial float, Petty cash payout"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={createLog.isPending}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              {createLog.isPending ? "Saving..." : "Record Entry"}
            </button>
          </form>
        </div>

        {/* Audit Log History */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Recent Cash Activity
          </h2>
          {isLogsLoading ? (
            <p className="text-sm text-slate-500">Loading cash logs...</p>
          ) : !logs || logs.length === 0 ? (
            <p className="text-sm text-slate-500">
              No cash transactions logged yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Reason</th>
                    <th className="pb-3">User</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-3 font-semibold">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                            log.type === "IN"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                          }`}
                        >
                          {log.type}
                        </span>
                      </td>
                      <td
                        className={`py-3 font-bold ${
                          log.type === "IN"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {log.type === "IN" ? "+" : "-"}${log.amount.toFixed(2)}
                      </td>
                      <td className="py-3 text-slate-700 dark:text-slate-300">
                        {log.reason}
                      </td>
                      <td className="py-3 text-xs text-slate-500 dark:text-slate-400">
                        {log.user?.name ?? log.user?.email ?? "System"}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => deleteLog.mutate({ id: log.id })}
                          disabled={deleteLog.isPending}
                          className="text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400"
                        >
                          Delete
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
    </div>
  );
}
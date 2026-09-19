"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function ProductsPage() {
  const utils = api.useUtils();
  const { data: products, isLoading } = api.product.getAll.useQuery();

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [price, setPrice] = useState("");
  const [stockQty, setStockQty] = useState("");

  const createMutation = api.product.create.useMutation({
    onSuccess: () => {
      void utils.product.getAll.invalidate();
      setName("");
      setSku("");
      setCostPrice("");
      setPrice("");
      setStockQty("");
    },
  });

  const deleteMutation = api.product.delete.useMutation({
    onSuccess: () => {
      void utils.product.getAll.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name,
      sku,
      costPrice: parseFloat(costPrice),
      price: parseFloat(price),
      stockQty: parseInt(stockQty, 10),
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">Inventory & Product Management</h1>

        {/* Create Product Form */}
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-slate-800 bg-slate-800/30 p-6">
          <h2 className="mb-4 text-xl font-semibold">Add New Product</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <input
              type="text"
              placeholder="Product Name"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder="SKU Code"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Cost Price ($)"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Selling Price ($)"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Initial Stock Qty"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating..." : "Save Product"}
          </button>
        </form>

        {/* Products Table */}
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-800/20">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Stock Quantity</th>
                <th className="px-6 py-3">Cost Price</th>
                <th className="px-6 py-3">Selling Price</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-slate-400">
                    Loading inventory...
                  </td>
                </tr>
              ) : (
                products?.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-medium text-slate-100">{p.name}</td>
                    <td className="px-6 py-4 text-slate-400">{p.sku}</td>
                    <td className="px-6 py-4">{p.stockQty}</td>
                    <td className="px-6 py-4 text-slate-300">
                      ${p.costPrice?.toFixed(2) ?? "0.00"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-400">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteMutation.mutate({ id: p.id })}
                        className="font-medium text-rose-400 hover:text-rose-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
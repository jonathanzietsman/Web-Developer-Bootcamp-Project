"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function StockJournal() {
  const utils = api.useUtils();

  // Form state for adding products
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stockQty, setStockQty] = useState("");

  // tRPC Queries & Mutations
  const { data: products, isLoading } = api.product.getAll.useQuery();

  const createProduct = api.product.create.useMutation({
    onSuccess: async () => {
      setName("");
      setSku("");
      setPrice("");
      setStockQty("");
      await utils.product.getAll.invalidate();
    },
  });

  const updateStock = api.product.updateStock.useMutation({
    onSuccess: async () => {
      await utils.product.getAll.invalidate();
    },
  });

  const deleteProduct = api.product.delete.useMutation({
    onSuccess: async () => {
      await utils.product.getAll.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !price || !stockQty) return;

    createProduct.mutate({
      name,
      sku,
      price: parseFloat(price),
      stockQty: parseInt(stockQty, 10),
    });
  };

  return (
    <div className="space-y-8">
      {/* Product Creation Form */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-bold text-white">Add New Product</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded bg-slate-800 p-2.5 text-sm text-white border border-slate-700 focus:outline-none focus:border-blue-500"
            required
          />
          <input
            type="text"
            placeholder="SKU Code"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="rounded bg-slate-800 p-2.5 text-sm text-white border border-slate-700 focus:outline-none focus:border-blue-500"
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price ($)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded bg-slate-800 p-2.5 text-sm text-white border border-slate-700 focus:outline-none focus:border-blue-500"
            required
          />
          <input
            type="number"
            placeholder="Initial Stock Qty"
            value={stockQty}
            onChange={(e) => setStockQty(e.target.value)}
            className="rounded bg-slate-800 p-2.5 text-sm text-white border border-slate-700 focus:outline-none focus:border-blue-500"
            required
          />
          <button
            type="submit"
            disabled={createProduct.isPending}
            className="rounded bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition"
          >
            {createProduct.isPending ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>

      {/* Product Inventory Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-bold text-white">Inventory Journal</h2>
        {isLoading ? (
          <p className="text-slate-400">Loading inventory...</p>
        ) : !products || products.length === 0 ? (
          <p className="text-slate-400">No products added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock Quantity</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-slate-400">{item.sku}</td>
                    <td className="px-4 py-3 font-medium text-white">{item.name}</td>
                    <td className="px-4 py-3">${item.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{item.stockQty}</span>
                        <button
                          onClick={() =>
                            updateStock.mutate({
                              id: item.id,
                              stockQty: Math.max(0, item.stockQty - 1),
                            })
                          }
                          className="rounded bg-slate-800 px-2 py-0.5 text-xs text-red-400 border border-slate-700 hover:bg-slate-700"
                        >
                          -1
                        </button>
                        <button
                          onClick={() =>
                            updateStock.mutate({
                              id: item.id,
                              stockQty: item.stockQty + 1,
                            })
                          }
                          className="rounded bg-slate-800 px-2 py-0.5 text-xs text-green-400 border border-slate-700 hover:bg-slate-700"
                        >
                          +1
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteProduct.mutate({ id: item.id })}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Remove
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
  );
}
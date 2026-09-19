"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { pushTelemetry } from "@/utils/telemetry";
import { 
  Layers, 
  Terminal, 
  Search, 
  Plus, 
  Sliders, 
  AlertTriangle, 
  ShieldCheck, 
  Home, 
  BarChart3, 
  Database, 
  X, 
  ChevronRight, 
  CheckCircle2, 
  RefreshCw,
  Cpu,
  Scale,
  Trash2,
  Package,
  TrendingUp,
  Boxes,
  Sparkles,
  ShoppingCart,
  Tag
} from "lucide-react";

export default function InventoryPage() {
  const utils = api.useUtils();
  const { data: products, isLoading } = api.product.getAll.useQuery();

  const [isNavOpen, setIsNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "IN_STOCK" | "OUT_OF_STOCK">("ALL");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<{
    id: string;
    name: string;
    sku: string;
    category: string;
    costPrice: number;
    price: number;
    stockQty: number;
    unitType: string;
  } | null>(null);

  // New Item Form State
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newCategory, setNewCategory] = useState("edibles");
  const [newCostPrice, setNewCostPrice] = useState<number>(0);
  const [newSellPrice, setNewSellPrice] = useState<number>(0);
  const [newStockQty, setNewStockQty] = useState<number>(0);
  const [newUnitType, setNewUnitType] = useState("UNITS");

  // Mutations
  const createProductMutation = api.product.create.useMutation({
    onSuccess: () => {
      void utils.product.getAll.invalidate();
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const updateProductMutation = api.product.updateProduct.useMutation({
    onSuccess: () => {
      void utils.product.getAll.invalidate();
      setEditingProduct(null);
    },
  });

  const deleteProductMutation = api.product.delete.useMutation({
    onSuccess: () => {
      void utils.product.getAll.invalidate();
    },
  });

  const resetForm = () => {
    setNewName("");
    setNewSku("");
    setNewCategory("edibles");
    setNewCostPrice(0);
    setNewSellPrice(0);
    setNewStockQty(0);
    setNewUnitType("UNITS");
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    pushTelemetry("API", `Creating inventory product node: ${newSku} (${newName})`);
    await createProductMutation.mutateAsync({
      name: newName,
      sku: newSku,
      category: newCategory,
      costPrice: Number(newCostPrice),
      price: Number(newSellPrice),
      stockQty: Number(newStockQty),
      unitType: newUnitType,
    });
    pushTelemetry("SYS", `Successfully initialized new asset node: [${newSku}]`);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    pushTelemetry("API", `Updating inventory parameters for SKU: ${editingProduct.sku}`);
    await updateProductMutation.mutateAsync({
      id: editingProduct.id,
      name: editingProduct.name,
      sku: editingProduct.sku,
      category: editingProduct.category,
      costPrice: Number(editingProduct.costPrice),
      price: Number(editingProduct.price),
      stockQty: Number(editingProduct.stockQty),
      unitType: editingProduct.unitType,
    });
    pushTelemetry("SYS", `Inventory parameters saved for node: [${editingProduct.sku}]`);
  };

  const categories = ["ALL", "edibles", "drink", "product", "extract", "merch", "PRolls"];

  const filteredProducts = products?.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "ALL" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    
    if (filterStatus === "IN_STOCK") return matchesSearch && matchesCat && p.stockQty > 0;
    if (filterStatus === "OUT_OF_STOCK") return matchesSearch && matchesCat && p.stockQty <= 0;
    return matchesSearch && matchesCat;
  });

  // Analytics quick calculations
  const totalItemsCount = products?.length ?? 0;
  const lowOrOutStockCount = products?.filter(p => p.stockQty <= 0).length ?? 0;
  const totalValuation = products?.reduce((acc, p) => acc + (p.price * p.stockQty), 0) ?? 0;

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#090D16] text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Dynamic Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* TOP HEADER */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/5 bg-[#0D1322]/80 backdrop-blur-xl shadow-sm shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            type="button"
            onClick={() => setIsNavOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-indigo-400 hover:bg-white/10 hover:border-indigo-500/30 transition shadow-inner cursor-pointer group"
            title="Open System Navigation"
          >
            <Terminal className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 sm:gap-2.5">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <Boxes className="h-4 w-4 text-indigo-400 hidden sm:inline" />
                Inventory Command Center
              </h1>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>LIVE SYNC</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block mt-0.5">Real-time stock valuation, inventory adjustments, and catalog indexing</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-1.5 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Encrypted Ledger</span>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT BODY */}
      <div className="relative flex flex-1 flex-col overflow-y-auto lg:overflow-hidden p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-[1700px] w-full mx-auto custom-scrollbar">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 shrink-0">
          <div className="bg-[#0E1526]/80 border border-white/5 rounded-2xl p-4 sm:p-5 backdrop-blur-xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-indigo-500/30 transition">
            <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition"></div>
            <div>
              <p className="text-[11px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">Total Active SKUs</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1 tracking-tight">{totalItemsCount}</h3>
              <p className="text-[10px] sm:text-[11px] text-indigo-400 mt-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Across {categories.length - 1} categories
              </p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Package className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>

          <div className="bg-[#0E1526]/80 border border-white/5 rounded-2xl p-4 sm:p-5 backdrop-blur-xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-amber-500/30 transition">
            <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition"></div>
            <div>
              <p className="text-[11px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">Stock Deficits</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1 tracking-tight">{lowOrOutStockCount}</h3>
              <p className="text-[10px] sm:text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Requiring restock attention
              </p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>

          <div className="bg-[#0E1526]/80 border border-white/5 rounded-2xl p-4 sm:p-5 backdrop-blur-xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition sm:col-span-2 lg:col-span-1">
            <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition"></div>
            <div>
              <p className="text-[11px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">Inventory Asset Value</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1 tracking-tight">R{totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <p className="text-[10px] sm:text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Based on current retail pricing
              </p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
        </div>

        {/* Controls & Filter Toolbar */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-3.5 sm:gap-4 bg-[#0E1526]/80 border border-white/5 p-3.5 sm:p-4 rounded-2xl backdrop-blur-xl shrink-0 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by item name or SKU..."
                className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 pl-11 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition shadow-inner"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  pushTelemetry("SEARCH", `Searched inventory catalog for query: ${e.target.value}`);
                }}
              />
            </div>
            <button
              onClick={() => {
                pushTelemetry("CLICK", "Opened initialize new product modal");
                setIsCreateOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-xs font-semibold transition shadow-lg shadow-indigo-600/20 cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Initialize New Item</span>
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full xl:w-auto pb-1 xl:pb-0 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  pushTelemetry("FILTER", `Filtered inventory by category: ${cat}`);
                }}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap border ${
                  selectedCategory === cat 
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20" 
                    : "border-white/5 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {cat === "ALL" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
            {(["ALL", "IN_STOCK", "OUT_OF_STOCK"] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  pushTelemetry("FILTER", `Filtered inventory by status: ${status}`);
                }}
                className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium transition cursor-pointer border ${
                  filterStatus === status 
                    ? "bg-white/10 border-white/20 text-white shadow-sm" 
                    : "border-white/5 bg-[#070A12] text-slate-400 hover:text-white"
                }`}
              >
                {status === "ALL" ? "All Status" : status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Product Table Container */}
        <div className="flex-1 rounded-2xl border border-white/5 bg-[#0E1526]/80 overflow-hidden flex flex-col shadow-xl backdrop-blur-xl">
          
          {/* Desktop Table Header */}
          <div className="hidden lg:grid grid-cols-12 bg-[#0A0E1A] border-b border-white/5 px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <div className="col-span-3">Item Designation</div>
            <div className="col-span-2">Category & SKU</div>
            <div className="col-span-2">Financials (Cost / Sell)</div>
            <div className="col-span-3 text-center">Stock Level Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {isLoading ? (
              <div className="flex h-64 lg:h-full items-center justify-center text-indigo-400 text-xs gap-3">
                <Cpu className="h-5 w-5 animate-spin" />
                <span className="font-medium">Querying secure database nodes...</span>
              </div>
            ) : filteredProducts?.length === 0 ? (
              <div className="flex h-64 lg:h-full flex-col items-center justify-center text-slate-500 text-xs gap-3 py-12">
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <span className="font-medium text-slate-400">No matching inventory items discovered</span>
              </div>
            ) : (
              <AnimatePresence>
                {filteredProducts?.map((product) => {
                  const isOutOfStock = product.stockQty <= 0;
                  const margin = product.costPrice > 0 
                    ? (((product.price - product.costPrice) / product.price) * 100).toFixed(0) 
                    : "100";

                  return (
                    <motion.div 
                      key={product.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 sm:p-5 lg:px-6 lg:py-4 hover:bg-white/[0.02] transition group"
                    >
                      {/* Responsive Mobile Layout Card */}
                      <div className="flex flex-col gap-3 lg:hidden">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-xs text-white group-hover:text-indigo-300 transition">{product.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">SKU: {product.sku}</p>
                          </div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase shrink-0">
                            {product.category}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                          <div>
                            <span className="text-emerald-400 font-bold text-sm">R{product.price.toFixed(2)}</span>
                            <span className="text-[11px] text-slate-500 ml-2">(Cost: R{product.costPrice.toFixed(2)})</span>
                          </div>
                          <span className={`text-[10px] font-medium px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                            isOutOfStock 
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}>
                            <Scale className="h-3 w-3" />
                            <span>{product.stockQty} {product.unitType}</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            onClick={() => {
                              pushTelemetry("CLICK", `Opened parameter configuration for SKU: ${product.sku}`);
                              setEditingProduct({
                                id: product.id,
                                name: product.name,
                                sku: product.sku,
                                category: product.category,
                                costPrice: product.costPrice,
                                price: product.price,
                                stockQty: product.stockQty,
                                unitType: product.unitType,
                              });
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-400 border border-white/10 transition cursor-pointer"
                          >
                            <Sliders className="h-3.5 w-3.5" />
                            <span>Configure</span>
                          </button>
                          <button
                            onClick={() => {
                              pushTelemetry("CLICK", `Triggered delete action for product node: ${product.sku}`);
                              if (confirm(`Delete ${product.name} from inventory?`)) {
                                deleteProductMutation.mutate({ id: product.id });
                                pushTelemetry("SYS", `Deleted inventory product node: [${product.sku}]`);
                              }
                            }}
                            className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Desktop Grid Layout */}
                      <div className="hidden lg:grid grid-cols-12 items-center">
                        {/* Name & ID */}
                        <div className="col-span-3 pr-4">
                          <p className="font-semibold text-xs text-white group-hover:text-indigo-300 transition truncate">{product.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">ID: {product.id.slice(-8)}</p>
                        </div>

                        {/* Category & SKU */}
                        <div className="col-span-2">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase mb-1">
                            {product.category}
                          </span>
                          <p className="text-[11px] font-mono text-slate-400 truncate">{product.sku}</p>
                        </div>

                        {/* Pricing */}
                        <div className="col-span-2 text-xs">
                          <div className="text-emerald-400 font-bold">R{product.price.toFixed(2)}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span>Cost: R{product.costPrice.toFixed(2)}</span>
                            <span className="text-[10px] text-indigo-400 font-medium">({margin}% mar)</span>
                          </div>
                        </div>

                        {/* Stock Level & Units */}
                        <div className="col-span-3 flex items-center justify-center">
                          <span className={`text-xs font-medium px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
                            isOutOfStock 
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}>
                            <Scale className="h-3.5 w-3.5" />
                            <span>{product.stockQty} {product.unitType}</span>
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              pushTelemetry("CLICK", `Opened parameter configuration for SKU: ${product.sku}`);
                              setEditingProduct({
                                id: product.id,
                                name: product.name,
                                sku: product.sku,
                                category: product.category,
                                costPrice: product.costPrice,
                                price: product.price,
                                stockQty: product.stockQty,
                                unitType: product.unitType,
                              });
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-semibold text-indigo-400 border border-white/10 transition cursor-pointer"
                          >
                            <Sliders className="h-3.5 w-3.5" />
                            <span>Configure</span>
                          </button>
                          <button
                            onClick={() => {
                              pushTelemetry("CLICK", `Triggered delete action for product node: ${product.sku}`);
                              if (confirm(`Delete ${product.name} from inventory?`)) {
                                deleteProductMutation.mutate({ id: product.id });
                                pushTelemetry("SYS", `Deleted inventory product node: [${product.sku}]`);
                              }
                            }}
                            className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

      </div>

      {/* CREATE NEW ITEM MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0E1526] p-5 sm:p-7 space-y-5 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Plus className="h-4 w-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">Initialize New Inventory Node</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Premium Extract"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">SKU Identifier</label>
                  <input
                    type="text"
                    required
                    placeholder="SKU-EXT-001"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none font-mono transition shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none cursor-pointer uppercase shadow-inner"
                  >
                    <option value="edibles">Edibles</option>
                    <option value="drink">Drink</option>
                    <option value="product">Product</option>
                    <option value="extract">Extract</option>
                    <option value="merch">Merch</option>
                    <option value="PRolls">PRolls</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Cost Price (R)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newCostPrice}
                    onChange={(e) => setNewCostPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none transition shadow-inner [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Sell Price (R)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newSellPrice}
                    onChange={(e) => setNewSellPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none transition shadow-inner [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Stock Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newStockQty}
                    onChange={(e) => setNewStockQty(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none transition shadow-inner [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Unit Type</label>
                  <select
                    value={newUnitType}
                    onChange={(e) => setNewUnitType(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none cursor-pointer shadow-inner"
                  >
                    <option value="UNITS">UNITS</option>
                    <option value="g">Grams (g)</option>
                    <option value="kg">Kilograms (kg)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-medium text-slate-300 hover:bg-white/10 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProductMutation.isPending}
                  className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {createProductMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>Create Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIG EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0E1526] p-5 sm:p-7 space-y-5 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Sliders className="h-4 w-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">Configure Inventory Node</h3>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none transition shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">SKU Identifier</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none font-mono transition shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none cursor-pointer uppercase shadow-inner"
                  >
                    <option value="edibles">Edibles</option>
                    <option value="drink">Drink</option>
                    <option value="product">Product</option>
                    <option value="extract">Extract</option>
                    <option value="merch">Merch</option>
                    <option value="PRolls">PRolls</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Cost Price (R)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingProduct.costPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none transition shadow-inner [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Sell Price (R)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none transition shadow-inner [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Stock Level</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingProduct.stockQty}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockQty: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none transition shadow-inner [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Unit Type</label>
                  <select
                    value={editingProduct.unitType}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unitType: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none cursor-pointer shadow-inner"
                  >
                    <option value="UNITS">UNITS</option>
                    <option value="g">Grams (g)</option>
                    <option value="kg">Kilograms (kg)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-medium text-slate-300 hover:bg-white/10 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProductMutation.isPending}
                  className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {updateProductMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-white font-semibold transition cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="h-4 w-4 text-indigo-400" />
                      <span>Inventory Matrix</span>
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
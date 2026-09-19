// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  AlertTriangle, 
  Home, 
  Layers, 
  BarChart3, 
  Database, 
  Settings, 
  LogOut, 
  X, 
  ChevronRight, 
  CreditCard, 
  Banknote, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Receipt
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  stockQty: number;
}

export default function RegisterPage() {
  const utils = api.useUtils();
  const { data: products, isLoading } = api.product.getAll.useQuery();

  const [isNavOpen, setIsNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CARD");

  // Stock update mutation to reduce stock on checkout
  const updateStockMutation = api.product.updateStock.useMutation({
    onSuccess: () => {
      void utils.product.getAll.invalidate();
    },
  });

  const addToCart = (product: { id: string; name: string; price: number; stockQty: number }) => {
    if (product.stockQty <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stockQty) return prev; // Don't exceed stock
        return prev.map((item) => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1, stockQty: product.stockQty }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          if (newQty <= 0) return null;
          if (newQty > item.stockQty) return item;
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.0825; // 8.25% default tax rate from settings
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      // Deduct stock for each item in cart
      for (const item of cart) {
        await updateStockMutation.mutateAsync({
          id: item.id,
          stockQty: item.stockQty - item.qty,
        });
      }

      setCheckoutComplete(true);
      setCart([]);
      setTimeout(() => {
        setCheckoutComplete(false);
      }, 4000);
    } catch (error) {
      console.error("Checkout transaction failed:", error);
    }
  };

  const filteredProducts = products?.filter((p) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase">APEX_POS // REGISTER TERMINAL</span>
              <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[9px] text-cyan-300 border border-cyan-500/30">ONLINE</span>
            </div>
            <p className="text-[10px] text-slate-400">Point of sale live checkout node</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-[11px] text-slate-300">
            <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>TERMINAL: APEX-PRIME-01</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 text-[11px] text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>SECURE SYNC</span>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT BODY (SPLIT LAYOUT: PRODUCTS & CART) */}
      <div className="relative flex flex-1 overflow-hidden p-6 gap-6">
        
        {/* LEFT PANEL: PRODUCT CATALOGUE */}
        <div className="flex-1 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-md">
          
          {/* Search Bar */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Scan barcode or search inventory by name/SKU..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-cyan-400 animate-pulse text-xs gap-2">
                <Cpu className="h-5 w-5 animate-spin" />
                <span>QUERYING PRODUCT DATABASE...</span>
              </div>
            ) : filteredProducts?.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <AlertTriangle className="h-6 w-6 text-slate-600" />
                <span>No products discovered in catalogue</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts?.map((product) => {
                  const isOutOfStock = product.stockQty <= 0;
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={isOutOfStock}
                      className={`flex flex-col justify-between p-3.5 rounded-xl border text-left transition cursor-pointer group ${
                        isOutOfStock 
                          ? "border-slate-800 bg-slate-950/40 opacity-50 cursor-not-allowed" 
                          : "border-slate-800 bg-slate-950/60 hover:border-cyan-500/50 hover:bg-cyan-950/20 shadow-md"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400">{product.sku}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                            isOutOfStock 
                              ? "bg-rose-950/50 text-rose-400 border-rose-500/30" 
                              : "bg-emerald-950/40 text-emerald-400 border-emerald-500/20"
                          }`}>
                            {isOutOfStock ? "0 OUT" : `${product.stockQty} LEFT`}
                          </span>
                        </div>
                        <p className="font-bold text-xs text-slate-200 group-hover:text-cyan-300 transition line-clamp-2">
                          {product.name}
                        </p>
                      </div>

                      <div className="pt-3 flex items-center justify-between border-t border-slate-800/80 mt-2">
                        <span className="text-xs font-bold text-emerald-400">${product.price.toFixed(2)}</span>
                        <div className="h-6 w-6 rounded-lg bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                          <Plus className="h-3 w-3" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: ACTIVE CART & CHECKOUT */}
        <div className="w-96 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-md shrink-0">
          
          {/* Cart Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-cyan-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Active Transaction</h2>
            </div>
            <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-300 border border-cyan-500/30 font-mono">
              {cart.reduce((acc, item) => acc + item.qty, 0)} ITEMS
            </span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-3 space-y-2">
            {checkoutComplete ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-4 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase">Transaction Complete</h3>
                <p className="text-[10px] text-slate-400 font-mono">Stock levels successfully deducted and recorded to Supabase.</p>
              </div>
            ) : cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-500 text-xs gap-2 py-20">
                <Receipt className="h-8 w-8 text-slate-700" />
                <span>Cart is empty. Select items to begin.</span>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-xs text-slate-200 line-clamp-1">{item.name}</p>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-bold">${(item.price * item.qty).toFixed(2)}</span>
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
                      <button 
                        onClick={() => updateQty(item.id, -1)}
                        className="h-5 w-5 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-white">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item.id, 1)}
                        className="h-5 w-5 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Totals & Checkout Actions */}
          {!checkoutComplete && cart.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Sales Tax (8.25%):</span>
                  <span className="text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-800">
                  <span className="text-cyan-400">Total:</span>
                  <span className="text-emerald-400">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setPaymentMethod("CARD")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                    paymentMethod === "CARD" 
                      ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]" 
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>CARD READER</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("CASH")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                    paymentMethod === "CASH" 
                      ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]" 
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  <Banknote className="h-3.5 w-3.5" />
                  <span>CASH DRAWER</span>
                </button>
              </div>

              <button
                onClick={handleCheckout}
                disabled={updateStockMutation.isPending}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-cyan-500/50 bg-cyan-500/20 py-3 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)] disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{updateStockMutation.isPending ? "PROCESSING LEDGER..." : `COMPLETE CHECKOUT ($${total.toFixed(2)})`}</span>
              </button>
            </div>
          )}

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
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-bold transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Home className="h-4 w-4 text-cyan-400" />
                      <span>POS Terminal</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-cyan-500" />
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
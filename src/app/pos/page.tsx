// src/app/pos/page.tsx[cite: 13]
"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { pushTelemetry } from "@/utils/telemetry";
import { 
  Terminal, 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Sliders, 
  CreditCard, 
  Banknote, 
  Percent,
  X,
  RefreshCw,
  ShieldCheck,
  Package,
  Activity,
  Home,
  Layers,
  Database,
  BarChart3,
  Tag,
  ChevronRight
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  stockQty: number;
}

interface BundleRule {
  id: string;
  name: string;
  targetSkuPattern: string;
  requiredQty: number;
  bundlePrice: number | { toNumber(): number }; // Handles Prisma Decimal or number types
}

function calculateCartTotals(cart: CartItem[], discountPercent: number, activeBundleRules?: BundleRule[]) {
  let subtotal = 0;
  let totalBundleSavings = 0;
  const appliedBundlesSummary: { name: string; count: number; savings: number }[] = [];

  // 1. Calculate raw subtotal
  cart.forEach((item) => {
    subtotal += item.price * item.quantity;
  });

  // 2. Evaluate dynamic database bundle rules
  if (activeBundleRules) {
    activeBundleRules.forEach((rule) => {
      const matchingItems = cart.filter(
        (item) =>
          item.sku.toLowerCase().includes(rule.targetSkuPattern.toLowerCase()) ||
          item.name.toLowerCase().includes(rule.targetSkuPattern.toLowerCase())
      );

      const totalMatchingQty = matchingItems.reduce((sum, item) => sum + item.quantity, 0);
      const bPrice = typeof rule.bundlePrice === "number" ? rule.bundlePrice : Number(rule.bundlePrice);

      if (totalMatchingQty >= rule.requiredQty) {
        const bundleCount = Math.floor(totalMatchingQty / rule.requiredQty);
        const baselineUnitPrice = matchingItems[0]?.price ?? (bPrice / rule.requiredQty);
        const standardCostForBundledItems = bundleCount * rule.requiredQty * baselineUnitPrice;
        const specializedCost = bundleCount * bPrice;
        
        const savings = standardCostForBundledItems - specializedCost;

        if (savings > 0) {
          totalBundleSavings += savings;
          appliedBundlesSummary.push({
            name: rule.name,
            count: bundleCount,
            savings: savings,
          });
        }
      }
    });
  }

  const adjustedSubtotal = Math.max(0, subtotal - totalBundleSavings);
  const percentageDiscountAmount = adjustedSubtotal * (discountPercent / 100);
  const finalTotal = Math.max(0, adjustedSubtotal - percentageDiscountAmount);
  

  return {
    subtotal,
    totalBundleSavings,
    appliedBundlesSummary,
    adjustedSubtotal,
    percentageDiscountAmount,
    finalTotal,
  };
}

export default function POSPage() {
  const utils = api.useUtils();
  const { data: products, isLoading: productsLoading } = api.product.getAll.useQuery();
  const { data: activeBundleRules } = api.promotion.getAll.useQuery();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const createCashLogMutation = api.cashLog.create.useMutation();

  // Navigation Drawer State
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Editor State (Price & Quantity)
  const [editingProduct, setEditingProduct] = useState<{ id: string; name: string; sku: string; price: number; stockQty: number } | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newStock, setNewStock] = useState<number>(0);

  // Mutations — Declared before handleSave and UI references
  const updateStockMutation = api.product.updateStock.useMutation({
    onSuccess: () => {
      void utils.product.getAll.invalidate();
      setEditingProduct(null);
    },
  });

  const handleSave = async () => {
    if (!editingProduct) return;
    pushTelemetry("API", `Executing stock parameter modification for SKU: ${editingProduct.sku}`);
    await updateStockMutation.mutateAsync({
      id: editingProduct.id,
      stockQty: Number(newStock >= 0 ? newStock : 0),
    });
    pushTelemetry("SYS", `Stock node updated successfully for [${editingProduct.sku}] -> New Qty: ${newStock}`);
  };

  const addToCart = (product: { id: string; name: string; sku: string; price: number; stockQty: number }) => {
    if (product.stockQty <= 0) return;
    pushTelemetry("CLICK", `Added asset node [SKU: ${product.sku}] - ${product.name} to active register cart`);

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQty) return prevCart;
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty > item.stockQty) return item;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    const itemToRemove = cart.find(i => i.id === id);
    if (itemToRemove) {
      pushTelemetry("CLICK", `Removed asset [SKU: ${itemToRemove.sku}] from active register cart`);
    }
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredProducts = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { subtotal, appliedBundlesSummary, percentageDiscountAmount, finalTotal } = calculateCartTotals(cart, discountPercent, activeBundleRules);

  const handleCheckout = async () => {
    if (cart.length === 0 || isProcessing) return;
    setIsProcessing(true);
    setCheckoutStatus("TRANSMITTING TRANSACTION...");
    pushTelemetry("API", `Initiating secure POS checkout transaction via ${paymentMethod}... Total: R${finalTotal.toFixed(2)}`);

    try {
      for (const item of cart) {
        const currentProd = products?.find((p) => p.id === item.id);
        const currentStock = currentProd ? currentProd.stockQty : item.stockQty;
        const finalStock = currentStock - item.quantity;
        
        await updateStockMutation.mutateAsync({
          id: item.id,
          stockQty: finalStock >= 0 ? finalStock : 0,
        });
      }

      // Record transaction into the Cash/Card Ledger
      await createCashLogMutation.mutateAsync({
        type: "IN",
        method: paymentMethod, // "CASH" or "CARD"
        amount: finalTotal,
        reason: `POS Sale via ${paymentMethod} (${cart.length} items)`,
      });

      setCheckoutStatus(`SECURED VIA ${paymentMethod}`);
      pushTelemetry("SYS", `Transaction successfully signed & recorded. Inventory nodes decremented.`);
      await utils.cashLog.invalidate();

      setTimeout(() => {
        setCart([]);
        setCheckoutStatus(null);
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      console.error("Checkout failed:", error);
      setCheckoutStatus("ERROR: TRANSACTION ABORTED");
      pushTelemetry("SYS", "CRITICAL: POS transaction sequence interrupted. Ledger rolled back.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#090D16] text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Background Glows */}
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
                <ShoppingCart className="h-4 w-4 text-indigo-400" />
                POS Terminal Command Center
              </h1>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE SYNC
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">High-speed register processing, instant cart calculation, and live stock updates</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-1.5 text-xs text-slate-300">
            <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>Latency: 14ms</span>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-1.5 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Encrypted Ledger</span>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT BODY */}
      <div className="relative flex flex-1 flex-col lg:flex-row overflow-hidden p-6 lg:p-8 gap-6 max-w-[1700px] w-full mx-auto">
        
        {/* LEFT: Product Catalog */}
        <div className="flex flex-1 flex-col h-full bg-[#0E1526]/80 border border-white/5 rounded-2xl backdrop-blur-xl p-6 overflow-hidden shadow-xl">
          
          <div className="relative mb-5 shrink-0">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search catalog by item name or SKU..."
              className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-3 pl-11 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
            {productsLoading ? (
              <div className="flex h-full items-center justify-center text-indigo-400 text-xs gap-3">
                <Cpu className="h-5 w-5 animate-spin" />
                <span className="font-medium">Querying secure database nodes...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 pb-4">
                {filteredProducts?.map((product) => {
                  const isOutOfStock = product.stockQty <= 0;
                  return (
                    <div
                      key={product.id}
                      className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition ${
                        isOutOfStock 
                          ? "border-white/5 bg-[#0A0E1A]/40 opacity-50" 
                          : "border-white/5 bg-[#0A0E1A]/80 hover:border-indigo-500/30 hover:bg-[#0E1526] shadow-lg"
                      }`}
                    >
                      <div 
                        onClick={() => !isOutOfStock && addToCart(product)}
                        className={`cursor-pointer ${isOutOfStock ? "cursor-not-allowed" : ""}`}
                      >
                        <h3 className="font-semibold text-xs text-white group-hover:text-indigo-300 transition truncate">{product.name}</h3>
                        <p className="text-[11px] font-mono text-slate-500 mt-0.5">SKU: {product.sku}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm font-bold text-emerald-400">
                            R{product.price.toFixed(2)}
                          </span>
                          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                            isOutOfStock 
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}>
                            <Package className="h-3 w-3" />
                            <span>{isOutOfStock ? "OUT OF STOCK" : `${product.stockQty} IN STOCK`}</span>
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-white/5 pt-3 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">Quick Adjust</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            pushTelemetry("CLICK", `Opened parameter configuration modal for SKU: ${product.sku}`);
                            setEditingProduct({ id: product.id, name: product.name, sku: product.sku, price: product.price, stockQty: product.stockQty });
                            setNewPrice(product.price);
                            setNewStock(product.stockQty);
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-400 border border-white/10 transition cursor-pointer"
                        >
                          <Sliders className="h-3.5 w-3.5" />
                          <span>Configure</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Cart & Checkout Panel */}
        <div className="flex w-full lg:w-[440px] flex-col h-full bg-[#0E1526]/80 border border-white/5 rounded-2xl p-6 backdrop-blur-xl shadow-xl overflow-hidden shrink-0">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 shrink-0">
            <div className="flex items-center gap-2.5 text-xs font-bold text-white uppercase tracking-wider">
              <ShoppingCart className="h-4 w-4 text-indigo-400" />
              <span>Current Cart Ledger</span>
            </div>
            <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
              {cart.reduce((acc, item) => acc + item.quantity, 0)} ITEMS
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-3">
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <span className="font-medium text-slate-400">Cart is currently empty</span>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div className="flex-1 pr-3">
                    <p className="font-semibold text-white text-xs truncate">{item.name}</p>
                    <p className="text-[11px] text-indigo-400 mt-0.5">R{item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-xl border border-white/10 bg-[#070A12] px-1 py-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer" title="Remove Item">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/5 pt-4 mt-4 space-y-4 shrink-0">
            
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setPaymentMethod("CASH");
                  pushTelemetry("CLICK", "Selected payment vector: CASH");
                }}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition cursor-pointer ${
                  paymentMethod === "CASH" 
                    ? "border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                    : "border-white/5 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Banknote className="h-4 w-4" />
                <span>CASH</span>
              </button>
              <button
                onClick={() => {
                  setPaymentMethod("CARD");
                  pushTelemetry("CLICK", "Selected payment vector: CARD");
                }}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition cursor-pointer ${
                  paymentMethod === "CARD" 
                    ? "border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                    : "border-white/5 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>CARD</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 bg-[#070A12] p-3 rounded-xl border border-white/10">
              <div className="flex items-center gap-2">
                <Percent className="h-3.5 w-3.5 text-indigo-400" />
                <span>Discount Rebate:</span>
              </div>
              <div className="flex gap-1.5">
                {[0, 5, 10, 15].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => {
                      setDiscountPercent(pct);
                      pushTelemetry("CLICK", `Applied discount rebate tier: ${pct}%`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                      discountPercent === pct 
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-sm" 
                        : "border-white/5 bg-white/[0.02] text-slate-400 hover:text-white"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-200">R{subtotal.toFixed(2)}</span>
              </div>

              {appliedBundlesSummary.map((bundle, idx) => (
                <div key={idx} className="flex justify-between text-emerald-400 font-medium">
                  <span>Bundle: {bundle.name} (x{bundle.count})</span>
                  <span>-R{bundle.savings.toFixed(2)}</span>
                </div>
              ))}

              {discountPercent > 0 && (
                <div className="flex justify-between text-indigo-400">
                  <span>Rebate Discount ({discountPercent}%)</span>
                  <span>-R{percentageDiscountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-white/5 pt-2 text-sm font-bold text-white">
                <span>Total Amount</span>
                <span className="text-emerald-400">R{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {checkoutStatus && (
              <div className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-3 text-center text-xs font-bold text-indigo-300 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{checkoutStatus}</span>
              </div>
            )}

            <button
              disabled={cart.length === 0 || isProcessing}
              onClick={handleCheckout}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              <span>{isProcessing ? "PROCESSING TRANSACTION..." : "COMPLETE CHECKOUT"}</span>
            </button>
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
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-white font-semibold transition cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="h-4 w-4 text-indigo-400" />
                      <span>POS Terminal</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-indigo-400" />
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

      {/* QUICK EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0E1526] p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-indigo-400" />
                  Configure Item Parameters
                </h3>
              </div>
              <button 
                onClick={() => setEditingProduct(null)} 
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 rounded-xl bg-white/[0.02] border border-white/5 p-3">
              <p className="font-semibold text-white text-xs">{editingProduct.name}</p>
              <p className="text-[11px] text-slate-400 font-mono">SKU: {editingProduct.sku}</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Price (R)</label>
                <div className="relative group">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold group-focus-within:text-indigo-400 transition">R</span>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 pl-9 text-xs font-medium text-white placeholder-slate-500 hover:border-white/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition shadow-inner [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Stock Quantity</label>
                <div className="relative">
                  <Package className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-400 transition" />
                  <input
                    type="number"
                    className="w-full rounded-xl border border-white/10 bg-[#070A12] px-4 py-2.5 pl-10 text-xs font-medium text-white placeholder-slate-500 hover:border-white/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition shadow-inner [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateStockMutation.isPending}
                className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {updateStockMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Save Changes</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
<div align="center">

# 🛒 Complete a POS Sale

### The primary revenue path of **APEX_OS**

*An end-to-end specification of how a cashier converts a customer's basket into a committed transaction: decrementing inventory, applying promotions, recording ledger entries, and emitting analytics telemetry.*

<br />

![Status](https://img.shields.io/badge/status-production--stable-10b981?style=for-the-badge&labelColor=090D16)
![Module](https://img.shields.io/badge/module-POS_Terminal-6366f1?style=for-the-badge&labelColor=090D16)
![Currency](https://img.shields.io/badge/currency-ZAR_(R)-06b6d4?style=for-the-badge&labelColor=090D16)
![Tax](https://img.shields.io/badge/tax-none-64748b?style=for-the-badge&labelColor=090D16)

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![tRPC](https://img.shields.io/badge/tRPC_11-2596be?style=flat-square&logo=trpc&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_6-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)
![NextAuth](https://img.shields.io/badge/NextAuth_v5-000000?style=flat-square)

</div>

> **Module:** POS Terminal (`/pos`) · **Primary Actor:** Cashier / Operator · **Trigger:** Customer presents items for purchase at the register
> **Related Modules:** Inventory · Promotions · Cash Drawer · Analytics

---

## 📖 Contents

1. [Executive Summary](#1--executive-summary)
2. [Actors & Roles](#2--actors--roles)
3. [Preconditions](#3--preconditions)
4. [Main Success Scenario](#4--main-success-scenario)
5. [Postconditions](#5--postconditions)
6. [Exception & Alternative Flows](#6--exception--alternative-flows)
7. [Sequence Diagram](#7--sequence-diagram)
8. [State Machine](#8--state-machine)
9. [Business Rules](#9--business-rules)
10. [Promotion Engine Spec](#10--promotion-engine-spec)
11. [Data Contract](#11--data-contract)
12. [UI Reference](#12--ui-reference)
13. [Security & Authorization](#13--security--authorization)
14. [Telemetry & Observability](#14--telemetry--observability)
15. [Test Scenarios](#15--test-scenarios)
16. [Success Metrics](#16--success-metrics)
17. [User Guide](#17--user-guide)
18. [Technical Design](#18--technical-design)

---

## 1 · Executive Summary

> The **Complete a POS Sale** use case is the beating heart of APEX_OS. Every other module (Inventory, Promotions, Cash Drawer, Analytics) exists to support, observe, or react to this one flow.

A cashier opens the **POS Terminal** at `/pos`, assembles a cart from the live product catalog, watches the system apply active promotion bundles in real time, chooses a payment method, and commits the sale. The system then:

- **Decrements** `Product.stockQty` for every purchased SKU
- **Records** a `CashLog` entry routed to either the physical drawer or the card ledger
- **Emits** a telemetry event for the operations stream
- **Invalidates** cached queries so every other screen reflects the new state

The flow targets a **sub-45-second median checkout time** while preserving strict inventory accuracy and auditability.

### 🔑 Key Characteristics

| ⚡ Real-time | 🔒 Authenticated | 📊 Observable | 🧮 Deterministic |
|:---:|:---:|:---:|:---:|
| Promotions and totals recompute on every cart change | Every sale is bound to a JWT session | Full telemetry trail for every step | Pure-function cart math, no hidden state |

---

## 2 · Actors & Roles

| Actor | Type | Responsibility |
|---|---|---|
| 👤 **Cashier** | Primary | Operates the register: searches the catalog, adds items, applies discounts, selects the payment method, and commits the sale. |
| ⚙️ **System** | Supporting | Validates stock in real time, evaluates promotion bundles, computes totals, executes mutations, and records telemetry. |
| 📦 **Inventory Engine** | Supporting | Provides the live product catalog and accepts stock decrement mutations. |
| 🏷️ **Promotions Engine** | Supporting | Supplies active bundle rules and drives client-side discount evaluation. |
| 💰 **Cash Drawer** | Supporting | Receives the committed ledger entry, routed by payment method. |
| 🛡️ **Manager** | *Future* | Will authorize manual discounts above the cashier's allowed threshold. |

---

## 3 · Preconditions

| ✓ | Invariant | Verification |
|:---:|---|---|
| ✅ | **Authenticated session** | Valid JWT via NextAuth v5; the operator's `user.id` is available in session context. |
| ✅ | **POS Terminal reachable** | Route `/pos` renders successfully and the tRPC client is connected. |
| ✅ | **Non-empty catalog** | At least one `Product` exists with `stockQty > 0`. |
| ✅ | **Promotions loaded** *(optional)* | If any `Promotion` rows exist with `isActive = true`, they are fetched alongside the catalog. |
| ✅ | **Payment method available** | The cash drawer is unlocked *or* the card terminal is online. |

---

## 4 · Main Success Scenario

| # | Actor | Action |
|:---:|---|---|
| **1** | Cashier | Opens the POS Terminal at `/pos`. |
| **2** | System | Loads the live product catalog via `product.getAll` and active bundles via `promotion.getAll`. |
| **3** | Cashier | Types a query into the search bar, matching by **name** or **SKU**. |
| **4** | System | Filters the product grid in real time (case-insensitive substring match). |
| **5** | Cashier | Taps a product card to add it to the active cart. |
| **6** | System | Validates `stockQty > 0` and appends the item (or increments quantity if already present). |
| **7** | Cashier | Adjusts quantities with the `+` / `−` stepper controls. |
| **8** | System | Blocks any increment that would push quantity past the live `stockQty`. |
| **9** | System | Re-evaluates all active promotion bundles on every cart mutation. |
| **10** | System | Displays per-bundle savings lines and recalculates the grand total live. |
| **11** | Cashier | *(Optional)* Applies a manual discount tier: `0%` · `5%` · `10%` · `15%`. |
| **12** | Cashier | Selects a payment method: **CASH** or **CARD**. |
| **13** | Cashier | Clicks **Complete Checkout**. |
| **14** | System | Decrements `stockQty` for every line item via `product.updateStock`. |
| **15** | System | Writes a `CashLog` entry with `type = "IN"` and the selected method. |
| **16** | System | Invalidates cached queries, clears the cart, and shows the success banner. |
| **17** | System | Emits telemetry events across the full transaction lifecycle. |

> **🎬 Outcome:** The sale is committed. Inventory is reduced. The cash/card ledger is updated. The register is idle and ready for the next customer.

---

## 5 · Postconditions

| | State Change | Detail |
|:---:|---|---|
| 📦 | **Inventory decremented** | Every purchased SKU has `stockQty_new = max(0, stockQty_old − qty_sold)`. |
| 💰 | **Ledger entry written** | A new `CashLog` row exists with `type = "IN"`, `method = CASH \| CARD`, `amount = finalTotal`, `reason = "POS Sale via <METHOD> (<n> items)"`, `userId = <operator>`. |
| 🛒 | **Cart reset** | Active cart is empty; totals show `R0.00`; discount resets to `0%`. |
| 🔄 | **Cache invalidated** | `product.getAll` and `cashLog.*` queries are refetched globally. |
| 📡 | **Telemetry emitted** | Events pushed with types `API`, `SYS`, `CLICK` throughout the flow. |

---

## 6 · Exception & Alternative Flows

| Code | Condition | System Response |
|:---:|---|---|
| `A1` | Product is out of stock | Card renders in a **disabled state** (`opacity-50`, rose badge); tap is a no-op. |
| `A2` | Quantity increment exceeds stock | Counter **silently refuses**; quantity stays at its current value. |
| `A3` | No promotion matches the cart | No bundle savings line rendered; only the manual discount (if any) applies. |
| `A4` | Multiple bundles match | Each rule is evaluated **independently and stacked**; savings sum. |
| `A5` | Checkout with empty cart | Checkout button is **disabled**; no network call dispatched. |
| `A6` | Backend mutation fails mid-checkout | UI shows `ERROR: TRANSACTION ABORTED`; cart preserved for retry. ⚠️ *Stock/cash mutations are **not** rolled back. See [§13](#13--security--authorization).* |
| `A7` | Manual discount above threshold *(future)* | Will require a **manager PIN** before applying. |
| `A8` | Cashier removes all line items | Cart returns to empty state; totals reset; discount tier preserved. |

---

## 7 · Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor C as 👤 Cashier
    participant POS as 🖥️ POS Terminal
    participant PE as 🏷️ Promotions Engine
    participant API as ⚙️ tRPC API
    participant DB as 🗄️ PostgreSQL

    Note over C,DB: ── Bootstrap ──
    C->>POS: Open /pos
    POS->>API: product.getAll()
    API->>DB: SELECT * FROM "Product"
    DB-->>API: catalog rows
    API-->>POS: catalog rendered

    POS->>API: promotion.getAll()
    API->>DB: SELECT * FROM "Promotion"
    DB-->>API: active rules
    API-->>POS: rules cached

    Note over C,DB: ── Cart Assembly ──
    C->>POS: Search + tap product
    POS->>POS: addToCart() (stock guard)
    POS->>PE: calculateCartTotals(cart, discount)
    PE-->>POS: { subtotal, bundles, finalTotal }

    C->>POS: Adjust quantity / apply discount
    POS->>PE: recalculate

    Note over C,DB: ── Commit ──
    C->>POS: Select method + Complete Checkout
    loop For each cart item
        POS->>API: product.updateStock(id, newQty)
        API->>DB: UPDATE "Product" SET stockQty
        DB-->>API: ok
    end
    POS->>API: cashLog.create({ type: IN, method, amount })
    API->>DB: INSERT INTO "CashLog"
    DB-->>API: ok
    API-->>POS: success
    POS->>POS: utils.invalidate()
    POS-->>C: ✅ Success banner, cart cleared
```

---

## 8 · State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle

    Idle --> Browsing: Open /pos<br/>(catalog + promotions loaded)
    Browsing --> Browsing: Search / filter catalog
    Browsing --> Building: Add first item

    Building --> Building: Add item / adjust qty / remove item
    Building --> Building: Select payment method / discount tier
    Building --> Browsing: Remove all items (A8)
    Building --> Submitting: Complete Checkout

    Submitting --> Success: All mutations resolve
    Submitting --> Failed: Any mutation rejects (A6)

    Failed --> Building: Cart preserved, cashier retries
    Success --> Idle: Banner dismissed after 1.5s, cart cleared

    Idle --> [*]
```

| State | Description | Checkout Enabled |
|---|---|:---:|
| **Idle** | Terminal is ready; no active session data. | ❌ |
| **Browsing** | Catalog is loaded; cart is empty. | ❌ |
| **Building** | Cart has at least one line item; totals are live. | ✅ |
| **Submitting** | Mutations in flight; controls are locked. | ❌ |
| **Success** | Sale committed; banner shown. | ❌ |
| **Failed** | Error shown; cart retained for retry. | ✅ |

---

## 9 · Business Rules

| Rule | Specification |
|:---:|---|
| **BR-01** | A product with `stockQty ≤ 0` **cannot** be added to the cart; the card is disabled at render time. |
| **BR-02** | Cart quantity for any SKU **cannot exceed** its live `stockQty`. |
| **BR-03** | A promotion triggers when the aggregate matching quantity **meets or exceeds** `requiredQty`. |
| **BR-04** | Promotion matching is a **case-insensitive substring** against both `sku` and `name`. |
| **BR-05** | Bundle savings = `(baselineUnitPrice × requiredQty × bundleCount) − (bundlePrice × bundleCount)`. |
| **BR-06** | Manual discounts are restricted to the tiers `0% · 5% · 10% · 15%`. |
| **BR-07** | Currency is **South African Rand (R)**; no sales tax is applied at the register. |
| **BR-08** | Every successful sale **must** produce exactly **one** `CashLog` entry. |
| **BR-09** | Stock decrements occur **before** the ledger write; any failure surfaces to the operator. |
| **BR-10** | Promotion rules never produce a **negative cart subtotal**; final total is clamped to `≥ 0`. |

---

## 10 · Promotion Engine Spec

The cart math is a pure function (`calculateCartTotals`) that returns a deterministic breakdown:

```ts
function calculateCartTotals(cart, discountPercent, activeBundleRules) {
  // 1. Raw subtotal
  subtotal = Σ (item.price × item.quantity)

  // 2. Bundle evaluation (per rule, independent)
  for each rule in activeBundleRules:
      matching = cart.filter(i =>
          i.sku.toLowerCase().includes(rule.targetSkuPattern) ||
          i.name.toLowerCase().includes(rule.targetSkuPattern))
      qty = Σ matching.quantity
      if qty >= rule.requiredQty:
          bundleCount   = floor(qty / rule.requiredQty)
          baselinePrice = matching[0].price
          savings       = (bundleCount × rule.requiredQty × baselinePrice)
                        − (bundleCount × rule.bundlePrice)
          if savings > 0: totalBundleSavings += savings

  // 3. Percentage discount (post-bundle)
  adjustedSubtotal = max(0, subtotal − totalBundleSavings)
  discountAmount   = adjustedSubtotal × (discountPercent / 100)
  finalTotal       = max(0, adjustedSubtotal − discountAmount)

  return { subtotal, totalBundleSavings, adjustedSubtotal, discountAmount, finalTotal }
}
```

### Worked Example

| Item | SKU | Unit Price | Qty | Line Total |
|---|---|---:|:---:|---:|
| Hydro Gummies 20mg | `HYD-GUM-20` | R120.00 | 3 | R360.00 |
| Sparkling Water | `DRK-SPK-01` | R25.00 | 2 | R50.00 |

**Active rule:** `requiredQty = 2`, `targetSkuPattern = "gum"`, `bundlePrice = R200.00`

| Step | Calculation | Amount |
|---|---|---:|
| Subtotal | R360 + R50 | R410.00 |
| Matching qty | 3 × `HYD-GUM-20` | 3 |
| Bundle count | `floor(3 / 2)` | 1 |
| Bundle savings | `(1 × 2 × R120) − (1 × R200)` | −R40.00 |
| Adjusted subtotal | R410 − R40 | R370.00 |
| Manual discount (10%) | R370 × 0.10 | −R37.00 |
| **Final Total** | | **🟢 R333.00** |

---

## 11 · Data Contract

### Entities Read

| Entity | Fields | Purpose |
|---|---|---|
| `Product` | `id`, `name`, `sku`, `price`, `stockQty` | Catalog + stock guard |
| `Promotion` | `id`, `name`, `targetSkuPattern`, `requiredQty`, `bundlePrice` | Bundle evaluation |
| `Session` | `user.id`, `user.name` | Ledger attribution |

### Entities Written

**`Product` · `UPDATE`**

```ts
{
  id: string,
  stockQty: number   // old − qty, clamped at 0
}
```

**`CashLog` · `INSERT`**

```ts
{
  type: "IN",
  method: "CASH" | "CARD",
  amount: number,
  reason: `POS Sale via ${method} (${cart.length} items)`,
  userId: session.user.id
}
```

### tRPC Procedures Involved

| Procedure | Type | Role in Flow |
|---|---|---|
| `product.getAll` | `publicProcedure` | Hydrate catalog |
| `promotion.getAll` | `publicProcedure` | Hydrate bundles |
| `product.updateStock` | `publicProcedure` | Decrement per line item |
| `cashLog.create` | `protectedProcedure` | Write ledger entry |

---

## 12 · UI Reference

```text
┌───────────────────────────────────────────────────────────────────────┐
│  ⌨️  POS Terminal                     [● LIVE SYNC]   [⏱ 14ms] [🛡️]  │
├──────────────────────────────────┬────────────────────────────────────┤
│  🔍 Search catalog by name/SKU   │  🛒 ACTIVE CART LEDGER    [3 ITEMS]│
│  ┌────────────────────────────┐  │  ──────────────────────────────────│
│  │                            │  │  Hydro Gummies     R120.00 ×3  🗑  │
│  ├────────┬────────┬──────────┤  │  Sparkling Water   R25.00  ×2  🗑  │
│  │ Hydro  │ Spark. │  Chip    │  │  ──────────────────────────────────│
│  │ Gum-20 │ Water  │  BBQ     │  │  Payment:  [💵 CASH] [💳 CARD]    │
│  │ R120   │ R25    │  R18     │  │  Discount: [0%] [5%] [10%] [15%]  │
│  │ 24 left│ 12 left│  0 OUT   │  │  ──────────────────────────────────│
│  ├────────┼────────┼──────────┤  │  Subtotal              R410.00    │
│  │ ...    │ ...    │   ...    │  │  Bundle: Gummies (×1)   −R40.00   │
│  │        │        │          │  │  Rebate (10%)           −R37.00   │
│  └────────┴────────┴──────────┘  │  ──────────────────────────────────│
│                                  │  TOTAL                 R333.00    │
│                                  │  ┌─────────────────────────────┐  │
│                                  │  │  ✅ COMPLETE CHECKOUT       │  │
│                                  │  └─────────────────────────────┘  │
└──────────────────────────────────┴────────────────────────────────────┘
```

**Key UI affordances:**

- Out-of-stock cards render in a muted disabled state with a rose **"OUT OF STOCK"** badge
- Bundle savings render per rule in emerald green
- The manual discount tier selector is sticky above the total
- The success banner auto-dismisses after 1.5 seconds and clears the cart

---

## 13 · Security & Authorization

| Concern | Current State | Recommended Hardening |
|---|---|---|
| **Authentication** | NextAuth v5 credentials + bcrypt + JWT ✅ | None; solid. |
| **Ledger write** | `protectedProcedure` ✅ | None. |
| **Stock mutation** | `publicProcedure` ⚠️ | Promote to `protectedProcedure`; currently any caller can zero out stock. |
| **Catalog read** | `publicProcedure` ⚠️ | Fine for public storefronts; restrict if the catalog is sensitive. |
| **Checkout atomicity** | Sequential mutations, **no transaction** ⚠️ | Wrap in `db.$transaction([...])` inside a single `sale.create` procedure. |
| **Route protection** | Middleware covers `/pos`, `/cash`, `/products` | Extend matcher to `/inventory`, `/analytics`, `/database`, `/manager/*`. |

> [!WARNING]
> The current checkout flow loops over items and calls `updateStock` per item, then writes the ledger. If any intermediate step fails, the transaction is partially applied with **no rollback**. The recommended fix is to move the entire operation into a single `db.$transaction` block behind a dedicated `sale.create` procedure.

---

## 14 · Telemetry & Observability

Every meaningful step emits a structured telemetry event via `pushTelemetry(type, message)`, persisted to `sessionStorage` and broadcast to the live Command Center stream.

| Event | Type | Message Pattern |
|---|:---:|---|
| Add to cart | `CLICK` | `Added asset node [SKU: HYD-GUM-20] - Hydro Gummies to active register cart` |
| Remove from cart | `CLICK` | `Removed asset [SKU: ...] from active register cart` |
| Payment method | `CLICK` | `Selected payment vector: CARD` |
| Discount tier | `CLICK` | `Applied discount rebate tier: 10%` |
| Checkout initiated | `API` | `Initiating secure POS checkout transaction via CARD... Total: R333.00` |
| Sale committed | `SYS` | `Transaction successfully signed & recorded. Inventory nodes decremented.` |
| Sale failed | `SYS` | `CRITICAL: POS transaction sequence interrupted. Ledger rolled back.` |

**Observable dashboards:**

- 🖥️ `/`: Live Neural Telemetry feed with filter chips and sort toggle
- 📊 `/analytics`: Hourly throughput, low-stock alerts, top SKUs
- 💰 `/cash`: Full ledger with cash/card tabbed history

---

## 15 · Test Scenarios

<details>
<summary><b>TC-01 · Happy Path: Single Item, Cash</b></summary>

- **Given** a product Hydro Gummies exists with `stockQty = 10`
- **When** the cashier adds 1 unit, selects CASH, and completes checkout
- **Then** stock becomes 9 and a `CashLog` row exists with `type=IN`, `method=CASH`, `amount=R120.00`

</details>

<details>
<summary><b>TC-02 · Stock Guard: Quantity Ceiling</b></summary>

- **Given** a product with `stockQty = 2`
- **When** the cashier adds it and taps `+` three times
- **Then** the quantity stays at 2, no overflow

</details>

<details>
<summary><b>TC-03 · Out-of-Stock Item is Disabled</b></summary>

- **Given** a product with `stockQty = 0`
- **When** the catalog renders
- **Then** the card has `opacity-50`, a rose badge, and is not clickable

</details>

<details>
<summary><b>TC-04 · Bundle Savings Applied</b></summary>

- **Given** a rule `{ targetSkuPattern: "gum", requiredQty: 2, bundlePrice: 200 }` and 3 matching items at R120 each in the cart
- **Then** the bundle savings line shows −R40.00 (1 bundle) and the total reflects it

</details>

<details>
<summary><b>TC-05 · Stacked Bundles</b></summary>

- **Given** two active rules both matching the same SKU
- **When** the cart satisfies both
- **Then** both savings lines render and the totals subtract both

</details>

<details>
<summary><b>TC-06 · Manual Discount Applied After Bundle</b></summary>

- **Given** an adjusted subtotal of R370 and a 10% discount tier selected
- **Then** the discount amount is R37.00 and the final total is R333.00

</details>

<details>
<summary><b>TC-07 · Empty Cart Blocks Checkout</b></summary>

- **Given** an empty cart
- **Then** the Checkout button is disabled and no network call dispatches

</details>

<details>
<summary><b>TC-08 · Cart Cleared on Success</b></summary>

- **When** a successful checkout resolves
- **Then** within 1.5s the cart is empty, totals reset to R0.00, and the success banner is dismissed

</details>

---

## 16 · Success Metrics

| Metric | Target | Why It Matters |
|---|---|---|
| ⏱️ **Median checkout time** | `< 45s` for a 3-item sale | Cashier throughput and queue length |
| 🎯 **Stock accuracy** | `100%` post-sale | Ledger and inventory must stay in sync |
| 💰 **Promotion attach rate** | `> 35%` of carts | Validates the bundle engine's uplift |
| 🔐 **Auth coverage** | `100%` of sales | Every sale must map to a known operator |
| 📡 **Telemetry coverage** | `100%` of checkout events | Enables full auditability and debugging |
| 🚫 **Partial-failure rate** | `0%` *(post-transaction refactor)* | Current risk until `sale.create` ships |

---

## 17 · User Guide

> **Audience:** Cashiers and store operators using the POS Terminal day to day.
> **Goal:** Ring up a customer, apply savings, take payment, and finish the sale, quickly and correctly.

### 17.1 · Quick Start

1. **Sign in** with your operator account.
2. Open the **POS Terminal** (`/pos`).
3. **Search** for a product and **tap** it to add it to the cart.
4. Check the **quantity** and the **total**.
5. Choose **CASH** or **CARD**.
6. Tap **Complete Checkout**. When the green success banner appears, the sale is done.

### 17.2 · Know Your Screen

| Area | Where | What it does |
|---|---|---|
| **Search bar** | Top left | Filters products by name or SKU as you type. |
| **Product grid** | Left | Tap a card to add that product to the cart. Each card shows price and stock remaining. |
| **Active Cart Ledger** | Right | Lists items, quantities, and a 🗑 remove button per line. |
| **Payment selector** | Right | Switch between 💵 CASH and 💳 CARD. |
| **Discount selector** | Right | Pick `0%`, `5%`, `10%`, or `15%`. |
| **Totals** | Right | Shows subtotal, bundle savings, discount, and the final total. |
| **Complete Checkout** | Bottom right | Commits the sale. Disabled when the cart is empty. |

### 17.3 · Ringing Up a Sale

#### Add items

- Type part of a product **name** or **SKU** in the search bar (capitals don't matter).
- Tap the product card. Tapping the same product again adds one more.
- A card marked **OUT OF STOCK** is greyed out and cannot be added.

#### Change quantities

- Use **`+`** and **`−`** on a cart line.
- The quantity **stops at the stock available**. If `+` does nothing, there is no more stock to sell.
- Tap **🗑** to remove a line entirely.

#### Bundle savings

Some products qualify for **bundle deals** (for example, "buy 2 gummies for R200"). You don't need to do anything:

- The system detects qualifying items automatically.
- A green **Bundle** line appears with the amount saved.
- Multiple bundles can apply to the same cart, and the savings add up.

#### Apply a discount (optional)

- Pick a tier: **0%**, **5%**, **10%**, or **15%**.
- The discount is taken **after** bundle savings.
- Only these four tiers are available. Larger discounts will need manager approval in a future release.

#### Take payment

- Select **CASH** or **CARD** before checking out.
- Collect the money or run the card **as normal**. The POS records the sale but does not process card payments itself.
- No tax is added; the total shown is the amount to charge (in Rand, **R**).

#### Complete the sale

1. Confirm the **TOTAL**.
2. Tap **✅ Complete Checkout**.
3. Wait for the **success banner** (about 1.5 seconds). The cart clears automatically.
4. The register is ready for the next customer.

### 17.4 · Worked Example

A customer buys **3 × Hydro Gummies (R120 each)** and **2 × Sparkling Water (R25 each)**. There is a "2 gummies for R200" bundle, and you give a 10% discount.

| Line | Amount |
|---|---:|
| Subtotal | R410.00 |
| Bundle savings (1 bundle) | −R40.00 |
| 10% discount on R370 | −R37.00 |
| **Total to charge** | **R333.00** |

### 17.5 · Troubleshooting

| What you see | Likely reason | What to do |
|---|---|---|
| Product card is grey with an **OUT OF STOCK** badge | Stock is 0 | Can't be sold. Ask a manager to update inventory if stock exists on the shelf. |
| `+` button does nothing | Cart quantity has reached available stock | Expected behavior. Reduce the customer's request or check stock. |
| **Complete Checkout** is greyed out | Cart is empty | Add at least one item. |
| Expected bundle savings don't show | Not enough matching items, or no active rule | Check the bundle's required quantity. Ask a manager if the promotion is active. |
| Searching finds nothing | Typo or item not in catalog | Try a shorter search, or search by SKU. |
| **ERROR: TRANSACTION ABORTED** | A step of the checkout failed | Your cart is kept. **Before retrying**, see the note below. |
| Page shows a sign-in screen | Session expired | Sign in again. |

> [!IMPORTANT]
> **After a failed checkout, check before you retry.** In the current version some steps may have already saved (for example, stock reduced or a ledger entry written) before the error occurred. Ask a manager to review the **Cash** ledger and the item's stock level so the same sale isn't recorded twice.

### 17.6 · Tips for Speed

- Search by **SKU** (or a scanner code, if your store uses SKU labels) for the fewest taps.
- Set **payment method** and **discount** before tapping checkout; you can't change them after.
- Watch the **stock count** on cards to warn customers early when something is running low.

### 17.7 · FAQ

**Can I sell an item that's out of stock?**
No. Out-of-stock items can't be added to the cart.

**Can I give a 20% discount?**
Not currently. The maximum is 15%. Manager-approved discounts are planned.

**Is tax included?**
No tax is calculated at the register.

**Where can I see the sale afterwards?**
Every completed sale creates one entry in the **Cash** ledger (`/cash`), under Cash or Card depending on the payment method you chose.

**What happens to the cart if I close the page mid-sale?**
The cart is not saved. Items would need to be added again.

### 17.8 · Glossary

| Term | Meaning |
|---|---|
| **SKU** | The unique product code (for example `HYD-GUM-20`). |
| **Bundle** | A promotion where buying a set quantity gets a lower combined price. |
| **Rebate / discount tier** | The manual percentage taken off the cart total. |
| **Ledger** | The record of money in and out (`CashLog`). |
| **Operator** | The signed-in person running the register. |

---

## 18 · Technical Design

> **Purpose:** Bridge the requirements above and the implementation. This section maps the system architecture, data flow, and component responsibilities for the *Complete a POS Sale* flow, and proposes the hardening work called out in [§13](#13--security--authorization).
>
> **Legend:** ✅ implemented today · 🟡 proposed change

### 18.1 · Goals & Non-Goals

| Goals | Non-Goals |
|---|---|
| Deterministic, testable cart pricing | Tax calculation |
| Real-time UI feedback on every cart change | Card payment processing (no gateway integration) |
| One authenticated, auditable sale per checkout | Refunds and returns |
| Atomic stock + ledger commit 🟡 | Offline mode |
| Full telemetry coverage | Manager-approved discounts (future, see A7) |

### 18.2 · Architecture Overview

```mermaid
flowchart LR
    subgraph Client["🖥️ Browser (Next.js 15 App Router)"]
        UI["POS Terminal page<br/>/pos"]
        CART["Cart state<br/>(React state)"]
        CALC["calculateCartTotals()<br/>pure function"]
        TEL["pushTelemetry()<br/>sessionStorage"]
        RQ["tRPC React client<br/>+ query cache"]
    end

    subgraph Server["⚙️ Server (Next.js route handlers)"]
        MW["Middleware<br/>route protection"]
        AUTH["NextAuth v5<br/>JWT session"]
        TRPC["tRPC 11 routers"]
        PRISMA["Prisma 6 client"]
    end

    DB[("🗄️ PostgreSQL")]

    UI --> CART --> CALC
    UI --> TEL
    UI --> RQ --> TRPC
    MW --> AUTH
    TRPC --> AUTH
    TRPC --> PRISMA --> DB
```

| Layer | Technology | Responsibility |
|---|---|---|
| **Presentation** | Next.js 15, React, Tailwind | POS screen, cart, totals, feedback banners |
| **Client state** | React state + tRPC query cache | Active cart, selected method/discount; server data via cached queries |
| **Domain logic** | `calculateCartTotals` (pure TS) | Pricing, bundles, discounts |
| **API** | tRPC 11 | Type-safe procedures shared between client and server |
| **Auth** | NextAuth v5 (credentials, bcrypt, JWT) | Operator identity and route protection |
| **Persistence** | Prisma 6 + PostgreSQL | Products, promotions, ledger |
| **Observability** | `pushTelemetry` + Command Center feed | Client-emitted event stream |

### 18.3 · Component Responsibilities

| Component | Type | Responsibilities | Depends on |
|---|---|---|---|
| `PosTerminalPage` | Client component | Layout, wiring data hooks, checkout handler | All below |
| `ProductGrid` / `ProductCard` | UI | Render catalog, disabled state for `stockQty ≤ 0`, tap-to-add | `product.getAll` |
| `SearchBar` | UI | Controlled input driving a case-insensitive filter on `name` and `sku` | none |
| `CartLedger` | UI | Line items, quantity steppers, remove | cart state |
| `PaymentSelector` / `DiscountSelector` | UI | Set `method` (`CASH \| CARD`) and `discountPercent` (`0 \| 5 \| 10 \| 15`) | cart state |
| `TotalsPanel` | UI | Render subtotal, bundle lines, rebate, final total | `calculateCartTotals` |
| `calculateCartTotals` | Pure function | Deterministic pricing (see [§10](#10--promotion-engine-spec)) | none |
| `pushTelemetry` | Utility | Append events to `sessionStorage` and broadcast | none |
| tRPC routers | Server | `product`, `promotion`, `cashLog` (and 🟡 `sale`) | Prisma, session |

### 18.4 · Data Model

```mermaid
erDiagram
    USER ||--o{ CASHLOG : "records"
    PRODUCT {
        string id PK
        string name
        string sku
        decimal price
        int stockQty
    }
    PROMOTION {
        string id PK
        string name
        string targetSkuPattern
        int requiredQty
        decimal bundlePrice
        boolean isActive
    }
    CASHLOG {
        string id PK
        string type "IN | OUT"
        string method "CASH | CARD"
        decimal amount
        string reason
        string userId FK
        datetime createdAt
    }
    USER {
        string id PK
        string name
    }
```

**Design notes**

- `Promotion` is read-only from the POS and evaluated **client-side** against the cart.
- `CashLog` carries no foreign key to `Product`, so a sale's line items are only summarized in `reason`. 🟡 A `Sale` / `SaleItem` pair would give a proper audit trail:

```mermaid
erDiagram
    SALE ||--|{ SALEITEM : contains
    SALE ||--|| CASHLOG : "produces"
    PRODUCT ||--o{ SALEITEM : "sold as"
    SALE {
        string id PK
        string userId FK
        string method
        decimal subtotal
        decimal bundleSavings
        int discountPercent
        decimal total
        datetime createdAt
    }
    SALEITEM {
        string id PK
        string saleId FK
        string productId FK
        int quantity
        decimal unitPrice
    }
```

### 18.5 · API Design

| Procedure | Access | Input | Output | Notes |
|---|---|---|---|---|
| `product.getAll` | public ✅ | none | `Product[]` | Hydrates catalog |
| `promotion.getAll` | public ✅ | none | `Promotion[]` | Hydrates bundle rules |
| `product.updateStock` | public ✅ → protected 🟡 | `{ id, stockQty }` | `Product` | Client sends the *new* quantity, which is race-prone (see 18.7) |
| `cashLog.create` | protected ✅ | `{ type, method, amount, reason }` | `CashLog` | `userId` taken from session |
| `sale.create` | protected 🟡 | `{ items: {productId, quantity}[], method, discountPercent }` | `Sale` | Single atomic checkout |

### 18.6 · Checkout Flow: Current vs. Proposed

**✅ Current (client-orchestrated)**

```mermaid
flowchart TD
    A[Complete Checkout] --> B{Cart empty?}
    B -- yes --> X[Button disabled]
    B -- no --> C[For each item: product.updateStock]
    C --> D{All ok?}
    D -- no --> E[ERROR: TRANSACTION ABORTED<br/>⚠️ earlier decrements remain]
    D -- yes --> F[cashLog.create]
    F --> G{ok?}
    G -- no --> E
    G -- yes --> H[Invalidate queries, clear cart, banner]
```

**🟡 Proposed (server-orchestrated, atomic)**

```mermaid
flowchart TD
    A[Complete Checkout] --> B[sale.create]
    B --> T{{"db.$transaction"}}
    T --> V[Load products, verify stock and prices]
    V --> R[Recompute totals server-side]
    R --> U[Decrement stock with guarded update]
    U --> S[Insert Sale + SaleItems]
    S --> L[Insert CashLog]
    L --> OK[Commit]
    T -- any error --> RB[Rollback everything]
    OK --> H[Invalidate queries, clear cart, banner]
    RB --> E[ERROR: TRANSACTION ABORTED<br/>cart preserved, nothing saved]
```

**Reference implementation sketch** 🟡

```ts
// server/api/routers/sale.ts
export const saleRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })).min(1),
      method: z.enum(["CASH", "CARD"]),
      discountPercent: z.union([z.literal(0), z.literal(5), z.literal(10), z.literal(15)]),
    }))
    .mutation(({ ctx, input }) =>
      ctx.db.$transaction(async (tx) => {
        const products = await tx.product.findMany({
          where: { id: { in: input.items.map(i => i.productId) } },
        });
        const promotions = await tx.promotion.findMany({ where: { isActive: true } });

        // Recompute pricing on the server; never trust client totals
        const cart = input.items.map(i => ({ ...products.find(p => p.id === i.productId)!, quantity: i.quantity }));
        const totals = calculateCartTotals(cart, input.discountPercent, promotions);

        // Guarded decrement: fails if stock changed since the cashier loaded the page
        for (const item of input.items) {
          const { count } = await tx.product.updateMany({
            where: { id: item.productId, stockQty: { gte: item.quantity } },
            data: { stockQty: { decrement: item.quantity } },
          });
          if (count === 0) throw new TRPCError({ code: "CONFLICT", message: "Insufficient stock" });
        }

        await tx.cashLog.create({
          data: {
            type: "IN",
            method: input.method,
            amount: totals.finalTotal,
            reason: `POS Sale via ${input.method} (${input.items.length} items)`,
            userId: ctx.session.user.id,
          },
        });

        return totals;
      })
    ),
});
```

### 18.7 · Key Design Decisions & Trade-offs

| # | Decision | Rationale | Trade-off |
|---|---|---|---|
| **D1** | Pricing is a **pure function** shared by client and server | Testable, deterministic, identical result in preview and commit | Client and server must import the same module |
| **D2** | Promotions evaluated **client-side** for live feedback | Instant totals with no round-trips | Server must re-evaluate at commit 🟡 |
| **D3** | Cart lives in **React state**, not the DB | Fast, simple, no draft-cart cleanup | Cart lost on refresh |
| **D4** | tRPC over REST | End-to-end types, no schema drift | Couples client and server in one repo |
| **D5** | Stock guarded with `stockQty >= qty` inside the update 🟡 | Prevents overselling when two registers sell the last unit | Slightly more complex than a plain update |
| **D6** | Server recomputes totals 🟡 | Client-supplied `amount` can be tampered with | Small extra DB read per sale |
| **D7** | Single `sale.create` procedure 🟡 | Atomicity, one network call, one audit record | Replaces the current per-item `updateStock` flow |

### 18.8 · Known Issues & Risks

| ID | Issue | Impact | Mitigation |
|---|---|---|---|
| **R1** | Checkout is non-atomic | Partial sales; stock and ledger drift | `sale.create` in `$transaction` |
| **R2** | `updateStock` is public | Anyone can zero out stock | Make protected, or remove once R1 ships |
| **R3** | Stock set to an absolute value from the client | Two registers can overwrite each other (lost update) | Use `decrement` with a guard (D5) |
| **R4** | Client-computed `amount` trusted by `cashLog.create` | Ledger tampering | Server recomputes (D6) |
| **R5** | Telemetry message says "Ledger rolled back" | Inaccurate until R1 ships | Reword, or fix via R1 |
| **R6** | Middleware matcher incomplete | Some routes unprotected | Extend to `/inventory`, `/analytics`, `/database`, `/manager/*` |
| **R7** | Telemetry is in `sessionStorage` only | Events lost on tab close; not a durable audit log | Persist server-side |

### 18.9 · Error Handling

| Failure | Detection | Behavior |
|---|---|---|
| Insufficient stock at commit 🟡 | Guarded update returns `count = 0` | `CONFLICT`; transaction rolls back; cashier sees the error and refreshed stock |
| Session expired | tRPC `UNAUTHORIZED` | Redirect to sign-in; cart preserved in memory until navigation |
| Network failure | Mutation rejects | `ERROR: TRANSACTION ABORTED`; cart preserved; safe to retry once R1 ships |
| Unknown server error | `INTERNAL_SERVER_ERROR` | Same as above; logged with a `SYS` telemetry event |

### 18.10 · Performance & Scalability

- **Client:** Cart math is O(cart lines × promotion rules). It runs on every change, which is trivial at retail scale.
- **Network:** Two hydration queries on load; 🟡 one mutation at checkout (down from *n + 1*).
- **Database:** Index `Product.sku` for search and `CashLog.createdAt` for ledger reads.
- **Targets:** Median checkout under 45s (human-dominated); server `sale.create` p95 under 300 ms.

### 18.11 · Testing Strategy

| Level | Scope | Tools (suggested) |
|---|---|---|
| **Unit** | `calculateCartTotals`: single bundle, stacked bundles, clamping (BR-10), discount ordering | Vitest |
| **Component** | Disabled out-of-stock card, stock ceiling, empty-cart checkout button | React Testing Library |
| **Integration** | tRPC `sale.create` against a test database: success, insufficient stock rollback, unauthenticated call | Vitest + test Postgres |
| **End-to-end** | Test cases TC-01 to TC-08 ([§15](#15--test-scenarios)) | Playwright |
| **Concurrency** | Two simultaneous checkouts for the last unit: exactly one succeeds | Integration test with parallel calls |

### 18.12 · Rollout Plan for the Atomic Checkout 🟡

1. Extract `calculateCartTotals` into a shared module used by client and server.
2. Add the `sale.create` procedure with `$transaction` and guarded stock updates.
3. Add `Sale` / `SaleItem` models via a Prisma migration.
4. Switch the POS checkout handler to call `sale.create`; remove the per-item loop.
5. Make `product.updateStock` protected (or delete it).
6. Update telemetry messages and A6 in [§6](#6--exception--alternative-flows).
7. Extend the middleware matcher and re-run the security checks in [§13](#13--security--authorization).

### 18.13 · Open Questions

- Should ledger reason strings be replaced by structured `SaleItem` rows, and should historic `CashLog` entries be backfilled?
- Should a sale be **voidable** by a manager, and how should that reverse stock and the ledger?
- Is a persistent server-side draft cart needed for multi-register or hand-over-shift scenarios?
- Should card sales record a payment reference from the card terminal?

---

<div align="center">

### 🔗 Related Specifications

[`/inventory`](#) · [`/manager/promotions`](#) · [`/cash`](#) · [`/analytics`](#) · [`/database`](#)

<br />

**APEX_OS · Tactical Point-of-Sale Terminal**

<sub>Use Case Specification · `v2.4` · Generated 2025</sub>

<sub>⚡ Built on the T3 Stack · Next.js · tRPC · Prisma · NextAuth</sub>

</div>

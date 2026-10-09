import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  TrendingUp,
  Package,
  Layers,
  Users,
  Truck,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCw,
  ShoppingBag,
  Boxes,
  CreditCard,
  Building2,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (module: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    products,
    categories,
    customers,
    suppliers,
    sales,
    purchases,
    expenses,
    debts,
    warehouseStock,
    warehouses,
    payments,
    settings,
  } = useInventory();

  // Metrics computation
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalCustomers = customers.length;
  const totalSuppliers = suppliers.length;

  const totalSalesCount = sales.length;
  const totalPurchasesCount = purchases.length;

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalPurchasesAmount = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Today's metrics (using current date)
  const todayStr = '2026-10-08';
  const todaySales = sales
    .filter((s) => s.saleDate === todayStr)
    .reduce((sum, s) => sum + s.total, 0);
  const todayPurchases = purchases
    .filter((p) => p.purchaseDate === todayStr)
    .reduce((sum, p) => sum + p.total, 0);

  // Debts
  const customerDebts = debts
    .filter((d) => d.debtType === 'customer' && d.status !== 'paid')
    .reduce((sum, d) => sum + d.remainingAmount, 0);
  const supplierDebts = debts
    .filter((d) => d.debtType === 'supplier' && d.status !== 'paid')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  // Low stock products count
  const lowStockProducts = products.filter((p) => {
    const totalQty = warehouseStock
      .filter((ws) => ws.productId === p.id)
      .reduce((sum, ws) => sum + ws.quantity, 0);
    return totalQty <= p.minStockLevel;
  });

  // Total stock valuation (Current Qty * Purchase Price)
  const totalStockValue = products.reduce((sum, p) => {
    const qty = warehouseStock
      .filter((ws) => ws.productId === p.id)
      .reduce((s, ws) => s + ws.quantity, 0);
    return sum + qty * p.purchasePrice;
  }, 0);

  // Cost of Goods Sold & Profit
  const totalCogs = sales.reduce((sum, s) => {
    const saleCost = s.items.reduce((itemSum, item) => itemSum + item.quantity * item.purchaseCost, 0);
    return sum + saleCost;
  }, 0);
  const grossProfit = totalRevenue - totalCogs;
  const netProfit = grossProfit - totalExpenses;

  // Monthly operational metrics calculated dynamically from real records ($0 baseline)
  const monthLabels = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const monthlyData = monthLabels.map((month) => {
    const monthSales = sales
      .filter((s) => {
        if (!s.saleDate) return false;
        const d = new Date(s.saleDate);
        return !isNaN(d.getTime()) && d.toLocaleDateString('en-US', { month: 'short' }) === month;
      })
      .reduce((sum, s) => sum + s.total, 0);

    const monthPurchases = purchases
      .filter((p) => {
        if (!p.purchaseDate) return false;
        const d = new Date(p.purchaseDate);
        return !isNaN(d.getTime()) && d.toLocaleDateString('en-US', { month: 'short' }) === month;
      })
      .reduce((sum, p) => sum + p.total, 0);

    return { month, sales: monthSales, purchases: monthPurchases };
  });

  const maxValRaw = Math.max(0, ...monthlyData.map((d) => Math.max(d.sales, d.purchases)));
  const maxChartVal = maxValRaw > 0 ? maxValRaw * 1.15 : 100;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Inventory & Operations Dashboard
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Single-business operations ledger</span>
            <span>·</span>
            <span>Real-time warehouse stock tracking & POS</span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('products')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => onNavigate('pos')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Open POS</span>
          </button>
          <button
            onClick={() => onNavigate('purchases')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>New Purchase</span>
          </button>
          <button
            onClick={() => onNavigate('parties')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      {/* Row 1: Core Financial & Volume KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Total Sales Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {settings.currencySymbol}{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold flex items-center">
                <ArrowUpRight className="w-3 h-3" /> Today:
              </span>
              <span className="font-mono tabular-nums">
                {settings.currencySymbol}{todaySales.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Total Purchases */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Total Purchases (Cost)</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {settings.currencySymbol}{totalPurchasesAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-slate-500">
                Today: {settings.currencySymbol}{todayPurchases.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Stock Valuation */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Total Stock Valuation</span>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {settings.currencySymbol}{totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Across {warehouses.length} active warehouses
            </div>
          </div>
        </div>

        {/* Operating Net Profit */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Estimated Net Profit</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className={`text-xl md:text-2xl font-bold font-mono tabular-nums ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {settings.currencySymbol}{netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Gross: {settings.currencySymbol}{grossProfit.toFixed(2)} · Exp: {settings.currencySymbol}{totalExpenses.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary Operation Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Products</span>
            <Package className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono mt-1">{totalProducts}</div>
        </div>

        <div
          onClick={() => onNavigate('categories')}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Categories</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono mt-1">{totalCategories}</div>
        </div>

        <div
          onClick={() => onNavigate('parties')}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Customers</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono mt-1">{totalCustomers}</div>
        </div>

        <div
          onClick={() => onNavigate('parties')}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Suppliers</span>
            <Truck className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono mt-1">{totalSuppliers}</div>
        </div>

        <div
          onClick={() => onNavigate('finance')}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Customer Debts</span>
            <CreditCard className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-lg font-bold text-rose-600 font-mono mt-1">
            {settings.currencySymbol}{customerDebts.toFixed(0)}
          </div>
        </div>

        <div
          onClick={() => onNavigate('finance')}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Supplier Payables</span>
            <CreditCard className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-lg font-bold text-amber-600 font-mono mt-1">
            {settings.currencySymbol}{supplierDebts.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Row 3: Charts & Stock Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales vs Purchases Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                Sales Revenue vs Purchases
              </h3>
              <p className="text-xs text-slate-500">6-Month operational trend ($)</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
                <span className="text-slate-600 font-medium">Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />
                <span className="text-slate-600 font-medium">Purchases</span>
              </div>
            </div>
          </div>

          {/* SVG Bar chart */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100">
            {monthlyData.map((d, idx) => {
              const salesHeight = Math.round((d.sales / maxChartVal) * 100);
              const purHeight = Math.round((d.purchases / maxChartVal) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    {/* Sales bar */}
                    <div
                      style={{ height: `${salesHeight}%` }}
                      className="w-4 sm:w-6 bg-emerald-600 rounded-t transition-all hover:bg-emerald-500 relative"
                      title={`${d.month} Sales: $${d.sales.toFixed(0)}`}
                    />
                    {/* Purchases bar */}
                    <div
                      style={{ height: `${purHeight}%` }}
                      className="w-4 sm:w-6 bg-indigo-500 rounded-t transition-all hover:bg-indigo-400 relative"
                      title={`${d.month} Purchases: $${d.purchases.toFixed(0)}`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 mt-2">{d.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-3">
            <span>Average Monthly Volume: ${((totalRevenue + totalPurchasesAmount) / (monthLabels.length || 1)).toFixed(2)}</span>
            <span className="font-mono text-emerald-700 font-semibold">
              {totalRevenue > 0 || totalPurchasesAmount > 0 ? 'Operating Cashflow Tracked' : 'Awaiting Live Data Entry ($0.00)'}
            </span>
          </div>
        </div>

        {/* Stock Breakdown by Warehouse */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm md:text-base">Stock by Warehouse</h3>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mb-4">Physical allocation of on-hand inventory</p>

            <div className="space-y-4">
              {warehouses.map((wh) => {
                const whQty = warehouseStock
                  .filter((ws) => ws.warehouseId === wh.id)
                  .reduce((sum, ws) => sum + ws.quantity, 0);

                const whValue = products.reduce((sum, p) => {
                  const q = warehouseStock
                    .filter((ws) => ws.warehouseId === wh.id && ws.productId === p.id)
                    .reduce((s, ws) => s + ws.quantity, 0);
                  return sum + q * p.purchasePrice;
                }, 0);

                const pct = totalStockValue > 0 ? Math.round((whValue / totalStockValue) * 100) : 0;

                return (
                  <div key={wh.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{wh.name}</span>
                      <span className="font-mono tabular-nums text-slate-600">
                        {whQty} units · ${whValue.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-slate-900 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{wh.code}</span>
                      <span>{pct}% of inventory value</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => onNavigate('stock')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
            >
              View Multi-Warehouse Stock Matrix →
            </button>
          </div>
        </div>
      </div>

      {/* Row 4: Low Stock Alerts & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Watchlist */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                Low Stock Threshold Alerts
              </h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
              {lowStockProducts.length} Reorder Needed
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-3">
            Products where total physical stock &le; minimum required threshold level.
          </p>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {products.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                  <Package className="w-5 h-5" />
                </div>
                <div className="font-semibold text-slate-800 text-xs">No products in inventory yet</div>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs mb-3">
                  Add products with SKU, prices, and minimum stock alert levels.
                </p>
                <button
                  onClick={() => onNavigate('products')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Product</span>
                </button>
              </div>
            ) : lowStockProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                All inventory levels are currently above reorder thresholds.
              </div>
            ) : (
              lowStockProducts.map((p) => {
                const totalQty = warehouseStock
                  .filter((ws) => ws.productId === p.id)
                  .reduce((sum, ws) => sum + ws.quantity, 0);

                return (
                  <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 text-xs truncate">{p.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        SKU: {p.sku} · Min: {p.minStockLevel} {p.unit}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                        {totalQty} {p.unit} left
                      </span>
                      <button
                        onClick={() => onNavigate('purchases')}
                        className="text-xs font-semibold px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors"
                      >
                        Reorder
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Transactions Feed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm md:text-base">Recent Activity & Sales</h3>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
            >
              View All Sales →
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {sales.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="font-semibold text-slate-800 text-xs">No sales recorded yet ($0.00)</div>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs mb-3">
                  Process Point of Sale retail orders or standard sales to record live revenue.
                </p>
                <button
                  onClick={() => onNavigate('pos')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Open POS / New Sale</span>
                </button>
              </div>
            ) : (
              sales.slice(0, 5).map((sale) => {
                const customer = customers.find((c) => c.id === sale.customerId);
                return (
                  <div key={sale.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-800">
                          {sale.saleNumber}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase ${
                          sale.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sale.paymentStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {customer?.name || 'Walk-in'} · {sale.saleDate}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-slate-900 text-xs">
                        {settings.currencySymbol}{sale.total.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {sale.items.length} items
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

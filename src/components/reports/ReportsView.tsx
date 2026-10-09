import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Printer,
  Package,
  Calendar,
  Users,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    sales,
    purchases,
    products,
    expenses,
    warehouseStock,
    customers,
    suppliers,
    settings,
  } = useInventory();

  const [activeReport, setActiveReport] = useState<
    'financial_pl' | 'sales_summary' | 'inventory_valuation' | 'purchases_summary'
  >('financial_pl');

  // Financial P&L calculations
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalCogs = sales.reduce((sum, s) => {
    return (
      sum +
      s.items.reduce((itemSum, item) => itemSum + item.quantity * item.purchaseCost, 0)
    );
  }, 0);
  const grossProfit = totalRevenue - totalCogs;
  const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const totalOperatingExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalOperatingExpenses;
  const netMarginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Inventory valuation
  const inventoryValuation = products.map((p) => {
    const qty = warehouseStock
      .filter((ws) => ws.productId === p.id)
      .reduce((sum, ws) => sum + ws.quantity, 0);
    const value = qty * p.purchasePrice;
    const potentialRetailValue = qty * p.sellingPrice;
    return {
      product: p,
      quantity: qty,
      costPrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      totalCostValue: value,
      potentialRetailValue,
    };
  });
  const totalStockCostValuation = inventoryValuation.reduce((s, item) => s + item.totalCostValue, 0);
  const totalPotentialRetailValuation = inventoryValuation.reduce((s, item) => s + item.potentialRetailValue, 0);

  // Sales by product breakdown
  const salesByProduct = products.map((p) => {
    let unitsSold = 0;
    let revenue = 0;
    let cost = 0;

    sales.forEach((s) => {
      s.items.forEach((it) => {
        if (it.productId === p.id) {
          unitsSold += it.quantity;
          revenue += it.lineTotal;
          cost += it.quantity * it.purchaseCost;
        }
      });
    });

    return {
      product: p,
      unitsSold,
      revenue,
      cost,
      profit: revenue - cost,
    };
  }).filter((item) => item.unitsSold > 0);

  // Purchases by supplier breakdown
  const purchasesBySupplier = suppliers.map((supp) => {
    const pos = purchases.filter((p) => p.supplierId === supp.id);
    const totalSpent = pos.reduce((sum, p) => sum + p.total, 0);
    const totalOrders = pos.length;
    return {
      supplier: supp,
      totalOrders,
      totalSpent,
    };
  }).filter((item) => item.totalOrders > 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Financial & Operational Intelligence Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cost of Goods Sold (COGS), true gross margin, inventory valuation, and sales velocity
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Print Report Statement</span>
        </button>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-lg w-fit no-print">
        <button
          onClick={() => setActiveReport('financial_pl')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            activeReport === 'financial_pl'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Profit & Loss Statement (P&L)
        </button>
        <button
          onClick={() => setActiveReport('inventory_valuation')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            activeReport === 'inventory_valuation'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Inventory Valuation
        </button>
        <button
          onClick={() => setActiveReport('sales_summary')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            activeReport === 'sales_summary'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sales Velocity by Item
        </button>
        <button
          onClick={() => setActiveReport('purchases_summary')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            activeReport === 'purchases_summary'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Procurement by Supplier
        </button>
      </div>

      {/* REPORT 1: P&L STATEMENT */}
      {activeReport === 'financial_pl' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-start pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Income Statement / Profit & Loss Statement (P&L)
              </h2>
              <p className="text-xs text-slate-500">{settings.businessName} · FY 2026</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              Accounting Method: Accrual & Historical FIFO
            </div>
          </div>

          <div className="max-w-2xl mx-auto space-y-4 text-xs">
            {/* 1. Revenue */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-sm text-slate-900">
                <span>1. Operating Sales Revenue</span>
                <span className="font-mono">{settings.currencySymbol}{totalRevenue.toFixed(2)}</span>
              </div>
              <div className="pl-4 text-slate-500 flex justify-between">
                <span>Gross POS and Customer Invoices</span>
                <span className="font-mono">{settings.currencySymbol}{totalRevenue.toFixed(2)}</span>
              </div>
            </div>

            {/* 2. COGS */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between font-bold text-sm text-slate-900">
                <span>2. Cost of Goods Sold (COGS)</span>
                <span className="font-mono text-rose-700">-{settings.currencySymbol}{totalCogs.toFixed(2)}</span>
              </div>
              <div className="pl-4 text-slate-500 flex justify-between">
                <span>Direct Product Purchase Acquisition Cost</span>
                <span className="font-mono">-{settings.currencySymbol}{totalCogs.toFixed(2)}</span>
              </div>
            </div>

            {/* 3. Gross Profit */}
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 flex justify-between items-center font-bold text-sm text-emerald-900">
              <div>
                <span>Gross Operational Profit</span>
                <span className="text-xs text-emerald-700 block font-normal">
                  Margin: {grossMarginPct.toFixed(1)}%
                </span>
              </div>
              <span className="font-mono text-base">{settings.currencySymbol}{grossProfit.toFixed(2)}</span>
            </div>

            {/* 4. Operating Expenses */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between font-bold text-sm text-slate-900">
                <span>3. Operating & Administrative Expenses</span>
                <span className="font-mono text-rose-700">-{settings.currencySymbol}{totalOperatingExpenses.toFixed(2)}</span>
              </div>
              {expenses.map((e) => (
                <div key={e.id} className="pl-4 text-slate-500 flex justify-between text-[11px]">
                  <span>{e.description}</span>
                  <span className="font-mono">-{settings.currencySymbol}{e.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* 5. Net Profit */}
            <div className="bg-slate-900 p-4 rounded-xl text-white flex justify-between items-center font-bold text-base shadow-sm">
              <div>
                <span>Net Profit / (Loss)</span>
                <span className="text-xs text-slate-300 block font-normal">
                  Net Margin: {netMarginPct.toFixed(1)}%
                </span>
              </div>
              <span className="font-mono text-xl text-emerald-400">
                {settings.currencySymbol}{netProfit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: INVENTORY VALUATION */}
      {activeReport === 'inventory_valuation' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
            <div>
              <h3 className="font-bold text-slate-900">Asset Inventory Valuation Statement</h3>
              <p className="text-slate-500">Total Purchase Cost Valuation vs Potential Retail Revenue</p>
            </div>
            <div className="flex gap-4 font-mono font-bold">
              <span>Cost Basis: {settings.currencySymbol}{totalStockCostValuation.toFixed(2)}</span>
              <span className="text-emerald-700">Retail Basis: {settings.currencySymbol}{totalPotentialRetailValuation.toFixed(2)}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Item SKU / Name</th>
                  <th className="py-3 px-4 text-center">On-Hand Quantity</th>
                  <th className="py-3 px-4 text-right">Cost Price</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Total Asset Cost</th>
                  <th className="py-3 px-4 text-right">Potential Retail Value</th>
                  <th className="py-3 px-4 text-right">Unrealized Gross Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {inventoryValuation.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center font-sans text-xs text-slate-500">
                      No products registered. Add inventory items with purchase costs to compute inventory asset valuation.
                    </td>
                  </tr>
                ) : (
                  inventoryValuation.map((iv) => {
                    const unrealizedMargin = iv.potentialRetailValue - iv.totalCostValue;
                    return (
                      <tr key={iv.product.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-sans">
                          <div className="font-semibold text-slate-900">{iv.product.name}</div>
                          <div className="text-[11px] text-slate-500">{iv.product.sku}</div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800">
                          {iv.quantity} {iv.product.unit}
                        </td>
                        <td className="py-3 px-4 text-right">${iv.costPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">${iv.sellingPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          ${iv.totalCostValue.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-700">
                          ${iv.potentialRetailValue.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-indigo-700 font-bold">
                          ${unrealizedMargin.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: SALES VELOCITY */}
      {activeReport === 'sales_summary' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-xs">Product Sales Velocity & Gross Margin Yield</h3>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-center">Units Sold</th>
                <th className="py-3 px-4 text-right">Gross Sales Revenue</th>
                <th className="py-3 px-4 text-right">Cost of Goods</th>
                <th className="py-3 px-4 text-right">Gross Margin Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {salesByProduct.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center font-sans text-xs text-slate-500">
                    No sales recorded yet ($0.00). Item sales velocity and margins will appear once sales orders are recorded.
                  </td>
                </tr>
              ) : (
                salesByProduct.map((sp) => (
                  <tr key={sp.product.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                      {sp.product.name}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {sp.unitsSold} {sp.product.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ${sp.revenue.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-rose-700">
                      ${sp.cost.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      +${sp.profit.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT 4: PROCUREMENT BY SUPPLIER */}
      {activeReport === 'purchases_summary' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-xs">Supplier Procurement Volumes</h3>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Supplier Company</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4 text-center">Total POs Issued</th>
                <th className="py-3 px-4 text-right">Total Procurement Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchasesBySupplier.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs text-slate-500">
                    No supplier procurements recorded yet ($0.00). Record purchase orders to track supplier volume distribution.
                  </td>
                </tr>
              ) : (
                purchasesBySupplier.map((item) => (
                  <tr key={item.supplier.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {item.supplier.company}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.supplier.name}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {item.totalOrders}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${item.totalSpent.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

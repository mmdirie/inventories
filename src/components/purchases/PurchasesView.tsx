import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Purchase, Product } from '../../types/inventory';
import {
  Truck,
  Plus,
  Search,
  Eye,
  Printer,
  X,
  CreditCard,
  Building2,
  Trash2,
  CheckCircle,
} from 'lucide-react';

export const PurchasesView: React.FC = () => {
  const {
    purchases,
    suppliers,
    warehouses,
    products,
    settings,
    createPurchase,
    settleDebt,
    debts,
    showToast,
    hasPermission,
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);

  // New Purchase Form
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(suppliers[0]?.id || 1);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(warehouses[0]?.id || 1);
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank' | 'Mobile Money' | 'Other'>('Bank');
  const [paidAmountInput, setPaidAmountInput] = useState<string>('0');
  const [purchaseNotes, setPurchaseNotes] = useState<string>('');

  const [lineItems, setLineItems] = useState<
    { productId: number; quantity: number; unitCost: number; discount: number; tax: number }[]
  >(
    products.length > 0
      ? [{ productId: products[0].id, quantity: 10, unitCost: products[0].purchasePrice, discount: 0, tax: 0 }]
      : []
  );

  // Add line item
  const handleAddLineItem = () => {
    const defaultProd = products[0];
    setLineItems((prev) => [
      ...prev,
      {
        productId: defaultProd?.id || 1,
        quantity: 1,
        unitCost: defaultProd?.purchasePrice || 0,
        discount: 0,
        tax: 0,
      },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: string, val: any) => {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: val };
        if (field === 'productId') {
          const prod = products.find((p) => p.id === Number(val));
          if (prod) {
            updated.unitCost = prod.purchasePrice;
          }
        }
        return updated;
      })
    );
  };

  // Calculations for form
  const computedSubtotal = lineItems.reduce((sum, it) => sum + it.quantity * it.unitCost, 0);
  const computedDiscount = lineItems.reduce((sum, it) => sum + (it.discount || 0), 0);
  const computedTax = lineItems.reduce((sum, it) => sum + (it.tax || 0), 0);
  const computedTotal = computedSubtotal - computedDiscount + computedTax;

  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) {
      showToast('At least one item is required', 'error');
      return;
    }

    const paid = parseFloat(paidAmountInput) || 0;

    const res = createPurchase({
      supplierId: selectedSupplierId,
      warehouseId: selectedWarehouseId,
      purchaseDate,
      items: lineItems,
      paidAmount: paid,
      paymentMethod,
      notes: purchaseNotes,
    });

    if (res.success) {
      setIsCreateOpen(false);
      setLineItems([{ productId: products[0]?.id || 1, quantity: 10, unitCost: products[0]?.purchasePrice || 50, discount: 0, tax: 0 }]);
      setPaidAmountInput('0');
      setPurchaseNotes('');
    } else {
      showToast(res.error || 'Failed to record purchase', 'error');
    }
  };

  // Filtered Purchases
  const filteredPurchases = purchases.filter((po) => {
    if (statusFilter !== 'all' && po.paymentStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const supp = suppliers.find((s) => s.id === po.supplierId);
      const matchesNum = po.purchaseNumber.toLowerCase().includes(q);
      const matchesSupp = supp && supp.company.toLowerCase().includes(q);
      return matchesNum || matchesSupp;
    }
    return true;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Purchase Orders & Receiving
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Procure stock from suppliers, update warehouse inventory atomically, and track vendor payables
          </p>
        </div>

        {hasPermission('purchases.create') && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Purchase Order</span>
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by PO Number or Supplier Company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none w-full sm:w-auto"
        >
          <option value="all">All Payment Statuses</option>
          <option value="paid">Paid in Full</option>
          <option value="partial">Partially Paid</option>
          <option value="unpaid">Unpaid Payables</option>
        </select>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Destination Warehouse</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Payment Status</th>
                <th className="py-3 px-4 text-center">Goods Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center font-sans">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-slate-900 text-sm mb-1">No purchase orders recorded yet ($0.00)</div>
                      <p className="text-xs text-slate-500 max-w-sm mb-4">
                        Issue purchase orders to suppliers and automatically update warehouse inventory upon delivery.
                      </p>
                      {hasPermission('purchases.create') && (
                        <button
                          onClick={() => setIsCreateOpen(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>New Purchase Order</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((po) => {
                  const supplier = suppliers.find((s) => s.id === po.supplierId);
                  const warehouse = warehouses.find((w) => w.id === po.warehouseId);

                  return (
                    <tr key={po.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{po.purchaseNumber}</td>
                      <td className="py-3 px-4 text-slate-600">{po.purchaseDate}</td>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                        {supplier?.company || '—'}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-700">{warehouse?.code}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {settings.currencySymbol}{po.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-700">
                        {settings.currencySymbol}{po.paidAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-rose-700 font-bold">
                        {settings.currencySymbol}{po.remainingAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                            po.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : po.paymentStatus === 'partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {po.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase bg-emerald-50 text-emerald-700">
                          {po.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          onClick={() => setViewingPurchase(po)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          title="View Purchase Order Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PURCHASE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Create Purchase Order & Receive Stock</h3>
                <p className="text-xs text-slate-400">Stock automatically increments in selected warehouse upon receipt</p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPurchase} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {(suppliers.length === 0 || products.length === 0) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                  <div className="font-semibold flex items-center gap-1.5 mb-1">
                    <Truck className="w-4 h-4" />
                    <span>Pre-requisites Required</span>
                  </div>
                  <p>
                    Please register at least one vendor in <strong>Suppliers</strong> and one item in <strong>Products</strong> before creating purchase orders.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Supplier*</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none font-semibold"
                  >
                    {suppliers.length === 0 ? (
                      <option value={0}>No suppliers registered</option>
                    ) : (
                      suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.company}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Warehouse*</label>
                  <select
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none font-semibold"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Purchase Date*</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* Line Items Table */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-xs">Line Items & Unit Costs:</span>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                      <tr>
                        <th className="p-2">Product</th>
                        <th className="p-2 w-20 text-center">Qty</th>
                        <th className="p-2 w-24 text-right">Unit Cost ($)</th>
                        <th className="p-2 w-20 text-right">Discount</th>
                        <th className="p-2 w-24 text-right">Total</th>
                        <th className="p-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lineItems.map((item, idx) => {
                        const lineTotal = item.quantity * item.unitCost - (item.discount || 0);
                        return (
                          <tr key={idx}>
                            <td className="p-2">
                              <select
                                value={item.productId}
                                onChange={(e) => handleUpdateItem(idx, 'productId', e.target.value)}
                                className="w-full p-1 bg-white border border-slate-200 rounded text-xs"
                              >
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({p.sku})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateItem(idx, 'quantity', parseInt(e.target.value, 10) || 1)
                                }
                                className="w-full p-1 border border-slate-200 rounded text-center font-mono font-bold"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                value={item.unitCost}
                                onChange={(e) =>
                                  handleUpdateItem(idx, 'unitCost', parseFloat(e.target.value) || 0)
                                }
                                className="w-full p-1 border border-slate-200 rounded text-right font-mono"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                value={item.discount}
                                onChange={(e) =>
                                  handleUpdateItem(idx, 'discount', parseFloat(e.target.value) || 0)
                                }
                                className="w-full p-1 border border-slate-200 rounded text-right font-mono"
                              />
                            </td>
                            <td className="p-2 text-right font-mono font-bold text-slate-900">
                              ${lineTotal.toFixed(2)}
                            </td>
                            <td className="p-2 text-center">
                              {lineItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLineItem(idx)}
                                  className="text-slate-400 hover:text-rose-600 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Settlement Section */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Calculated Purchase Total:</span>
                  <span className="font-mono font-bold text-base text-slate-900">
                    ${computedTotal.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Initial Paid Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={paidAmountInput}
                      onChange={(e) => setPaidAmountInput(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Remaining balance will automatically create a Supplier Payable debt.
                    </span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold"
                    >
                      <option value="Bank">Bank Wire / Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Purchase Notes / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Vendor Invoice Ref #INV-99214"
                  value={purchaseNotes}
                  onChange={(e) => setPurchaseNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Receive Stock & Save PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PURCHASE ORDER DOCUMENT MODAL */}
      {viewingPurchase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Purchase Order Document</h3>
                <p className="text-xs text-slate-400">{viewingPurchase.purchaseNumber}</p>
              </div>
              <button onClick={() => setViewingPurchase(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{settings.businessName}</div>
                  <div className="text-slate-500">{settings.address}</div>
                  <div className="text-slate-500">Tel: {settings.phone}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-slate-900">
                    {viewingPurchase.purchaseNumber}
                  </div>
                  <div className="text-slate-500">Date: {viewingPurchase.purchaseDate}</div>
                  <div className="font-bold uppercase text-[10px] text-emerald-700 mt-1">
                    Status: {viewingPurchase.orderStatus}
                  </div>
                </div>
              </div>

              {/* Supplier Info */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Vendor / Supplier:
                </span>
                <div className="font-bold text-slate-800">
                  {suppliers.find((s) => s.id === viewingPurchase.supplierId)?.company}
                </div>
                <div className="text-slate-500">
                  {suppliers.find((s) => s.id === viewingPurchase.supplierId)?.address}
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <tr>
                      <th className="p-2">Item</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Unit Cost</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {viewingPurchase.items.map((it, i) => (
                      <tr key={i}>
                        <td className="p-2 font-sans font-semibold text-slate-800">
                          {it.productName || `Product #${it.productId}`}
                        </td>
                        <td className="p-2 text-center">{it.quantity}</td>
                        <td className="p-2 text-right">${it.unitCost.toFixed(2)}</td>
                        <td className="p-2 text-right font-bold text-slate-900">
                          ${it.lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="space-y-1 text-right font-mono text-xs">
                <div>Subtotal: ${viewingPurchase.subtotal.toFixed(2)}</div>
                {viewingPurchase.discount > 0 && (
                  <div className="text-rose-600">Discount: -${viewingPurchase.discount.toFixed(2)}</div>
                )}
                {viewingPurchase.tax > 0 && <div>Tax: ${viewingPurchase.tax.toFixed(2)}</div>}
                <div className="font-bold text-base text-slate-900 pt-1 border-t border-slate-200">
                  Total: ${viewingPurchase.total.toFixed(2)}
                </div>
                <div className="text-emerald-700">Paid: ${viewingPurchase.paidAmount.toFixed(2)}</div>
                {viewingPurchase.remainingAmount > 0 && (
                  <div className="text-rose-600 font-bold">
                    Balance Due: ${viewingPurchase.remainingAmount.toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PO</span>
              </button>
              <button
                onClick={() => setViewingPurchase(null)}
                className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

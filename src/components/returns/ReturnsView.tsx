import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { ReturnRecord } from '../../types/inventory';
import { Undo2, Plus, Search, Eye, X, AlertCircle } from 'lucide-react';

export const ReturnsView: React.FC = () => {
  const {
    returns,
    sales,
    purchases,
    products,
    customers,
    suppliers,
    settings,
    createSalesReturn,
    createPurchaseReturn,
    showToast,
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'sales_returns' | 'purchase_returns'>('sales_returns');

  // Sales Return Modal State
  const [isSalesReturnOpen, setIsSalesReturnOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<number>(sales[0]?.id || 1);
  const [returnItems, setReturnItems] = useState<{ productId: number; quantity: number; unitPrice: number; restockToInventory: boolean }[]>([]);
  const [salesReturnReason, setSalesReturnReason] = useState('Customer changed specification / Defect');

  // Purchase Return Modal State
  const [isPurReturnOpen, setIsPurReturnOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number>(purchases[0]?.id || 1);
  const [purReturnItems, setPurReturnItems] = useState<{ productId: number; quantity: number; unitPrice: number }[]>([]);
  const [purReturnReason, setPurReturnReason] = useState('Damaged in transit / Vendor RMA');

  // Open Sales Return Modal
  const handleOpenSalesReturn = () => {
    const sale = sales.find((s) => s.id === selectedSaleId) || sales[0];
    if (sale) {
      setReturnItems(
        sale.items.map((it) => ({
          productId: it.productId,
          quantity: 1,
          unitPrice: it.unitPrice,
          restockToInventory: true,
        }))
      );
    }
    setIsSalesReturnOpen(true);
  };

  // Open Purchase Return Modal
  const handleOpenPurReturn = () => {
    const po = purchases.find((p) => p.id === selectedPurchaseId) || purchases[0];
    if (po) {
      setPurReturnItems(
        po.items.map((it) => ({
          productId: it.productId,
          quantity: 1,
          unitPrice: it.unitCost,
        }))
      );
    }
    setIsPurReturnOpen(true);
  };

  const handleSubmitSalesReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createSalesReturn({
      saleId: selectedSaleId,
      items: returnItems,
      reason: salesReturnReason,
    });
    if (res.success) {
      setIsSalesReturnOpen(false);
    } else {
      showToast(res.error || 'Failed to process sales return', 'error');
    }
  };

  const handleSubmitPurReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createPurchaseReturn({
      purchaseId: selectedPurchaseId,
      items: purReturnItems,
      reason: purReturnReason,
    });
    if (res.success) {
      setIsPurReturnOpen(false);
    } else {
      showToast(res.error || 'Failed to process purchase return', 'error');
    }
  };

  const salesReturnsList = returns.filter((r) => r.returnType === 'sale_return');
  const purchaseReturnsList = returns.filter((r) => r.returnType === 'purchase_return');

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Returns Management (Sales & Purchase)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Process customer return refunds and supplier vendor RMAs with automated stock adjustments
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'sales_returns' ? (
            <button
              onClick={handleOpenSalesReturn}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Process Sales Return</span>
            </button>
          ) : (
            <button
              onClick={handleOpenPurReturn}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Return Goods to Supplier</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('sales_returns')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            activeTab === 'sales_returns'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Customer Sales Returns ({salesReturnsList.length})
        </button>
        <button
          onClick={() => setActiveTab('purchase_returns')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            activeTab === 'purchase_returns'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Supplier Purchase Returns ({purchaseReturnsList.length})
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Return #</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Ref Transaction #</th>
              <th className="py-3 px-4">{activeTab === 'sales_returns' ? 'Customer' : 'Supplier'}</th>
              <th className="py-3 px-4 text-right">Refund / Credit Amount</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {(activeTab === 'sales_returns' ? salesReturnsList : purchaseReturnsList).length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                  No returns processed in this category yet.
                </td>
              </tr>
            ) : (
              (activeTab === 'sales_returns' ? salesReturnsList : purchaseReturnsList).map((r) => {
                const partyName =
                  r.returnType === 'sale_return'
                    ? customers.find((c) => c.id === r.partyId)?.name
                    : suppliers.find((s) => s.id === r.partyId)?.company;

                return (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{r.returnNumber}</td>
                    <td className="py-3 px-4 text-slate-600">{r.returnDate}</td>
                    <td className="py-3 px-4 text-indigo-600 font-semibold">{r.referenceNo}</td>
                    <td className="py-3 px-4 font-sans text-slate-800">{partyName}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      {settings.currencySymbol}{r.totalRefundAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-500">{r.reason}</td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase bg-emerald-50 text-emerald-700">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* SALES RETURN MODAL */}
      {isSalesReturnOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Process Customer Sales Return</h3>
              <button onClick={() => setIsSalesReturnOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSalesReturn} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Original Sale*</label>
                <select
                  value={selectedSaleId}
                  onChange={(e) => {
                    const sid = Number(e.target.value);
                    setSelectedSaleId(sid);
                    const s = sales.find((sale) => sale.id === sid);
                    if (s) {
                      setReturnItems(
                        s.items.map((it) => ({
                          productId: it.productId,
                          quantity: 1,
                          unitPrice: it.unitPrice,
                          restockToInventory: true,
                        }))
                      );
                    }
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none font-semibold"
                >
                  {sales.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.saleNumber} (${s.total.toFixed(2)}) — {s.saleDate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Returnable Items:</label>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg p-2 max-h-48 overflow-y-auto">
                  {returnItems.map((item, idx) => {
                    const prod = products.find((p) => p.id === item.productId);
                    return (
                      <div key={idx} className="py-2 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900">{prod?.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            ${item.unitPrice.toFixed(2)} each
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 1;
                              const updated = [...returnItems];
                              updated[idx].quantity = val;
                              setReturnItems(updated);
                            }}
                            className="w-14 p-1 border border-slate-300 rounded text-center font-mono font-bold"
                          />

                          <label className="flex items-center gap-1 text-[11px] text-slate-600 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={item.restockToInventory}
                              onChange={(e) => {
                                const updated = [...returnItems];
                                updated[idx].restockToInventory = e.target.checked;
                                setReturnItems(updated);
                              }}
                            />
                            <span>Restock</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason for Return*</label>
                <input
                  type="text"
                  required
                  value={salesReturnReason}
                  onChange={(e) => setSalesReturnReason(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSalesReturnOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Confirm & Refund Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PURCHASE RETURN MODAL */}
      {isPurReturnOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Return Items to Supplier</h3>
              <button onClick={() => setIsPurReturnOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPurReturn} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Purchase Order*</label>
                <select
                  value={selectedPurchaseId}
                  onChange={(e) => {
                    const pid = Number(e.target.value);
                    setSelectedPurchaseId(pid);
                    const po = purchases.find((p) => p.id === pid);
                    if (po) {
                      setPurReturnItems(
                        po.items.map((it) => ({
                          productId: it.productId,
                          quantity: 1,
                          unitPrice: it.unitCost,
                        }))
                      );
                    }
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none font-semibold"
                >
                  {purchases.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.purchaseNumber} (${p.total.toFixed(2)}) — {p.purchaseDate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Items to Return:</label>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg p-2 max-h-48 overflow-y-auto">
                  {purReturnItems.map((item, idx) => {
                    const prod = products.find((p) => p.id === item.productId);
                    return (
                      <div key={idx} className="py-2 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900">{prod?.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            ${item.unitPrice.toFixed(2)} cost
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 1;
                              const updated = [...purReturnItems];
                              updated[idx].quantity = val;
                              setPurReturnItems(updated);
                            }}
                            className="w-14 p-1 border border-slate-300 rounded text-center font-mono font-bold"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">RMA Reason*</label>
                <input
                  type="text"
                  required
                  value={purReturnReason}
                  onChange={(e) => setPurReturnReason(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPurReturnOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Deduct Stock & Issue RMA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

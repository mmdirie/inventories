import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  Boxes,
  Building2,
  ArrowRightLeft,
  SlidersHorizontal,
  History,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle,
  X,
} from 'lucide-react';

interface StockManagementViewProps {
  onNavigate?: (module: string) => void;
}

export const StockManagementView: React.FC<StockManagementViewProps> = ({ onNavigate }) => {
  const {
    warehouses,
    products,
    warehouseStock,
    stockMovements,
    stockTransfers,
    stockAdjustments,
    users,
    createTransfer,
    createAdjustment,
    addWarehouse,
    showToast,
    hasPermission,
  } = useInventory();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'warehouses' | 'transfers' | 'adjustments' | 'movements' | 'low_stock'
  >('overview');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<number | 'all'>('all');

  // Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferSourceWh, setTransferSourceWh] = useState<number>(warehouses[0]?.id || 1);
  const [transferDestWh, setTransferDestWh] = useState<number>(warehouses[1]?.id || 2);
  const [transferProductId, setTransferProductId] = useState<number>(products[0]?.id || 1);
  const [transferQty, setTransferQty] = useState<number>(1);
  const [transferNotes, setTransferNotes] = useState<string>('');

  // Adjustment Modal State
  const [isAdjModalOpen, setIsAdjModalOpen] = useState(false);
  const [adjWarehouseId, setAdjWarehouseId] = useState<number>(warehouses[0]?.id || 1);
  const [adjProductId, setAdjProductId] = useState<number>(products[0]?.id || 1);
  const [adjType, setAdjType] = useState<'Increase' | 'Decrease'>('Decrease');
  const [adjQty, setAdjQty] = useState<number>(1);
  const [adjReason, setAdjReason] = useState<any>('Damaged');
  const [adjNotes, setAdjNotes] = useState<string>('');

  // Add Warehouse Modal State
  const [isWhModalOpen, setIsWhModalOpen] = useState(false);
  const [whName, setWhName] = useState('');
  const [whCode, setWhCode] = useState('');
  const [whLocation, setWhLocation] = useState('');
  const [whManager, setWhManager] = useState('');
  const [whPhone, setWhPhone] = useState('');
  const [whCapacity, setWhCapacity] = useState(10000);

  // Helper for product stock
  const getStock = (whId: number, prodId: number) => {
    const ws = warehouseStock.find((s) => s.warehouseId === whId && s.productId === prodId);
    return ws ? ws.quantity : 0;
  };

  const getTotalStock = (prodId: number) => {
    return warehouseStock
      .filter((ws) => ws.productId === prodId)
      .reduce((sum, ws) => sum + ws.quantity, 0);
  };

  // Submit Transfer
  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createTransfer({
      sourceWarehouseId: transferSourceWh,
      destinationWarehouseId: transferDestWh,
      transferDate: new Date().toISOString().slice(0, 10),
      items: [{ productId: transferProductId, quantity: transferQty }],
      notes: transferNotes,
    });
    if (res.success) {
      setIsTransferModalOpen(false);
      setTransferNotes('');
    } else {
      showToast(res.error || 'Failed to complete transfer', 'error');
    }
  };

  // Submit Adjustment
  const handleExecuteAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createAdjustment({
      productId: adjProductId,
      warehouseId: adjWarehouseId,
      adjustmentType: adjType,
      quantity: adjQty,
      reason: adjReason,
      notes: adjNotes,
    });
    if (res.success) {
      setIsAdjModalOpen(false);
      setAdjNotes('');
    } else {
      showToast(res.error || 'Failed to record adjustment', 'error');
    }
  };

  // Submit Warehouse
  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName.trim() || !whCode.trim()) return;
    addWarehouse({
      name: whName.trim(),
      code: whCode.trim().toUpperCase(),
      location: whLocation.trim(),
      managerName: whManager.trim(),
      phone: whPhone.trim(),
      capacity: Number(whCapacity),
      isDefault: false,
      status: 'active',
    });
    setIsWhModalOpen(false);
    setWhName('');
    setWhCode('');
    setWhLocation('');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Inventory & Warehouse Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stock ledger, physical adjustments, transfers, and warehouse distribution
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasPermission('stock.transfer') && (
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Transfer Stock</span>
            </button>
          )}

          {hasPermission('stock.adjust') && (
            <button
              onClick={() => setIsAdjModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Adjust Count</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'overview'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Stock Matrix by Warehouse
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'movements'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Immutable Movement Ledger ({stockMovements.length})
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'transfers'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Inter-Warehouse Transfers ({stockTransfers.length})
        </button>
        <button
          onClick={() => setActiveTab('adjustments')}
          className={`px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'adjustments'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Audit Count Adjustments ({stockAdjustments.length})
        </button>
        <button
          onClick={() => setActiveTab('warehouses')}
          className={`px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'warehouses'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Warehouses Directory ({warehouses.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW MATRIX */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search inventory items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
            <div className="text-xs text-slate-500">
              Showing physical inventory balances per storage facility
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Product / SKU</th>
                    <th className="py-3 px-4">Unit</th>
                    {warehouses.map((wh) => (
                      <th key={wh.id} className="py-3 px-4 text-center">
                        {wh.name}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          ({wh.code})
                        </span>
                      </th>
                    ))}
                    <th className="py-3 px-4 text-center">Total Balance</th>
                    <th className="py-3 px-4 text-center">Alert Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={warehouses.length + 4} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                            <Boxes className="w-6 h-6" />
                          </div>
                          <div className="font-bold text-slate-900 text-sm mb-1">No products registered in warehouse matrix</div>
                          <p className="text-xs text-slate-500 max-w-sm mb-4">
                            Add products with inventory units to view and track physical balances across all warehouses.
                          </p>
                          {onNavigate && (
                            <button
                              onClick={() => onNavigate('products')}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add New Product</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    products
                      .filter((p) => {
                        if (!searchQuery.trim()) return true;
                        const q = searchQuery.toLowerCase();
                        return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
                      })
                      .map((p) => {
                        const totalQty = getTotalStock(p.id);
                        const isLow = totalQty <= p.minStockLevel;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900">{p.name}</div>
                              <div className="font-mono text-[11px] text-slate-500">{p.sku}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{p.unit}</td>
                            {warehouses.map((wh) => {
                              const whQty = getStock(wh.id, p.id);
                              return (
                                <td
                                  key={wh.id}
                                  className="py-3 px-4 text-center font-mono font-bold text-slate-800"
                                >
                                  {whQty}
                                </td>
                              );
                            })}
                            <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                              <span className="px-2 py-0.5 rounded bg-slate-100">
                                {totalQty} {p.unit}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {isLow ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  <AlertTriangle className="w-3 h-3" /> Low Stock
                                </span>
                              ) : (
                                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                  Sufficient
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IMMUTABLE STOCK MOVEMENTS LEDGER */}
      {activeTab === 'movements' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <span className="text-xs text-slate-600">
              Complete audit ledger tracking all ins and outs: Purchases, Sales, Transfers, Adjustments
            </span>
            <span className="text-xs font-mono text-slate-500">
              {stockMovements.length} logged entries
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Warehouse</th>
                    <th className="py-3 px-4">Movement Type</th>
                    <th className="py-3 px-4 text-center">Qty In</th>
                    <th className="py-3 px-4 text-center">Qty Out</th>
                    <th className="py-3 px-4 text-center">Balance After</th>
                    <th className="py-3 px-4">Reference No.</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {stockMovements.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center font-sans">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                            <History className="w-6 h-6" />
                          </div>
                          <div className="font-bold text-slate-900 text-sm mb-1">No stock movements recorded yet</div>
                          <p className="text-xs text-slate-500 max-w-sm">
                            Every purchase receipt, POS checkout, transfer, or count adjustment writes an immutable ledger entry here.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    stockMovements.map((sm) => {
                      const prod = products.find((p) => p.id === sm.productId);
                      const wh = warehouses.find((w) => w.id === sm.warehouseId);

                      let typeBg = 'bg-slate-100 text-slate-800';
                      if (sm.movementType === 'Purchase' || sm.movementType === 'Sales Return') {
                        typeBg = 'bg-emerald-100 text-emerald-800';
                      } else if (sm.movementType === 'Sale' || sm.movementType === 'Purchase Return') {
                        typeBg = 'bg-rose-100 text-rose-800';
                      } else if (sm.movementType.includes('Transfer')) {
                        typeBg = 'bg-blue-100 text-blue-800';
                      } else if (sm.movementType === 'Adjustment') {
                        typeBg = 'bg-amber-100 text-amber-800';
                      }

                      return (
                        <tr key={sm.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                            {sm.createdAt}
                          </td>
                          <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                            {prod?.name || `#${sm.productId}`}
                          </td>
                          <td className="py-3 px-4 font-sans text-slate-700">{wh?.code || '—'}</td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded ${typeBg}`}>
                              {sm.movementType}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                            {sm.quantityIn > 0 ? `+${sm.quantityIn}` : '—'}
                          </td>
                          <td className="py-3 px-4 text-center text-rose-600 font-bold">
                            {sm.quantityOut > 0 ? `-${sm.quantityOut}` : '—'}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-900">
                            {sm.balanceAfter}
                          </td>
                          <td className="py-3 px-4 text-slate-800 font-semibold">{sm.referenceNo}</td>
                          <td className="py-3 px-4 font-sans text-slate-500 text-[11px] truncate max-w-xs">
                            {sm.notes || '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSFERS */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Inter-warehouse logistical stock transfers with dual-entry ledger deduction & receipt
            </span>
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Initiate Stock Transfer</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Transfer #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Source Warehouse</th>
                  <th className="py-3 px-4">Destination Warehouse</th>
                  <th className="py-3 px-4">Transferred Items</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center font-sans">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                          <ArrowRightLeft className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-slate-900 text-sm mb-1">No inter-warehouse transfers recorded yet</div>
                        <p className="text-xs text-slate-500 max-w-sm mb-4">
                          Transfer stock between warehouses with dual-entry source deduction and destination receipt.
                        </p>
                        <button
                          onClick={() => setIsTransferModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Initiate Stock Transfer</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  stockTransfers.map((st) => {
                    const source = warehouses.find((w) => w.id === st.sourceWarehouseId);
                    const dest = warehouses.find((w) => w.id === st.destinationWarehouseId);
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                          {st.transferNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{st.transferDate}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{source?.name}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{dest?.name}</td>
                        <td className="py-3 px-4">
                          {st.items.map((it, idx) => {
                            const p = products.find((prod) => prod.id === it.productId);
                            return (
                              <div key={idx} className="font-mono text-[11px] text-slate-700">
                                {it.quantity}x {p?.name || `Product #${it.productId}`}
                              </div>
                            );
                          })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase bg-emerald-50 text-emerald-700">
                            {st.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{st.notes || '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ADJUSTMENTS */}
      {activeTab === 'adjustments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Audit reconciliations, damage write-offs, and discrepancy adjustments
            </span>
            <button
              onClick={() => setIsAdjModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Count Adjustment</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Adjustment #</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4 text-center">Type & Quantity</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockAdjustments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center font-sans">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                          <SlidersHorizontal className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-slate-900 text-sm mb-1">No inventory count adjustments recorded</div>
                        <p className="text-xs text-slate-500 max-w-sm mb-4">
                          Reconcile physical warehouse audit counts, write off damages, or correct clerical deviations.
                        </p>
                        <button
                          onClick={() => setIsAdjModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Record Count Adjustment</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  stockAdjustments.map((sa) => {
                    const prod = products.find((p) => p.id === sa.productId);
                    const wh = warehouses.find((w) => w.id === sa.warehouseId);
                    return (
                      <tr key={sa.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                          {sa.adjustmentNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{sa.createdAt}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{prod?.name}</td>
                        <td className="py-3 px-4 text-slate-700">{wh?.name}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              sa.adjustmentType === 'Increase'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {sa.adjustmentType === 'Increase' ? '+' : '-'}
                            {sa.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{sa.reason}</td>
                        <td className="py-3 px-4 text-slate-500">{sa.notes || '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: WAREHOUSES DIRECTORY */}
      {activeTab === 'warehouses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Multiple physical locations and depots under single organization ownership
            </span>
            <button
              onClick={() => setIsWhModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Warehouse</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {warehouses.map((wh) => {
              const whQty = warehouseStock
                .filter((ws) => ws.warehouseId === wh.id)
                .reduce((sum, ws) => sum + ws.quantity, 0);

              return (
                <div key={wh.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{wh.name}</h3>
                      <span className="font-mono text-xs text-slate-500">{wh.code}</span>
                    </div>
                    {wh.isDefault && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white uppercase">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div>Location: {wh.location}</div>
                    <div>Manager: {wh.managerName || '—'}</div>
                    <div>Phone: {wh.phone || '—'}</div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Inventory Stored:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {whQty.toLocaleString()} units
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TRANSFER MODAL */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Execute Inter-Warehouse Stock Transfer</h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Source Warehouse*</label>
                  <select
                    value={transferSourceWh}
                    onChange={(e) => setTransferSourceWh(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Destination Warehouse*</label>
                  <select
                    value={transferDestWh}
                    onChange={(e) => setTransferDestWh(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Product*</label>
                <select
                  value={transferProductId}
                  onChange={(e) => setTransferProductId(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none font-semibold"
                >
                  {products.map((p) => {
                    const avail = getStock(transferSourceWh, p.id);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} (Available: {avail} {p.unit})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Transfer Quantity*</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferQty}
                  onChange={(e) => setTransferQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Replenishing retail branch stock"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Confirm & Move Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUSTMENT MODAL */}
      {isAdjModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Physical Inventory Count Adjustment</h3>
              <button onClick={() => setIsAdjModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteAdjustment} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Warehouse*</label>
                <select
                  value={adjWarehouseId}
                  onChange={(e) => setAdjWarehouseId(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product*</label>
                <select
                  value={adjProductId}
                  onChange={(e) => setAdjProductId(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none font-semibold"
                >
                  {products.map((p) => {
                    const avail = getStock(adjWarehouseId, p.id);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} (Current Stock: {avail} {p.unit})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Adjustment Type*</label>
                  <select
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="Decrease">Decrease (Deficit / Loss)</option>
                    <option value="Increase">Increase (Surplus / Found)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity*</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjQty}
                    onChange={(e) => setAdjQty(parseInt(e.target.value, 10) || 1)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason Code*</label>
                <select
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="Damaged">Damaged Goods</option>
                  <option value="Expired">Expired Stock</option>
                  <option value="Inventory Audit Discrepancy">Physical Audit Discrepancy</option>
                  <option value="Theft or Loss">Theft / Unaccounted Loss</option>
                  <option value="Found Stock">Found / Unregistered Inventory</option>
                  <option value="Other">Other Operational Cause</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Audit Notes / Explanation*</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain reason for discrepancy for system audit"
                  value={adjNotes}
                  onChange={(e) => setAdjNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Log Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE WAREHOUSE MODAL */}
      {isWhModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Add New Warehouse Location</h3>
              <button onClick={() => setIsWhModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Warehouse Name*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Logistics Depot"
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Code / Identifier*</label>
                  <input
                    type="text"
                    required
                    placeholder="WH-SOUTH"
                    value={whCode}
                    onChange={(e) => setWhCode(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Capacity (units)</label>
                  <input
                    type="number"
                    value={whCapacity}
                    onChange={(e) => setWhCapacity(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Location Address*</label>
                <input
                  type="text"
                  required
                  value={whLocation}
                  onChange={(e) => setWhLocation(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Manager Name</label>
                  <input
                    type="text"
                    value={whManager}
                    onChange={(e) => setWhManager(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={whPhone}
                    onChange={(e) => setWhPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWhModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Create Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

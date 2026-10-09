import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { BarcodeSvg } from '../common/BarcodeSvg';
import { Barcode, Printer, Search, CheckSquare, Square } from 'lucide-react';

export const BarcodeCenterView: React.FC = () => {
  const { products, settings } = useInventory();
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>(products.map((p) => p.id));
  const [labelsPerProduct, setLabelsPerProduct] = useState<number>(2);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSelect = (id: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedProductIds(products.map((p) => p.id));
  };

  const deselectAll = () => {
    setSelectedProductIds([]);
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.barcode && p.barcode.includes(q));
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Barcode Generation & Label Printing Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Render Code-128 standard barcode labels with SKUs and retail prices ready for thermal and adhesive sheet printing
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Print Barcode Sheets</span>
        </button>
      </div>

      {/* Control Panel (Hidden on print) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Labels per Item:</span>
            <input
              type="number"
              min="1"
              max="20"
              value={labelsPerProduct}
              onChange={(e) => setLabelsPerProduct(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-16 p-1 border border-slate-300 rounded font-mono text-center text-xs font-bold"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={selectAll}
              className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded border border-slate-200 font-semibold"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded border border-slate-200 font-semibold"
            >
              Clear Selection
            </button>
          </div>
        </div>

        {/* Product selector strip */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-700 block mb-2">
            Select Products to Print ({selectedProductIds.length} selected):
          </span>
          {products.length === 0 ? (
            <div className="text-xs text-slate-500 py-3 italic">
              No products available in inventory yet. Add products to generate barcodes.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
              {filteredProducts.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleSelect(p.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-colors ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* PRINTABLE BARCODE LABELS GRID */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {products.length === 0 || selectedProductIds.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Barcode className="w-6 h-6" />
            </div>
            <div className="font-bold text-slate-900 text-sm mb-1">
              {products.length === 0 ? 'No products registered in catalog' : 'No products selected for printing'}
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              {products.length === 0
                ? 'Register items with SKU and barcodes to preview and print custom thermal labels.'
                : 'Select one or more products above to generate print-ready barcode label sheets.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 print:grid-cols-3 print:gap-3">
            {products
              .filter((p) => selectedProductIds.includes(p.id))
              .flatMap((p) =>
                Array.from({ length: labelsPerProduct }).map((_, idx) => (
                  <div
                    key={`${p.id}-${idx}`}
                    className="p-3 bg-white rounded-lg border border-slate-300 flex flex-col items-center justify-between text-center gap-1.5 shadow-2xs break-inside-avoid"
                  >
                    <div className="w-full">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        {settings.businessName}
                      </span>
                      <div className="font-bold text-slate-900 text-xs truncate max-w-full mt-0.5">
                        {p.name}
                      </div>
                    </div>

                    <BarcodeSvg value={p.barcode || p.sku} width={150} height={42} />

                    <div className="w-full flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <span className="font-mono text-slate-600">{p.sku}</span>
                      <span className="font-mono font-bold text-slate-900">
                        {settings.currencySymbol}{p.sellingPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
          </div>
        )}
      </div>
    </div>
  );
};

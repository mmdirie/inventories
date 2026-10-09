import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Sale, Invoice } from '../../types/inventory';
import { BarcodeSvg } from '../common/BarcodeSvg';
import {
  Receipt,
  FileText,
  Search,
  Eye,
  Printer,
  X,
  CreditCard,
  Building2,
  Calendar,
  DollarSign,
  Plus,
  ShoppingBag,
} from 'lucide-react';

interface SalesViewProps {
  onNavigate?: (module: string) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({ onNavigate }) => {
  const { sales, invoices, customers, warehouses, settings, debts } = useInventory();

  const [activeTab, setActiveTab] = useState<'sales' | 'invoices'>('sales');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');

  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Filtered Sales
  const filteredSales = sales.filter((s) => {
    if (statusFilter !== 'all' && s.paymentStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const customer = customers.find((c) => c.id === s.customerId);
      const matchesNum = s.saleNumber.toLowerCase().includes(q);
      const matchesCust = customer && customer.name.toLowerCase().includes(q);
      return matchesNum || matchesCust;
    }
    return true;
  });

  // Filtered Invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const customer = customers.find((c) => c.id === inv.customerId);
      const matchesNum = inv.invoiceNumber.toLowerCase().includes(q);
      const matchesCust = customer && customer.name.toLowerCase().includes(q);
      return matchesNum || matchesCust;
    }
    return true;
  });

  // Get matching sale for an invoice
  const getSaleForInvoice = (inv: Invoice): Sale | undefined => {
    return sales.find((s) => s.id === inv.saleId);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Sales & Invoices Register
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical sales orders, formal commercial invoices, and customer payment allocations
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'sales'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales Orders ({sales.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'invoices'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Commercial Invoices ({invoices.length})
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={
              activeTab === 'sales'
                ? 'Search by Sale # or Customer Name...'
                : 'Search by Invoice # or Customer Name...'
            }
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
          <option value="unpaid">Unpaid Orders</option>
        </select>
      </div>

      {/* SALES ORDERS TAB */}
      {activeTab === 'sales' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Sale #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Type</th>
                  <th className="py-3 px-4 text-center">Payment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center font-sans">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                          <Receipt className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-slate-900 text-sm mb-1">No sales orders recorded yet ($0.00)</div>
                        <p className="text-xs text-slate-500 max-w-sm mb-4">
                          Process retail or wholesale sales transactions via the Point of Sale terminal.
                        </p>
                        {onNavigate && (
                          <button
                            onClick={() => onNavigate('pos')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Open POS / New Sale</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => {
                    const customer = customers.find((c) => c.id === sale.customerId);
                    const warehouse = warehouses.find((w) => w.id === sale.warehouseId);
                    const matchingInv = invoices.find((inv) => inv.saleId === sale.id);

                    return (
                      <tr key={sale.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-slate-900">{sale.saleNumber}</td>
                        <td className="py-3 px-4 text-slate-600">{sale.saleDate}</td>
                        <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                          {customer?.name || 'Walk-in'}
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-700">{warehouse?.code}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {settings.currencySymbol}{sale.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-700">
                          {settings.currencySymbol}{sale.paidAmount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-rose-700 font-bold">
                          {settings.currencySymbol}{sale.remainingAmount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {sale.saleType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                              sale.paymentStatus === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : sale.paymentStatus === 'partial'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {sale.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-sans">
                          {matchingInv && (
                            <button
                              onClick={() => setViewingInvoice(matchingInv)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                              title="View Formal Invoice"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
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
      ) : (
        /* INVOICES TAB */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Invoice Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center font-sans">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-slate-900 text-sm mb-1">No invoices generated yet ($0.00)</div>
                        <p className="text-xs text-slate-500 max-w-sm mb-4">
                          Tax invoices are automatically created upon completing sales transactions.
                        </p>
                        {onNavigate && (
                          <button
                            onClick={() => onNavigate('pos')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Open POS / New Sale</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const customer = customers.find((c) => c.id === inv.customerId);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-slate-900">{inv.invoiceNumber}</td>
                        <td className="py-3 px-4 text-slate-600">{inv.invoiceDate}</td>
                        <td className="py-3 px-4 text-slate-600">{inv.dueDate}</td>
                        <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                          {customer?.name}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {settings.currencySymbol}{inv.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-700">
                          {settings.currencySymbol}{inv.paidAmount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-rose-700 font-bold">
                          {settings.currencySymbol}{inv.remainingAmount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                              inv.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.status === 'partial'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-sans">
                          <button
                            onClick={() => setViewingInvoice(inv)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Print / View Invoice"
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
      )}

      {/* PRINTABLE COMMERCIAL INVOICE MODAL */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
              <div>
                <h3 className="font-bold text-sm">Commercial Tax Invoice</h3>
                <p className="text-xs text-slate-400">{viewingInvoice.invoiceNumber}</p>
              </div>
              <button onClick={() => setViewingInvoice(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Body */}
            <div className="p-8 space-y-6 text-xs bg-white text-slate-800">
              {/* Header */}
              <div className="flex justify-between items-start pb-6 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{settings.businessName}</h2>
                  <div className="text-slate-500 mt-1">{settings.address}</div>
                  <div className="text-slate-500">Phone: {settings.phone} · Email: {settings.email}</div>
                  <div className="font-mono text-slate-700 mt-1">Tax ID: {settings.taxNumber}</div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono uppercase bg-slate-900 text-white px-2 py-0.5 rounded font-bold">
                    TAX INVOICE
                  </span>
                  <div className="font-mono font-bold text-base text-slate-900 mt-2">
                    {viewingInvoice.invoiceNumber}
                  </div>
                  <div className="text-slate-500">Date: {viewingInvoice.invoiceDate}</div>
                  <div className="text-slate-500">Due: {viewingInvoice.dueDate}</div>
                </div>
              </div>

              {/* Customer / Bill To */}
              <div className="flex justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Bill To:
                  </span>
                  <div className="font-bold text-slate-900 text-sm">
                    {customers.find((c) => c.id === viewingInvoice.customerId)?.name}
                  </div>
                  <div className="text-slate-500">
                    {customers.find((c) => c.id === viewingInvoice.customerId)?.address || 'In-Store POS'}
                  </div>
                  <div className="text-slate-500">
                    Phone: {customers.find((c) => c.id === viewingInvoice.customerId)?.phone}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Payment Status:
                  </span>
                  <span
                    className={`inline-block font-bold text-xs uppercase px-2 py-0.5 rounded ${
                      viewingInvoice.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : viewingInvoice.status === 'partial'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {viewingInvoice.status}
                  </span>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <tr>
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Discount</th>
                      <th className="p-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {getSaleForInvoice(viewingInvoice)?.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-sans font-semibold text-slate-800">
                          {item.productName || `Product #${item.productId}`}
                        </td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">
                          {settings.currencySymbol}{item.unitPrice.toFixed(2)}
                        </td>
                        <td className="p-3 text-right">
                          {item.discount > 0 ? `-${settings.currencySymbol}${item.discount.toFixed(2)}` : '—'}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          {settings.currencySymbol}{item.lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400">
                          Detailed line items unavailable
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary & Barcode */}
              <div className="flex flex-col sm:flex-row justify-between items-end gap-4 pt-2">
                <div className="space-y-2">
                  <BarcodeSvg value={viewingInvoice.invoiceNumber} width={180} height={45} />
                  <p className="text-[10px] text-slate-500 italic max-w-xs">
                    {settings.receiptFooterNote}
                  </p>
                </div>

                <div className="w-64 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>{settings.currencySymbol}{viewingInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  {viewingInvoice.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Discount:</span>
                      <span>-{settings.currencySymbol}{viewingInvoice.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Sales Tax ({settings.taxRate}%):</span>
                    <span>{settings.currencySymbol}{viewingInvoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Due:</span>
                    <span>{settings.currencySymbol}{viewingInvoice.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Amount Paid:</span>
                    <span>{settings.currencySymbol}{viewingInvoice.paidAmount.toFixed(2)}</span>
                  </div>
                  {viewingInvoice.remainingAmount > 0 && (
                    <div className="flex justify-between font-bold text-rose-600 pt-1 border-t border-slate-200">
                      <span>Balance Outstanding:</span>
                      <span>{settings.currencySymbol}{viewingInvoice.remainingAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setViewingInvoice(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
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

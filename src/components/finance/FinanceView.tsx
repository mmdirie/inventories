import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Expense, Payment, Debt } from '../../types/inventory';
import {
  Wallet,
  DollarSign,
  Plus,
  CreditCard,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  X,
  Search,
} from 'lucide-react';

export const FinanceView: React.FC = () => {
  const {
    expenses,
    expenseCategories,
    payments,
    debts,
    customers,
    suppliers,
    settings,
    addExpense,
    settleDebt,
    showToast,
    hasPermission,
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'expenses' | 'payments' | 'customer_debts' | 'supplier_debts'>('expenses');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Expense Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expCategoryId, setExpCategoryId] = useState<number>(expenseCategories[0]?.id || 1);
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState<string>('');
  const [expMethod, setExpMethod] = useState<'Cash' | 'Bank' | 'Mobile Money' | 'Other'>('Bank');
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [expNotes, setExpNotes] = useState('');

  // Debt Settle Modal
  const [debtToSettle, setDebtToSettle] = useState<Debt | null>(null);
  const [settleAmount, setSettleAmount] = useState<string>('');
  const [settleMethod, setSettleMethod] = useState<'Cash' | 'Bank' | 'Mobile Money' | 'Other'>('Bank');
  const [settleNotes, setSettleNotes] = useState('');

  // Total computations
  const totalExpenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCustomerDebtSum = debts
    .filter((d) => d.debtType === 'customer' && d.status !== 'paid')
    .reduce((sum, d) => sum + d.remainingAmount, 0);
  const totalSupplierDebtSum = debts
    .filter((d) => d.debtType === 'supplier' && d.status !== 'paid')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expAmount);
    if (!amt || amt <= 0) {
      showToast('Please enter a valid expense amount', 'error');
      return;
    }
    if (!expDescription.trim()) {
      showToast('Please provide an expense description', 'error');
      return;
    }

    addExpense({
      categoryId: expCategoryId,
      description: expDescription.trim(),
      amount: amt,
      paymentMethod: expMethod,
      expenseDate: expDate,
      notes: expNotes.trim(),
    });

    setIsExpenseModalOpen(false);
    setExpDescription('');
    setExpAmount('');
    setExpNotes('');
  };

  const handleExecuteSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtToSettle) return;
    const amt = parseFloat(settleAmount);
    if (!amt || amt <= 0 || amt > debtToSettle.remainingAmount) {
      showToast(`Invalid amount. Max payable is $${debtToSettle.remainingAmount.toFixed(2)}`, 'error');
      return;
    }

    settleDebt(debtToSettle.id, amt, settleMethod, settleNotes);
    setDebtToSettle(null);
    setSettleAmount('');
    setSettleNotes('');
  };

  const customerDebtsList = debts.filter((d) => d.debtType === 'customer');
  const supplierDebtsList = debts.filter((d) => d.debtType === 'supplier');

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Financial Ledger & Debt Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational expenses, unified transaction ledger, receivables, and payables
          </p>
        </div>

        {hasPermission('expenses.manage') && (
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Expense</span>
          </button>
        )}
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Operating Expenses</span>
            <div className="font-mono text-xl font-bold text-slate-900 mt-1">
              {settings.currencySymbol}{totalExpenseSum.toFixed(2)}
            </div>
          </div>
          <Wallet className="w-6 h-6 text-slate-400" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Customer Receivables (Debts)</span>
            <div className="font-mono text-xl font-bold text-rose-600 mt-1">
              {settings.currencySymbol}{totalCustomerDebtSum.toFixed(2)}
            </div>
          </div>
          <CreditCard className="w-6 h-6 text-rose-400" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Supplier Payables</span>
            <div className="font-mono text-xl font-bold text-amber-600 mt-1">
              {settings.currencySymbol}{totalSupplierDebtSum.toFixed(2)}
            </div>
          </div>
          <Building2 className="w-6 h-6 text-amber-400" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px text-xs font-semibold">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'expenses'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Operating Expenses ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'payments'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Unified Payments Register ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('customer_debts')}
          className={`px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'customer_debts'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Customer Debts Ledger ({customerDebtsList.length})
        </button>
        <button
          onClick={() => setActiveTab('supplier_debts')}
          className={`px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'supplier_debts'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Supplier Payables Ledger ({supplierDebtsList.length})
        </button>
      </div>

      {/* TAB 1: EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Ref #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center font-sans">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-slate-900 text-sm mb-1">No operational expenses recorded ($0.00)</div>
                      <p className="text-xs text-slate-500 max-w-sm mb-4">
                        Track facility rent, utilities, logistics freight, equipment maintenance, and administrative costs.
                      </p>
                      {hasPermission('expenses.manage') && (
                        <button
                          onClick={() => setIsExpenseModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Record New Expense</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => {
                  const category = expenseCategories.find((c) => c.id === exp.categoryId);
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{exp.referenceNo}</td>
                      <td className="py-3 px-4 text-slate-600">{exp.expenseDate}</td>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                        {category?.name || 'General'}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-800">{exp.description}</td>
                      <td className="py-3 px-4 font-sans">
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {exp.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {settings.currencySymbol}{exp.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-500">{exp.notes || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: CENTRALIZED PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Payment #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment Type</th>
                <th className="py-3 px-4">Party</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center font-sans">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-slate-900 text-sm mb-1">No payment transactions recorded yet ($0.00)</div>
                      <p className="text-xs text-slate-500 max-w-sm">
                        All POS sales collections and vendor purchase disbursements will appear in this unified financial ledger.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{p.paymentNumber}</td>
                    <td className="py-3 px-4 text-slate-600">{p.paymentDate}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                      <span className="px-2 py-0.5 rounded bg-slate-100">{p.paymentType}</span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-700">{p.partyName || '—'}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {settings.currencySymbol}{p.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-500">{p.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: CUSTOMER DEBTS */}
      {activeTab === 'customer_debts' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Invoice Ref #</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Original Amount</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Remaining Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {customerDebtsList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center font-sans">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-slate-900 text-sm mb-1">Zero outstanding customer receivables ($0.00)</div>
                      <p className="text-xs text-slate-500 max-w-sm">
                        All customer accounts are settled in full or no credit invoices have been issued.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                customerDebtsList.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900">{d.partyName}</td>
                    <td className="py-3 px-4 text-slate-700">{d.referenceNumber}</td>
                    <td className="py-3 px-4 text-slate-600">{d.dueDate}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      {settings.currencySymbol}{d.originalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-700">
                      {settings.currencySymbol}{d.paidAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-600">
                      {settings.currencySymbol}{d.remainingAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                          d.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.status === 'partially_paid'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {d.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      {d.status !== 'paid' && (
                        <button
                          onClick={() => {
                            setDebtToSettle(d);
                            setSettleAmount(d.remainingAmount.toFixed(2));
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px]"
                        >
                          Settle
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: SUPPLIER DEBTS */}
      {activeTab === 'supplier_debts' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Supplier / Vendor</th>
                <th className="py-3 px-4">PO Reference #</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Original Amount</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {supplierDebtsList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center font-sans">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-slate-900 text-sm mb-1">Zero outstanding vendor payables ($0.00)</div>
                      <p className="text-xs text-slate-500 max-w-sm">
                        All purchase orders from suppliers and vendors are paid in full.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                supplierDebtsList.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900">{d.partyName}</td>
                    <td className="py-3 px-4 text-slate-700">{d.referenceNumber}</td>
                    <td className="py-3 px-4 text-slate-600">{d.dueDate}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      {settings.currencySymbol}{d.originalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-700">
                      {settings.currencySymbol}{d.paidAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-amber-700">
                      {settings.currencySymbol}{d.remainingAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                          d.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.status === 'partially_paid'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {d.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      {d.status !== 'paid' && (
                        <button
                          onClick={() => {
                            setDebtToSettle(d);
                            setSettleAmount(d.remainingAmount.toFixed(2));
                          }}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-[11px]"
                        >
                          Pay Vendor
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* EXPENSE MODAL */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Record Operational Expense</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Expense Category*</label>
                <select
                  value={expCategoryId}
                  onChange={(e) => setExpCategoryId(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description / Memo*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Forklift maintenance & hydraulic oil replacement"
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Amount ($)*</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={expMethod}
                    onChange={(e) => setExpMethod(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="Bank">Bank Wire</option>
                    <option value="Cash">Cash</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Expense Date*</label>
                <input
                  type="date"
                  required
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes / Receipt Ref</label>
                <input
                  type="text"
                  placeholder="e.g. Receipt #REC-88401"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SETTLE DEBT MODAL */}
      {debtToSettle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                Settle {debtToSettle.debtType === 'customer' ? 'Customer Receivable' : 'Supplier Payable'}
              </h3>
              <button onClick={() => setDebtToSettle(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteSettle} className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800">{debtToSettle.partyName}</div>
                <div className="text-slate-500 font-mono">Ref: {debtToSettle.referenceNumber}</div>
                <div className="flex justify-between mt-2 pt-2 border-t border-slate-200 font-mono">
                  <span>Balance Due:</span>
                  <span className="font-bold text-rose-600">
                    {settings.currencySymbol}{debtToSettle.remainingAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Amount to Settle ($)*</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={debtToSettle.remainingAmount}
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-base"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Method*</label>
                <select
                  value={settleMethod}
                  onChange={(e) => setSettleMethod(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="Bank">Bank Wire / Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Partial wire payment ref #WIRE-99"
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDebtToSettle(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Record Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

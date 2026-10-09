import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Customer, Supplier } from '../../types/inventory';
import { Users, Truck, Plus, Search, Edit2, Phone, Mail, MapPin, DollarSign, X } from 'lucide-react';

export const PartiesView: React.FC = () => {
  const {
    customers,
    suppliers,
    debts,
    sales,
    purchases,
    settings,
    addCustomer,
    updateCustomer,
    addSupplier,
    updateSupplier,
    settleDebt,
    showToast,
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Settlement Modal State
  const [debtToSettle, setDebtToSettle] = useState<any>(null);
  const [settleAmount, setSettleAmount] = useState<string>('');
  const [settleMethod, setSettleMethod] = useState<'Cash' | 'Bank' | 'Mobile Money' | 'Other'>('Bank');

  // Customer Form
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    customerType: 'retail' as Customer['customerType'],
    creditLimit: 1000,
    status: 'active' as Customer['status'],
  });

  // Supplier Form
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: 'United States',
    taxNumber: '',
    status: 'active' as Supplier['status'],
  });

  // Compute Outstanding Customer Debt
  const getCustomerDebt = (customerId: number) => {
    return debts
      .filter((d) => d.debtType === 'customer' && d.partyId === customerId && d.status !== 'paid')
      .reduce((sum, d) => sum + d.remainingAmount, 0);
  };

  // Compute Outstanding Supplier Payable
  const getSupplierPayable = (supplierId: number) => {
    return debts
      .filter((d) => d.debtType === 'supplier' && d.partyId === supplierId && d.status !== 'paid')
      .reduce((sum, d) => sum + d.remainingAmount, 0);
  };

  // Open Edit Customer
  const handleOpenEditCustomer = (c: Customer) => {
    setEditingCustomer(c);
    setCustomerForm({
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      address: c.address || '',
      city: c.city || '',
      customerType: c.customerType,
      creditLimit: c.creditLimit,
      status: c.status,
    });
    setIsCustomerModalOpen(true);
  };

  const handleOpenCreateCustomer = () => {
    setEditingCustomer(null);
    setCustomerForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      customerType: 'retail',
      creditLimit: 1000,
      status: 'active',
    });
    setIsCustomerModalOpen(true);
  };

  const handleSubmitCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name.trim() || !customerForm.phone.trim()) {
      showToast('Name and phone are required', 'error');
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, customerForm);
    } else {
      addCustomer(customerForm);
    }
    setIsCustomerModalOpen(false);
  };

  // Open Edit Supplier
  const handleOpenEditSupplier = (s: Supplier) => {
    setEditingSupplier(s);
    setSupplierForm({
      name: s.name,
      company: s.company,
      phone: s.phone,
      email: s.email || '',
      address: s.address || '',
      city: s.city || '',
      country: s.country || 'United States',
      taxNumber: s.taxNumber || '',
      status: s.status,
    });
    setIsSupplierModalOpen(true);
  };

  const handleOpenCreateSupplier = () => {
    setEditingSupplier(null);
    setSupplierForm({
      name: '',
      company: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      country: 'United States',
      taxNumber: '',
      status: 'active',
    });
    setIsSupplierModalOpen(true);
  };

  const handleSubmitSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.company.trim() || !supplierForm.phone.trim()) {
      showToast('Company name and phone are required', 'error');
      return;
    }

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, supplierForm);
    } else {
      addSupplier(supplierForm);
    }
    setIsSupplierModalOpen(false);
  };

  const handleExecuteSettle = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(settleAmount) || 0;
    if (debtToSettle) {
      settleDebt(debtToSettle.id, amount, settleMethod);
      setDebtToSettle(null);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Parties Directory (Customers & Suppliers)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain relationship contacts, transaction history, credit ceilings, and outstanding debt balances
          </p>
        </div>

        {/* Tab Switcher & New Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'customers'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customers ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'suppliers'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Suppliers ({suppliers.length})
            </button>
          </div>

          {activeTab === 'customers' ? (
            <button
              onClick={handleOpenCreateCustomer}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>
          ) : (
            <button
              onClick={handleOpenCreateSupplier}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Supplier</span>
            </button>
          )}
        </div>
      </div>

      {/* CUSTOMERS TAB */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search customers by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Credit limits and outstanding debts calculated from active sales invoices
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4 text-center">Type</th>
                  <th className="py-3 px-4 text-right">Credit Limit</th>
                  <th className="py-3 px-4 text-right">Current Debt</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                          <Users className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-slate-900 text-sm mb-1">No customer records yet</div>
                        <p className="text-xs text-slate-500 max-w-sm mb-4">
                          Add retail or wholesale customer profiles with credit limits and contact info.
                        </p>
                        <button
                          onClick={handleOpenCreateCustomer}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add New Customer</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  customers
                    .filter((c) => {
                      if (!searchQuery.trim()) return true;
                      const q = searchQuery.toLowerCase();
                      return c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q));
                    })
                    .map((cust) => {
                      const currentDebt = getCustomerDebt(cust.id);
                      const matchingDebtRecord = debts.find(
                        (d) => d.debtType === 'customer' && d.partyId === cust.id && d.status !== 'paid'
                      );

                      return (
                        <tr key={cust.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-semibold text-slate-900">{cust.name}</td>
                          <td className="py-3 px-4 text-slate-600">
                            <div>{cust.phone}</div>
                            <div className="text-[11px] text-slate-400">{cust.email || '—'}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-500">{cust.city || cust.address || '—'}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {cust.customerType}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                            {settings.currencySymbol}{cust.creditLimit.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                            {currentDebt > 0 ? (
                              <span className="text-rose-600">{settings.currencySymbol}{currentDebt.toFixed(2)}</span>
                            ) : (
                              <span className="text-slate-400">$0.00</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {matchingDebtRecord && (
                                <button
                                  onClick={() => {
                                    setDebtToSettle(matchingDebtRecord);
                                    setSettleAmount(matchingDebtRecord.remainingAmount.toFixed(2));
                                  }}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded text-[11px] border border-emerald-200"
                                >
                                  Settle Debt
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenEditCustomer(cust)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                                title="Edit Customer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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

      {/* SUPPLIERS TAB */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search suppliers by company or contact person..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Suppliers supplying industrial machinery, fasteners, and gear
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Contact Representative</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Tax / EIN Number</th>
                  <th className="py-3 px-4 text-right">Outstanding Payable</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                          <Truck className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-slate-900 text-sm mb-1">No supplier records yet</div>
                        <p className="text-xs text-slate-500 max-w-sm mb-4">
                          Register suppliers and vendors to manage inventory procurements and accounts payable.
                        </p>
                        <button
                          onClick={handleOpenCreateSupplier}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add New Supplier</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  suppliers
                    .filter((s) => {
                      if (!searchQuery.trim()) return true;
                      const q = searchQuery.toLowerCase();
                      return s.company.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
                    })
                    .map((supp) => {
                      const payable = getSupplierPayable(supp.id);
                      const matchingDebtRecord = debts.find(
                        (d) => d.debtType === 'supplier' && d.partyId === supp.id && d.status !== 'paid'
                      );

                      return (
                        <tr key={supp.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-semibold text-slate-900">{supp.company}</td>
                          <td className="py-3 px-4 text-slate-700">{supp.name}</td>
                          <td className="py-3 px-4 text-slate-600">
                            <div>{supp.phone}</div>
                            <div className="text-[11px] text-slate-400">{supp.email}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{supp.taxNumber || '—'}</td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                            {payable > 0 ? (
                              <span className="text-amber-700">{settings.currencySymbol}{payable.toFixed(2)}</span>
                            ) : (
                              <span className="text-slate-400">$0.00</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {matchingDebtRecord && (
                                <button
                                  onClick={() => {
                                    setDebtToSettle(matchingDebtRecord);
                                    setSettleAmount(matchingDebtRecord.remainingAmount.toFixed(2));
                                  }}
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded text-[11px] border border-amber-200"
                                >
                                  Pay Vendor
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenEditSupplier(supp)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                                title="Edit Supplier"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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

      {/* CUSTOMER MODAL */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingCustomer ? 'Edit Customer Profile' : 'Add New Customer'}
              </h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCustomer} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Customer Name*</label>
                <input
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone*</label>
                  <input
                    type="text"
                    required
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Customer Type</label>
                  <select
                    value={customerForm.customerType}
                    onChange={(e) => setCustomerForm({ ...customerForm, customerType: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="retail">Retail (Walk-in)</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="corporate">Corporate Contractor</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Credit Limit ($)</label>
                  <input
                    type="number"
                    value={customerForm.creditLimit}
                    onChange={(e) => setCustomerForm({ ...customerForm, creditLimit: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Address & City</label>
                <input
                  type="text"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  placeholder="Street address and city"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPPLIER MODAL */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingSupplier ? 'Edit Supplier Profile' : 'Add New Supplier'}
              </h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSupplier} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Supplier Company Name*</label>
                <input
                  type="text"
                  required
                  value={supplierForm.company}
                  onChange={(e) => setSupplierForm({ ...supplierForm, company: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contact Person Name</label>
                <input
                  type="text"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone*</label>
                  <input
                    type="text"
                    required
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tax ID / EIN</label>
                  <input
                    type="text"
                    value={supplierForm.taxNumber}
                    onChange={(e) => setSupplierForm({ ...supplierForm, taxNumber: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">City & State</label>
                  <input
                    type="text"
                    value={supplierForm.city}
                    onChange={(e) => setSupplierForm({ ...supplierForm, city: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK SETTLE DEBT MODAL */}
      {debtToSettle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Settle Outstanding Debt</h3>
              <button onClick={() => setDebtToSettle(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteSettle} className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                  Reference #{debtToSettle.referenceNumber}
                </span>
                <div className="font-bold text-slate-800">{debtToSettle.partyName}</div>
                <div className="flex justify-between mt-1 text-slate-600 font-mono">
                  <span>Balance Due:</span>
                  <span className="font-bold text-rose-600">
                    ${debtToSettle.remainingAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Amount ($)*</label>
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
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

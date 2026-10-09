import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Settings, Building2, Save, RefreshCw, AlertTriangle } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, warehouses, updateSettings, resetDatabaseToSeed, showToast, hasPermission } =
    useInventory();

  const [formData, setFormData] = useState({ ...settings });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('settings.manage')) {
      showToast('Access denied: Administrator role required to alter business settings.', 'error');
      return;
    }
    updateSettings(formData);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Warning: This will restore the database to the initial seed state. All newly added records will be replaced. Proceed?'
      )
    ) {
      resetDatabaseToSeed();
      setFormData({ ...settings });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Organization Master Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Single business parameters: branding, tax calculation rates, currency symbol, and receipt notes
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 text-xs">
        <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-500" />
          <span>Business Identity & Contact Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">Legal Business Name*</label>
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tax ID / Registration Number</label>
            <input
              type="text"
              value={formData.taxNumber}
              onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Official Telephone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Official Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Timezone</label>
            <input
              type="text"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">Headquarters Physical Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <h3 className="font-bold text-slate-900 text-sm pt-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <span>Billing, Tax & Operational Rules</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Currency Code</label>
            <input
              type="text"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono uppercase"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Currency Symbol</label>
            <input
              type="text"
              value={formData.currencySymbol}
              onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-center font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Default Sales Tax Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Invoice Prefix</label>
            <input
              type="text"
              value={formData.invoicePrefix}
              onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Purchase PO Prefix</label>
            <input
              type="text"
              value={formData.purchasePrefix}
              onChange={(e) => setFormData({ ...formData, purchasePrefix: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Default POS Warehouse</label>
            <select
              value={formData.defaultWarehouseId}
              onChange={(e) => setFormData({ ...formData, defaultWarehouseId: Number(e.target.value) })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="font-semibold text-slate-700 block mb-1">
              Receipt & Invoice Footer Terms Note
            </label>
            <textarea
              rows={2}
              value={formData.receiptFooterNote}
              onChange={(e) => setFormData({ ...formData, receiptFooterNote: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1.5 p-2 rounded hover:bg-rose-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Database to Seed Baseline</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-sm flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Organization Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

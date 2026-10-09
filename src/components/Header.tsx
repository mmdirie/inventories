import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { UserCheck, LogOut, RefreshCw, ShoppingBag, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentModule: string;
  onOpenPos: () => void;
  onNavigate: (module: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentModule, onOpenPos, onNavigate }) => {
  const { settings, currentUser, users, switchUser, logout, resetDatabaseToSeed } = useInventory();

  const moduleTitles: Record<string, string> = {
    dashboard: 'Operations Dashboard',
    pos: 'Point of Sale (POS)',
    products: 'Product Inventory',
    categories: 'Categories & Brands',
    stock: 'Warehouse Stock & Ledger',
    purchases: 'Purchases & Receiving',
    sales: 'Sales & Invoices',
    returns: 'Returns Management',
    parties: 'Suppliers & Customers',
    finance: 'Expenses, Payments & Debts',
    barcodes: 'Barcode Printing Center',
    reports: 'Financial & Operational Reports',
    users: 'Users & Access Control (RBAC)',
    settings: 'Organization Settings',
    database: 'MySQL 8.0 Database Hub',
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-6 shrink-0 z-20">
      {/* Zone 1: Wordmark & Current Context */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
            SM
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm md:text-base leading-tight tracking-tight whitespace-nowrap">
              {settings.businessName}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-medium text-slate-700">{moduleTitles[currentModule] || 'System'}</span>
              <span>·</span>
              <span className="text-slate-500 hidden sm:inline">Single Organization</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zone 2: Fast Navigation & Role Switcher */}
      <div className="hidden lg:flex items-center gap-2">
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500 px-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            Role:
          </span>
          <select
            value={currentUser.id}
            onChange={(e) => switchUser(Number(e.target.value))}
            className="text-xs font-semibold bg-white text-slate-800 rounded px-2.5 py-1 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
            title="Switch User Role to test RBAC permissions"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName} — [{u.role}]
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Reset local database state to initial seed data?')) {
              resetDatabaseToSeed();
            }
          }}
          className="text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded hover:bg-slate-100 flex items-center gap-1 transition-colors"
          title="Reset sample data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Reset Seed</span>
        </button>
      </div>

      {/* Zone 3: Primary Action & User Profile */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenPos}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs md:text-sm font-semibold shadow-sm transition-colors whitespace-nowrap"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Launch POS</span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
            {currentUser.fullName.charAt(0)}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-900 leading-none">
              {currentUser.fullName}
            </span>
            <span className="text-[11px] text-slate-500 leading-tight">
              {currentUser.role}
            </span>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors ml-1"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

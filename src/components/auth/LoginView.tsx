import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, users, settings } = useInventory();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username);
  };

  const quickRoles = [
    { username: 'admin', role: 'Admin', desc: 'Unrestricted administration & financials' },
    { username: 'manager', role: 'Manager', desc: 'Inventory supervision & sales oversight' },
    { username: 'sales_clerk', role: 'Sales', desc: 'High-speed POS & counter sales' },
    { username: 'inventory_lead', role: 'Inventory', desc: 'Warehouse stock, count adjustments & transfers' },
    { username: 'accountant', role: 'Accountant', desc: 'Expenses, debts, cashflow & P&L statements' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Brand Banner */}
        <div className="bg-slate-900 text-white p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-white text-slate-900 flex items-center justify-center font-bold text-xl mx-auto shadow-sm mb-3">
            SM
          </div>
          <h1 className="text-lg font-bold tracking-tight">{settings.businessName}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Standalone Enterprise Inventory Management System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Sign In to System</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Role Tester Strip */}
          <div className="pt-4 border-t border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block mb-2 text-center">
              Quick Test: Sign in as any assigned role
            </span>
            <div className="space-y-1.5">
              {quickRoles.map((item) => (
                <button
                  key={item.username}
                  type="button"
                  onClick={() => {
                    setUsername(item.username);
                    setPassword('admin123');
                    login(item.username);
                  }}
                  className="w-full text-left p-2 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 text-[11px] block">{item.role}</span>
                    <span className="text-[10px] text-slate-500 block">{item.desc}</span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-600 font-semibold">
                    @{item.username} →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

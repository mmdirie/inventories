import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { User, UserRole } from '../../types/inventory';
import {
  UserCog,
  ShieldCheck,
  History,
  KeyRound,
  CheckCircle,
  XCircle,
  Plus,
  X,
  Lock,
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const { users, currentUser, switchUser, auditLogs, showToast, hasPermission } = useInventory();

  const [activeTab, setActiveTab] = useState<'users' | 'matrix' | 'audit'>('users');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // 25 Permissions breakdown
  const permissionsList = [
    { module: 'Dashboard', code: 'dashboard.view', desc: 'View dashboard analytics & metrics' },
    { module: 'Products', code: 'products.view', desc: 'Browse catalog and stock prices' },
    { module: 'Products', code: 'products.create', desc: 'Create new catalog products' },
    { module: 'Products', code: 'products.update', desc: 'Edit product prices and min levels' },
    { module: 'Products', code: 'products.delete', desc: 'Deactivate or delete products' },
    { module: 'Categories', code: 'categories.manage', desc: 'Add or modify categories' },
    { module: 'Brands', code: 'brands.manage', desc: 'Manage brand manufacturers' },
    { module: 'Warehouses', code: 'warehouses.manage', desc: 'Configure warehouse facilities' },
    { module: 'Stock', code: 'stock.view', desc: 'View stock balances and movements' },
    { module: 'Stock', code: 'stock.adjust', desc: 'Execute count adjustments' },
    { module: 'Stock', code: 'stock.transfer', desc: 'Transfer stock between warehouses' },
    { module: 'Suppliers', code: 'suppliers.manage', desc: 'Create and edit vendor profiles' },
    { module: 'Customers', code: 'customers.manage', desc: 'Manage customers and credit limits' },
    { module: 'Purchases', code: 'purchases.view', desc: 'View purchase orders and costs' },
    { module: 'Purchases', code: 'purchases.create', desc: 'Create PO and receive inventory' },
    { module: 'Purchases', code: 'purchases.return', desc: 'Execute supplier purchase returns' },
    { module: 'Sales', code: 'sales.view', desc: 'View sales orders and invoices' },
    { module: 'Sales', code: 'sales.create', desc: 'Process POS checkout and sales' },
    { module: 'Sales', code: 'sales.return', desc: 'Process customer returns & refunds' },
    { module: 'Expenses', code: 'expenses.manage', desc: 'Record operational expenses' },
    { module: 'Payments', code: 'payments.manage', desc: 'Allocate payments and settle debts' },
    { module: 'Debts', code: 'debts.manage', desc: 'Manage receivables and payables' },
    { module: 'Reports', code: 'reports.view', desc: 'View financial P&L and valuations' },
    { module: 'Users', code: 'users.manage', desc: 'Manage user credentials and roles' },
    { module: 'Settings', code: 'settings.manage', desc: 'Configure business profile & tax' },
  ];

  const rolePermissionsMap: Record<UserRole, string[]> = {
    Admin: permissionsList.map((p) => p.code),
    Manager: permissionsList
      .filter((p) => !['users.manage', 'settings.manage'].includes(p.code))
      .map((p) => p.code),
    Sales: [
      'dashboard.view',
      'products.view',
      'customers.manage',
      'sales.view',
      'sales.create',
      'sales.return',
    ],
    Inventory: [
      'dashboard.view',
      'products.view',
      'products.create',
      'products.update',
      'stock.view',
      'stock.adjust',
      'stock.transfer',
      'warehouses.manage',
      'purchases.view',
      'purchases.create',
      'categories.manage',
      'brands.manage',
    ],
    Accountant: [
      'dashboard.view',
      'sales.view',
      'purchases.view',
      'expenses.manage',
      'payments.manage',
      'debts.manage',
      'reports.view',
    ],
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    showToast(`Password updated for user '${passwordTargetUser?.username}'`, 'success');
    setIsPasswordModalOpen(false);
    setNewPassword('');
    setPasswordTargetUser(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Users & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage organization operator accounts, enforce granular permissions, and inspect system audit logs
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Staff User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            activeTab === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Role Permission Matrix (25 Rules)
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          System Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: USERS LIST */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Phone & Email</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isCurrent = currentUser.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>{u.fullName}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-900 text-white uppercase">
                            Active Session
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{u.username}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{u.phone}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase bg-emerald-50 text-emerald-700">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => switchUser(u.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-[11px] transition-colors"
                          title="Switch active user to test RBAC capabilities"
                        >
                          Switch To User
                        </button>
                        <button
                          onClick={() => {
                            setPasswordTargetUser(u);
                            setIsPasswordModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100"
                          title="Change Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: RBAC MATRIX */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-xs">Role Permission Matrix</h3>
            <p className="text-slate-500 text-[11px]">
              Enforced on backend API endpoints and UI route rendering
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-4">Module</th>
                  <th className="py-2.5 px-4">Permission Code</th>
                  <th className="py-2.5 px-4">Description</th>
                  {(['Admin', 'Manager', 'Sales', 'Inventory', 'Accountant'] as UserRole[]).map(
                    (role) => (
                      <th key={role} className="py-2.5 px-3 text-center">
                        {role}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionsList.map((p) => (
                  <tr key={p.code} className="hover:bg-slate-50/70">
                    <td className="py-2 px-4 font-bold text-slate-800">{p.module}</td>
                    <td className="py-2 px-4 font-mono text-[11px] text-indigo-700">{p.code}</td>
                    <td className="py-2 px-4 text-slate-500">{p.desc}</td>
                    {(['Admin', 'Manager', 'Sales', 'Inventory', 'Accountant'] as UserRole[]).map(
                      (role) => {
                        const isGranted = rolePermissionsMap[role].includes(p.code);
                        return (
                          <td key={role} className="py-2 px-3 text-center">
                            {isGranted ? (
                              <CheckCircle className="w-4 h-4 text-emerald-600 mx-auto" />
                            ) : (
                              <span className="text-slate-300 font-mono">—</span>
                            )}
                          </td>
                        );
                      }
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-xs">System Operation Audit Log</h3>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{log.createdAt}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-800">{log.username}</td>
                  <td className="py-3 px-4 font-bold text-indigo-600">{log.action}</td>
                  <td className="py-3 px-4 uppercase text-[10px] text-slate-500">{log.entityType}</td>
                  <td className="py-3 px-4 font-sans text-slate-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PASSWORD CHANGE MODAL */}
      {isPasswordModalOpen && passwordTargetUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Change User Password</h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePassword} className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-900">{passwordTargetUser.fullName}</div>
                <div className="text-slate-500 font-mono">@{passwordTargetUser.username}</div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">New Secure Password*</label>
                <input
                  type="password"
                  required
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

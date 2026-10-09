import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/common/Toast';
import { LoginView } from './components/auth/LoginView';

// Module Views
import { DashboardView } from './components/dashboard/DashboardView';
import { PosView } from './components/pos/PosView';
import { ProductsView } from './components/products/ProductsView';
import { CategoriesView } from './components/categories/CategoriesView';
import { StockManagementView } from './components/stock/StockManagementView';
import { PurchasesView } from './components/purchases/PurchasesView';
import { SalesView } from './components/sales/SalesView';
import { ReturnsView } from './components/returns/ReturnsView';
import { PartiesView } from './components/parties/PartiesView';
import { FinanceView } from './components/finance/FinanceView';
import { BarcodeCenterView } from './components/barcodes/BarcodeCenterView';
import { ReportsView } from './components/reports/ReportsView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';
import { DatabaseInspectorView } from './components/database/DatabaseInspectorView';

import { ShieldAlert, ArrowLeft } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { isLoggedIn, currentUser, hasPermission } = useInventory();
  const [currentModule, setCurrentModule] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  if (!isLoggedIn) {
    return <LoginView />;
  }

  // Permission mapping per module
  const modulePermissionMap: Record<string, string> = {
    settings: 'settings.manage',
    users: 'users.manage',
  };

  const requiredPermission = modulePermissionMap[currentModule];
  const isAllowed = !requiredPermission || hasPermission(requiredPermission);

  const renderModule = () => {
    if (!isAllowed) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Access Restricted</h2>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            Your current role (<strong>{currentUser.role}</strong>) does not have authorization to access the <strong>{currentModule}</strong> module.
          </p>
          <button
            onClick={() => setCurrentModule('dashboard')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      );
    }

    switch (currentModule) {
      case 'dashboard':
        return <DashboardView onNavigate={(mod) => setCurrentModule(mod)} />;
      case 'pos':
        return <PosView />;
      case 'products':
        return <ProductsView />;
      case 'categories':
        return <CategoriesView />;
      case 'stock':
        return <StockManagementView onNavigate={(mod) => setCurrentModule(mod as any)} />;
      case 'purchases':
        return <PurchasesView />;
      case 'sales':
        return <SalesView onNavigate={(mod) => setCurrentModule(mod as any)} />;
      case 'returns':
        return <ReturnsView />;
      case 'parties':
        return <PartiesView />;
      case 'finance':
        return <FinanceView />;
      case 'barcodes':
        return <BarcodeCenterView />;
      case 'reports':
        return <ReportsView />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <SettingsView />;
      case 'database':
        return <DatabaseInspectorView />;
      default:
        return <DashboardView onNavigate={(mod) => setCurrentModule(mod)} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-900">
      {/* Sidebar */}
      <Sidebar
        currentModule={currentModule}
        onNavigate={(mod) => setCurrentModule(mod)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentModule={currentModule}
          onOpenPos={() => setCurrentModule('pos')}
          onNavigate={(mod) => setCurrentModule(mod)}
        />

        <main className="flex-1 overflow-y-auto">
          {renderModule()}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <InventoryProvider>
      <MainLayout />
    </InventoryProvider>
  );
}

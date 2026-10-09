import React from 'react';
import { useInventory } from '../context/InventoryContext';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Layers,
  ArrowRightLeft,
  SlidersHorizontal,
  Barcode,
  ShoppingBag,
  Receipt,
  Users,
  Undo2,
  DollarSign,
  TrendingDown,
  Warehouse,
  Truck,
  Building2,
  Wallet,
  BarChart3,
  UserCog,
  Settings,
  Database,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

interface SidebarProps {
  currentModule: string;
  onNavigate: (module: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { products, warehouseStock, debts } = useInventory();

  // Compute low stock count
  const lowStockCount = products.filter((p) => {
    const totalQty = warehouseStock
      .filter((ws) => ws.productId === p.id)
      .reduce((sum, ws) => sum + ws.quantity, 0);
    return totalQty <= p.minStockLevel;
  }).length;

  const overdueDebtsCount = debts.filter((d) => d.status === 'unpaid' || d.status === 'partially_paid').length;

  const navGroups: NavGroup[] = [
    {
      group: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'pos', label: 'Point of Sale (POS)', icon: ShoppingBag, badge: 'Fast' },
      ],
    },
    {
      group: 'Inventory',
      items: [
        { id: 'products', label: 'Products', icon: Package, badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined, badgeColor: 'bg-amber-100 text-amber-800' },
        { id: 'categories', label: 'Categories & Brands', icon: Layers },
        { id: 'stock', label: 'Stock & Ledger', icon: Boxes },
        { id: 'barcodes', label: 'Barcode Center', icon: Barcode },
      ],
    },
    {
      group: 'Operations',
      items: [
        { id: 'sales', label: 'Sales & Invoices', icon: Receipt },
        { id: 'purchases', label: 'Purchases & POs', icon: Truck },
        { id: 'returns', label: 'Returns', icon: Undo2 },
        { id: 'parties', label: 'Customers & Suppliers', icon: Users },
      ],
    },
    {
      group: 'Financials',
      items: [
        { id: 'finance', label: 'Expenses & Debts', icon: Wallet, badge: overdueDebtsCount > 0 ? `${overdueDebtsCount} Due` : undefined, badgeColor: 'bg-rose-100 text-rose-800' },
        { id: 'reports', label: 'Reports & P&L', icon: BarChart3 },
      ],
    },
    {
      group: 'Administration',
      items: [
        { id: 'users', label: 'Users & Roles', icon: UserCog },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'database', label: 'MySQL Schema & Seed', icon: Database },
      ],
    },
  ];

  return (
    <aside
      className={`bg-slate-900 text-slate-300 flex flex-col shrink-0 transition-all duration-200 border-r border-slate-800 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-base tracking-tight">StockMaster</span>
            <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
              v1.0
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors mx-auto"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronRight className={`w-4 h-4 transform transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((grp) => (
          <div key={grp.group} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {grp.group}
              </div>
            )}
            {grp.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentModule === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between w-full min-w-0">
                      <span className="truncate text-left">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                            item.badgeColor || 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span>MySQL 8.0 Engine</span>
            <span className="font-mono text-emerald-400">Synced</span>
          </div>
        </div>
      )}
    </aside>
  );
};

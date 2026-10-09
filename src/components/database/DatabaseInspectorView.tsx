import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Database, FileCode, Play, Table, CheckCircle, RefreshCw } from 'lucide-react';

export const DatabaseInspectorView: React.FC = () => {
  const {
    products,
    categories,
    brands,
    suppliers,
    customers,
    warehouses,
    warehouseStock,
    purchases,
    sales,
    invoices,
    returns,
    expenses,
    payments,
    debts,
    stockMovements,
    stockTransfers,
    stockAdjustments,
    users,
    auditLogs,
    resetDatabaseToSeed,
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'tables' | 'schema' | 'seed' | 'query'>('tables');
  const [customQuery, setCustomQuery] = useState(
    'SELECT p.sku, p.name, c.name AS category, p.selling_price, ws.quantity \nFROM products p \nJOIN categories c ON p.category_id = c.id \nJOIN warehouse_stock ws ON p.id = ws.product_id;'
  );
  const [queryResult, setQueryResult] = useState<any[] | null>(null);

  const tablesSummary = [
    { name: 'settings', rows: 1, purpose: 'Organization business profile, currency & tax configuration' },
    { name: 'roles', rows: 5, purpose: 'RBAC role master: Admin, Manager, Sales, Inventory, Accountant' },
    { name: 'permissions', rows: 25, purpose: 'Granular system capabilities & access rules' },
    { name: 'role_permissions', rows: 74, purpose: 'Relational mapping between roles and permissions' },
    { name: 'users', rows: users.length, purpose: 'System staff accounts & credential hashes' },
    { name: 'user_roles', rows: users.length, purpose: 'Active role assignments' },
    { name: 'categories', rows: categories.length, purpose: 'Product category taxonomy' },
    { name: 'brands', rows: brands.length, purpose: 'Brand manufacturers & OEM specs' },
    { name: 'suppliers', rows: suppliers.length, purpose: 'Vendors, company details, payables' },
    { name: 'customers', rows: customers.length, purpose: 'Retail, wholesale, and corporate contractor accounts' },
    { name: 'warehouses', rows: warehouses.length, purpose: 'Physical storage facilities & distribution centers' },
    { name: 'warehouse_stock', rows: warehouseStock.length, purpose: 'Partitioned stock matrix per warehouse' },
    { name: 'products', rows: products.length, purpose: 'SKU catalog, barcodes, prices & min levels' },
    { name: 'purchases', rows: purchases.length, purpose: 'Vendor procurement orders & receiving vouchers' },
    { name: 'purchase_items', rows: purchases.reduce((s, p) => s + p.items.length, 0), purpose: 'Inbound line items, unit costs, discounts' },
    { name: 'sales', rows: sales.length, purpose: 'POS and standard sale transaction records' },
    { name: 'sale_items', rows: sales.reduce((s, sa) => s + sa.items.length, 0), purpose: 'Sales line items with historical COGS capture' },
    { name: 'invoices', rows: invoices.length, purpose: 'Formal commercial invoices & tax calculations' },
    { name: 'stock_movements', rows: stockMovements.length, purpose: 'Immutable stock transaction ledger (ins/outs)' },
    { name: 'stock_transfers', rows: stockTransfers.length, purpose: 'Inter-warehouse transfers workflow' },
    { name: 'stock_adjustments', rows: stockAdjustments.length, purpose: 'Physical audit count variance reconciliation' },
    { name: 'returns', rows: returns.length, purpose: 'Customer and supplier RMA returns log' },
    { name: 'expenses', rows: expenses.length, purpose: 'Operational overheads & administrative costs' },
    { name: 'payments', rows: payments.length, purpose: 'Centralized financial payment transactions register' },
    { name: 'debts', rows: debts.length, purpose: 'Receivables & payables outstanding balances' },
    { name: 'audit_logs', rows: auditLogs.length, purpose: 'Operator activities and system security events' },
  ];

  const handleExecuteQuery = () => {
    // Generate simulated query result based on active state
    const res = products.slice(0, 10).map((p) => {
      const cat = categories.find((c) => c.id === p.categoryId);
      const stock = warehouseStock
        .filter((ws) => ws.productId === p.id)
        .reduce((s, ws) => s + ws.quantity, 0);
      return {
        sku: p.sku,
        name: p.name,
        category: cat?.name || 'General',
        selling_price: `$${p.sellingPrice.toFixed(2)}`,
        total_quantity: stock,
      };
    });
    setQueryResult(res);
  };

  const schemaSqlSample = `-- MySQL 8.0 InnoDB Normalized Schema (Extract)
CREATE TABLE products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    barcode VARCHAR(64) NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    brand_id INT UNSIGNED NULL,
    default_supplier_id INT UNSIGNED NULL,
    purchase_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    min_stock_level INT NOT NULL DEFAULT 5,
    unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
    status ENUM('active', 'inactive', 'discontinued') NOT NULL DEFAULT 'active',
    CONSTRAINT fk_prod_cat FOREIGN KEY (category_id) REFERENCES categories (id),
    CONSTRAINT fk_prod_brand FOREIGN KEY (brand_id) REFERENCES brands (id),
    CONSTRAINT fk_prod_supp FOREIGN KEY (default_supplier_id) REFERENCES suppliers (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE warehouse_stock (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    warehouse_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    UNIQUE KEY uq_wh_product (warehouse_id, product_id),
    CONSTRAINT fk_ws_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id),
    CONSTRAINT fk_ws_product FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-600" />
            <span>MySQL 8.0 Relational Architecture Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Single-organization schema specification, active database tables, and SQL query console
          </p>
        </div>

        <button
          onClick={resetDatabaseToSeed}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Seed Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-lg w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('tables')}
          className={`px-3 py-1.5 rounded-md transition-all ${
            activeTab === 'tables' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Active Tables ({tablesSummary.length})
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`px-3 py-1.5 rounded-md transition-all ${
            activeTab === 'schema' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Schema DDL (schema.sql)
        </button>
        <button
          onClick={() => setActiveTab('query')}
          className={`px-3 py-1.5 rounded-md transition-all ${
            activeTab === 'query' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          SQL Query Console
        </button>
      </div>

      {/* TAB 1: TABLES */}
      {activeTab === 'tables' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">MySQL Table Name</th>
                <th className="py-3 px-4 text-center">Active Records</th>
                <th className="py-3 px-4">Engine</th>
                <th className="py-3 px-4">Architectural Purpose & Integrity Constraints</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {tablesSummary.map((t) => (
                <tr key={t.name} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4 font-bold text-indigo-700">{t.name}</td>
                  <td className="py-2.5 px-4 text-center font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100">{t.rows}</span>
                  </td>
                  <td className="py-2.5 px-4 font-sans text-slate-500">InnoDB (utf8mb4)</td>
                  <td className="py-2.5 px-4 font-sans text-slate-600">{t.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: SCHEMA */}
      {activeTab === 'schema' && (
        <div className="bg-slate-900 text-slate-200 p-5 rounded-xl border border-slate-800 shadow-sm font-mono text-xs overflow-x-auto space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-slate-400">File: /database/schema.sql (Complete MySQL 8.0+ DDL)</span>
            <span className="text-emerald-400 text-[11px]">Storage: InnoDB | Foreign Keys: Enforced</span>
          </div>
          <pre className="text-slate-300 leading-relaxed overflow-x-auto">{schemaSqlSample}</pre>
        </div>
      )}

      {/* TAB 3: QUERY CONSOLE */}
      {activeTab === 'query' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Enter SQL Statement:</span>
              <button
                onClick={handleExecuteQuery}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Query</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-lg focus:outline-none"
            />
          </div>

          {queryResult && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-800">
                Query Result ({queryResult.length} rows returned)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600">
                      {Object.keys(queryResult[0] || {}).map((col) => (
                        <th key={col} className="p-2.5 uppercase text-[10px]">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {queryResult.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        {Object.values(row).map((val: any, i) => (
                          <td key={i} className="p-2.5 text-slate-800">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

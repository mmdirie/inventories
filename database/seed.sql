-- =====================================================================
-- INVENTORY MANAGEMENT SYSTEM - CLEAN INITIAL SYSTEM SEED
-- Single Organization: Apex Meridian Trading & Distribution Co.
-- Ready for real production MySQL data entry.
-- =====================================================================

USE inventory_management;

-- 1. SETTINGS
INSERT INTO settings (id, business_name, business_logo, tax_number, phone, email, address, currency, currency_symbol, tax_rate, invoice_prefix, purchase_prefix, receipt_footer_note, default_warehouse_id, low_stock_threshold, timezone)
VALUES (1, 'Apex Meridian Trading & Distribution Co.', NULL, 'US-TAX-88219401-B', '+1 (555) 382-9011', 'operations@apexmeridian.com', '742 Industrial Parkway, Suite 400, Chicago, IL 60607', 'USD', '$', 8.50, 'INV-', 'PO-', 'Thank you for your business! Goods sold in good condition are subject to 14 days warranty return policy.', 1, 10, 'America/Chicago')
ON DUPLICATE KEY UPDATE business_name=VALUES(business_name);

-- 2. ROLES
INSERT INTO roles (id, name, display_name, description) VALUES
(1, 'Admin', 'System Administrator', 'Full unrestricted operational, financial, and administrative control over the entire system'),
(2, 'Manager', 'Operations Manager', 'Supervises inventory, approves purchases, oversees sales and stock transfers'),
(3, 'Sales', 'Sales Associate / Cashier', 'Point of Sale operation, sales invoices, customer management, and receipt issuance'),
(4, 'Inventory', 'Inventory / Warehouse Clerk', 'Manages warehouse stock counts, transfers, adjustments, and purchase receipt'),
(5, 'Accountant', 'Financial Accountant', 'Monitors revenue, expenses, accounts payable/receivable, payments, and financial reports')
ON DUPLICATE KEY UPDATE display_name=VALUES(display_name);

-- 3. PERMISSIONS
INSERT INTO permissions (id, code, module, description) VALUES
(1, 'dashboard.view', 'dashboard', 'View overall dashboard statistics, trends, and KPIs'),
(2, 'products.view', 'products', 'View product catalog and price list'),
(3, 'products.create', 'products', 'Add new products to the catalog'),
(4, 'products.update', 'products', 'Edit product details, pricing, and minimum stock levels'),
(5, 'products.delete', 'products', 'Deactivate or delete products'),
(6, 'categories.manage', 'categories', 'Manage product categories'),
(7, 'brands.manage', 'brands', 'Manage product brands'),
(8, 'warehouses.manage', 'warehouses', 'Manage physical warehouses and locations'),
(9, 'stock.view', 'stock', 'View current stock levels and ledger movements'),
(10, 'stock.adjust', 'stock', 'Execute inventory count adjustments'),
(11, 'stock.transfer', 'stock', 'Transfer stock between warehouses'),
(12, 'suppliers.manage', 'suppliers', 'Manage suppliers and vendor profiles'),
(13, 'customers.manage', 'customers', 'Manage customers and customer credit profiles'),
(14, 'purchases.view', 'purchases', 'View purchase orders and vendor invoices'),
(15, 'purchases.create', 'purchases', 'Create new purchase orders and receive stock'),
(16, 'sales.view', 'sales', 'View sales history and customer invoices'),
(17, 'sales.create', 'sales', 'Process Point of Sale orders and standard sales'),
(18, 'sales.return', 'sales', 'Process sales returns and customer credits'),
(19, 'purchases.return', 'purchases', 'Process purchase returns to suppliers'),
(20, 'expenses.manage', 'expenses', 'Record and categorize operational expenses'),
(21, 'payments.manage', 'payments', 'Record, allocate, and review customer/supplier payments'),
(22, 'debts.manage', 'debts', 'Track customer receivables and supplier payables'),
(23, 'reports.view', 'reports', 'Generate and export sales, inventory, and financial P&L reports'),
(24, 'users.manage', 'users', 'Manage user accounts, roles, and security policies'),
(25, 'settings.manage', 'settings', 'Modify business profile, tax rates, and invoice preferences')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 4. ROLE PERMISSIONS
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE code IN (
  'dashboard.view', 'products.view', 'products.create', 'products.update',
  'categories.manage', 'brands.manage', 'warehouses.manage', 'stock.view',
  'stock.adjust', 'stock.transfer', 'suppliers.manage', 'customers.manage',
  'purchases.view', 'purchases.create', 'sales.view', 'sales.create',
  'sales.return', 'purchases.return', 'reports.view', 'debts.manage'
);

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE code IN (
  'dashboard.view', 'products.view', 'customers.manage', 'sales.view', 'sales.create', 'sales.return'
);

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE code IN (
  'dashboard.view', 'products.view', 'stock.view', 'stock.adjust', 'stock.transfer',
  'warehouses.manage', 'purchases.view', 'purchases.create'
);

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 5, id FROM permissions WHERE code IN (
  'dashboard.view', 'sales.view', 'purchases.view', 'expenses.manage',
  'payments.manage', 'debts.manage', 'reports.view'
);

-- 5. USERS (Default staff accounts)
INSERT INTO users (id, username, email, password_hash, full_name, phone, status) VALUES
(1, 'admin', 'admin@apexmeridian.com', '$2b$10$wWv3lPqBvYjQnQ8Z5ZgMpeO.mQ1T8zN3Wf7e7jJ5UqX.v.fH.T1k2', 'Marcus Vance (Admin)', '+1 (555) 382-9011', 'active'),
(2, 'manager', 'sarah.connor@apexmeridian.com', '$2b$10$wWv3lPqBvYjQnQ8Z5ZgMpeO.mQ1T8zN3Wf7e7jJ5UqX.v.fH.T1k2', 'Sarah Connor (Operations Manager)', '+1 (555) 382-9012', 'active'),
(3, 'sales_clerk', 'elena.rodriguez@apexmeridian.com', '$2b$10$wWv3lPqBvYjQnQ8Z5ZgMpeO.mQ1T8zN3Wf7e7jJ5UqX.v.fH.T1k2', 'Elena Rodriguez (Lead Cashier)', '+1 (555) 382-9013', 'active'),
(4, 'inventory_lead', 'david.kim@apexmeridian.com', '$2b$10$wWv3lPqBvYjQnQ8Z5ZgMpeO.mQ1T8zN3Wf7e7jJ5UqX.v.fH.T1k2', 'David Kim (Warehouse Lead)', '+1 (555) 382-9014', 'active'),
(5, 'accountant', 'clara.oswald@apexmeridian.com', '$2b$10$wWv3lPqBvYjQnQ8Z5ZgMpeO.mQ1T8zN3Wf7e7jJ5UqX.v.fH.T1k2', 'Clara Oswald (Chief Accountant)', '+1 (555) 382-9015', 'active')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

INSERT IGNORE INTO user_roles (user_id, role_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5);

-- 6. WAREHOUSES (Physical facilities configured, 0 initial stock)
INSERT INTO warehouses (id, name, code, location, manager_name, phone, capacity, is_default, status) VALUES
(1, 'Central Distribution Center', 'WH-MAIN', '742 Industrial Parkway, Bay 1-8, Chicago, IL', 'David Kim', '+1 (555) 382-9014', 50000, TRUE, 'active'),
(2, 'Downtown Retail Outlet', 'WH-RETAIL', '118 Michigan Ave, Chicago, IL', 'Elena Rodriguez', '+1 (555) 382-9013', 8000, FALSE, 'active'),
(3, 'North Logistics Depot', 'WH-NORTH', '3900 Interstate Rd, Evanston, IL', 'Michael Chen', '+1 (555) 382-9019', 25000, FALSE, 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 7. CATEGORIES (Standard business classification categories)
INSERT INTO categories (id, name, description, status) VALUES
(1, 'Industrial Tools', 'Heavy duty power tools, hand tools, and workshop machinery', 'active'),
(2, 'Safety & Protective Gear', 'PPE, helmets, tactical gloves, eye protection, and harnesses', 'active'),
(3, 'Electrical & Lighting', 'High-output commercial LED lights, cabling, connectors, breakers', 'active'),
(4, 'Fasteners & Hardware', 'Bolts, structural screws, brackets, anchor fittings, and anchors', 'active'),
(5, 'Pneumatics & Hydraulics', 'Air hoses, regulators, hydraulic seals, fittings, valves', 'active'),
(6, 'Packaging & Storage', 'Heavy-duty crates, stretch wraps, strapping bands, storage bins', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 8. EXPENSE CATEGORIES
INSERT INTO expense_categories (id, name, description) VALUES
(1, 'Facility Rent & Leases', 'Monthly warehouse and retail facility lease expenses'),
(2, 'Utilities & Energy', 'Electricity, water, gas, and broadband telecom'),
(3, 'Logistics & Freight', 'Inter-warehouse freight, fuel, and courier deliveries'),
(4, 'Equipment Maintenance', 'Forklift servicing, compressor maintenance, calibration'),
(5, 'Office & Administrative', 'Stationery, printing, packing labels, software licenses')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 9. INITIAL AUDIT LOG
INSERT INTO audit_logs (id, user_id, action, entity_type, details) VALUES
(1, 1, 'SYSTEM_INITIALIZATION', 'system', 'Clean database initialization ready for live operation.')
ON DUPLICATE KEY UPDATE id=VALUES(id);

-- Operational tables (products, suppliers, customers, purchases, sales, invoices, debts, payments, stock_movements)
-- are left completely clean for authentic production data entry.

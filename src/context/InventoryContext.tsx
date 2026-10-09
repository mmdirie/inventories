import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  BusinessSettings,
  Category,
  Brand,
  Supplier,
  Customer,
  Warehouse,
  Product,
  WarehouseStock,
  StockMovement,
  StockTransfer,
  StockAdjustment,
  Purchase,
  Sale,
  Invoice,
  ReturnRecord,
  Expense,
  ExpenseCategory,
  Payment,
  Debt,
  AuditLog,
} from '../types/inventory';

// Default initial state matching database/seed.sql
const INITIAL_SETTINGS: BusinessSettings = {
  businessName: 'Apex Meridian Trading & Distribution Co.',
  taxNumber: 'US-TAX-88219401-B',
  phone: '+1 (555) 382-9011',
  email: 'operations@apexmeridian.com',
  address: '742 Industrial Parkway, Suite 400, Chicago, IL 60607',
  currency: 'USD',
  currencySymbol: '$',
  taxRate: 8.5,
  invoicePrefix: 'INV-',
  purchasePrefix: 'PO-',
  receiptFooterNote: 'Thank you for your business! Goods sold in good condition are subject to a 14-day warranty return policy.',
  defaultWarehouseId: 1,
  lowStockThreshold: 10,
  timezone: 'America/Chicago',
};

const INITIAL_USERS: User[] = [
  { id: 1, username: 'admin', email: 'admin@apexmeridian.com', fullName: 'Marcus Vance', phone: '+1 (555) 382-9011', role: 'Admin', status: 'active', lastLoginAt: '2026-10-08 09:30' },
  { id: 2, username: 'manager', email: 'sarah.connor@apexmeridian.com', fullName: 'Sarah Connor', phone: '+1 (555) 382-9012', role: 'Manager', status: 'active', lastLoginAt: '2026-10-08 08:45' },
  { id: 3, username: 'sales_clerk', email: 'elena.rodriguez@apexmeridian.com', fullName: 'Elena Rodriguez', phone: '+1 (555) 382-9013', role: 'Sales', status: 'active', lastLoginAt: '2026-10-08 10:15' },
  { id: 4, username: 'inventory_lead', email: 'david.kim@apexmeridian.com', fullName: 'David Kim', phone: '+1 (555) 382-9014', role: 'Inventory', status: 'active', lastLoginAt: '2026-10-08 07:50' },
  { id: 5, username: 'accountant', email: 'clara.oswald@apexmeridian.com', fullName: 'Clara Oswald', phone: '+1 (555) 382-9015', role: 'Accountant', status: 'active', lastLoginAt: '2026-10-08 09:00' },
];

const INITIAL_WAREHOUSES: Warehouse[] = [
  { id: 1, name: 'Central Distribution Center', code: 'WH-MAIN', location: '742 Industrial Parkway, Bay 1-8, Chicago, IL', managerName: 'David Kim', phone: '+1 (555) 382-9014', capacity: 50000, isDefault: true, status: 'active' },
  { id: 2, name: 'Downtown Retail Outlet', code: 'WH-RETAIL', location: '118 Michigan Ave, Chicago, IL', managerName: 'Elena Rodriguez', phone: '+1 (555) 382-9013', capacity: 8000, isDefault: false, status: 'active' },
  { id: 3, name: 'North Logistics Depot', code: 'WH-NORTH', location: '3900 Interstate Rd, Evanston, IL', managerName: 'Michael Chen', phone: '+1 (555) 382-9019', capacity: 25000, isDefault: false, status: 'active' },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Industrial Tools', description: 'Heavy duty power tools, hand tools, and workshop machinery', status: 'active' },
  { id: 2, 'name': 'Safety & Protective Gear', description: 'PPE, helmets, tactical gloves, eye protection, and harnesses', status: 'active' },
  { id: 3, name: 'Electrical & Lighting', description: 'High-output commercial LED lights, cabling, connectors, breakers', status: 'active' },
  { id: 4, name: 'Fasteners & Hardware', description: 'Bolts, structural screws, brackets, anchor fittings, and anchors', status: 'active' },
  { id: 5, name: 'Pneumatics & Hydraulics', description: 'Air hoses, regulators, hydraulic seals, fittings, valves', status: 'active' },
  { id: 6, name: 'Packaging & Storage', description: 'Heavy-duty crates, stretch wraps, strapping bands, storage bins', status: 'active' },
];

const INITIAL_BRANDS: Brand[] = [
  { id: 1, name: 'TitanForge', description: 'Industrial strength heavy machinery and power tools', status: 'active' },
  { id: 2, name: 'AegisGuard', description: 'Certified industrial safety gear and ballistic PPE', status: 'active' },
  { id: 3, name: 'VoltMaster', description: 'Precision electrical equipment and surge control systems', status: 'active' },
  { id: 4, name: 'DuraBolt', description: 'Grade 8.8 and stainless steel industrial fastening solutions', status: 'active' },
  { id: 5, name: 'HydroFlow', description: 'Pneumatic valves, high pressure hydraulic hoses and regulators', status: 'active' },
];

const INITIAL_SUPPLIERS: Supplier[] = [];
const INITIAL_CUSTOMERS: Customer[] = [];
const INITIAL_PRODUCTS: Product[] = [];
const INITIAL_WAREHOUSE_STOCK: WarehouseStock[] = [];
const INITIAL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 1, name: 'Facility Rent & Leases', description: 'Monthly warehouse and retail facility lease expenses' },
  { id: 2, name: 'Utilities & Energy', description: 'Electricity, water, gas, and broadband telecom' },
  { id: 3, name: 'Logistics & Freight', description: 'Inter-warehouse freight, fuel, and courier deliveries' },
  { id: 4, name: 'Equipment Maintenance', description: 'Forklift servicing, compressor maintenance, calibration' },
  { id: 5, name: 'Office & Administrative', description: 'Stationery, printing, packing labels, software licenses' },
];
const INITIAL_EXPENSES: Expense[] = [];
const INITIAL_PURCHASES: Purchase[] = [];
const INITIAL_SALES: Sale[] = [];
const INITIAL_INVOICES: Invoice[] = [];
const INITIAL_DEBTS: Debt[] = [];
const INITIAL_PAYMENTS: Payment[] = [];
const INITIAL_MOVEMENTS: StockMovement[] = [];
const INITIAL_TRANSFERS: StockTransfer[] = [];
const INITIAL_ADJUSTMENTS: StockAdjustment[] = [];
const INITIAL_RETURNS: ReturnRecord[] = [];
const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 1, userId: 1, username: 'admin', action: 'DATABASE_INITIALIZATION', entityType: 'system', details: 'Initialized clean database ready for live operation', createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19) },
];

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface InventoryContextType {
  // Master State
  settings: BusinessSettings;
  users: User[];
  currentUser: User;
  warehouses: Warehouse[];
  categories: Category[];
  brands: Brand[];
  suppliers: Supplier[];
  customers: Customer[];
  products: Product[];
  warehouseStock: WarehouseStock[];
  stockMovements: StockMovement[];
  stockTransfers: StockTransfer[];
  stockAdjustments: StockAdjustment[];
  purchases: Purchase[];
  sales: Sale[];
  invoices: Invoice[];
  returns: ReturnRecord[];
  expenses: Expense[];
  expenseCategories: ExpenseCategory[];
  payments: Payment[];
  debts: Debt[];
  auditLogs: AuditLog[];
  toasts: ToastItem[];

  // Auth & RBAC
  hasPermission: (permissionCode: string) => boolean;
  switchUser: (userId: number) => void;
  login: (username: string) => boolean;
  logout: () => void;
  isLoggedIn: boolean;

  // Actions
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  
  // Products
  addProduct: (product: Omit<Product, 'id'>, initialStock?: { warehouseId: number; qty: number }[]) => { success: boolean; error?: string };
  updateProduct: (id: number, data: Partial<Product>) => { success: boolean; error?: string };
  deleteProduct: (id: number) => { success: boolean; error?: string };

  // Categories & Brands
  addCategory: (name: string, description: string) => boolean;
  updateCategory: (id: number, name: string, description: string, status: 'active' | 'inactive') => boolean;
  deleteCategory: (id: number) => { success: boolean; error?: string };

  addBrand: (name: string, description: string) => boolean;
  updateBrand: (id: number, name: string, description: string, status: 'active' | 'inactive') => boolean;
  deleteBrand: (id: number) => { success: boolean; error?: string };

  // Suppliers & Customers
  addSupplier: (supplier: Omit<Supplier, 'id'>) => boolean;
  updateSupplier: (id: number, supplier: Partial<Supplier>) => boolean;
  addCustomer: (customer: Omit<Customer, 'id'>) => boolean;
  updateCustomer: (id: number, customer: Partial<Customer>) => boolean;

  // Warehouses
  addWarehouse: (warehouse: Omit<Warehouse, 'id'>) => boolean;
  updateWarehouse: (id: number, warehouse: Partial<Warehouse>) => boolean;

  // Purchases
  createPurchase: (data: {
    supplierId: number;
    warehouseId: number;
    purchaseDate: string;
    items: { productId: number; quantity: number; unitCost: number; discount: number; tax: number }[];
    paidAmount: number;
    paymentMethod: 'Cash' | 'Bank' | 'Mobile Money' | 'Other';
    notes?: string;
  }) => { success: boolean; purchase?: Purchase; error?: string };

  // Sales / POS
  createSale: (data: {
    customerId: number;
    warehouseId: number;
    saleDate: string;
    items: { productId: number; quantity: number; unitPrice: number; discount: number; tax: number }[];
    paidAmount: number;
    paymentMethod: 'Cash' | 'Bank' | 'Mobile Money' | 'Other';
    saleType: 'pos' | 'standard' | 'credit';
    notes?: string;
  }) => { success: boolean; sale?: Sale; invoice?: Invoice; error?: string };

  // Stock operations
  createTransfer: (data: {
    sourceWarehouseId: number;
    destinationWarehouseId: number;
    transferDate: string;
    items: { productId: number; quantity: number }[];
    notes?: string;
  }) => { success: boolean; error?: string };

  createAdjustment: (data: {
    productId: number;
    warehouseId: number;
    adjustmentType: 'Increase' | 'Decrease';
    quantity: number;
    reason: StockAdjustment['reason'];
    notes: string;
  }) => { success: boolean; error?: string };

  // Returns
  createSalesReturn: (data: {
    saleId: number;
    items: { productId: number; quantity: number; unitPrice: number; restockToInventory: boolean }[];
    reason: string;
  }) => { success: boolean; error?: string };

  createPurchaseReturn: (data: {
    purchaseId: number;
    items: { productId: number; quantity: number; unitPrice: number }[];
    reason: string;
  }) => { success: boolean; error?: string };

  // Expenses & Payments
  addExpense: (expense: Omit<Expense, 'id' | 'referenceNo' | 'createdBy'>) => boolean;
  recordDirectPayment: (payment: Omit<Payment, 'id' | 'paymentNumber' | 'createdBy'>) => boolean;
  settleDebt: (debtId: number, amount: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile Money' | 'Other', notes?: string) => boolean;

  // Settings & DB Maintenance
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  resetDatabaseToSeed: () => void;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

const STORAGE_KEY = 'stockmaster_ims_v2_clean';

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or default
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [settings, setSettings] = useState<BusinessSettings>(INITIAL_SETTINGS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [brands, setBrands] = useState<Brand[]>(INITIAL_BRANDS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [warehouseStock, setWarehouseStock] = useState<WarehouseStock[]>(INITIAL_WAREHOUSE_STOCK);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(INITIAL_MOVEMENTS);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(INITIAL_TRANSFERS);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(INITIAL_ADJUSTMENTS);
  const [purchases, setPurchases] = useState<Purchase[]>(INITIAL_PURCHASES);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [returns, setReturns] = useState<ReturnRecord[]>(INITIAL_RETURNS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [expenseCategories] = useState<ExpenseCategory[]>(INITIAL_EXPENSE_CATEGORIES);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [debts, setDebts] = useState<Debt[]>(INITIAL_DEBTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Load from local storage
  useEffect(() => {
    try {
      // Clear legacy storage key containing mock/dummy data
      localStorage.removeItem('stockmaster_ims_v1');

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.warehouses) {
          setSettings(parsed.settings || INITIAL_SETTINGS);
          setUsers(parsed.users || INITIAL_USERS);
          setCurrentUser(parsed.currentUser || INITIAL_USERS[0]);
          setWarehouses(parsed.warehouses || INITIAL_WAREHOUSES);
          setCategories(parsed.categories || INITIAL_CATEGORIES);
          setBrands(parsed.brands || INITIAL_BRANDS);
          setSuppliers(parsed.suppliers || []);
          setCustomers(parsed.customers || []);
          setProducts(parsed.products || []);
          setWarehouseStock(parsed.warehouseStock || []);
          setStockMovements(parsed.stockMovements || []);
          setStockTransfers(parsed.stockTransfers || []);
          setStockAdjustments(parsed.stockAdjustments || []);
          setPurchases(parsed.purchases || []);
          setSales(parsed.sales || []);
          setInvoices(parsed.invoices || []);
          setReturns(parsed.returns || []);
          setExpenses(parsed.expenses || []);
          setPayments(parsed.payments || []);
          setDebts(parsed.debts || []);
          setAuditLogs(parsed.auditLogs || INITIAL_AUDIT_LOGS);
        }
      }
    } catch (e) {
      console.error('Failed to load local storage state:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const dataToSave = {
        settings,
        users,
        currentUser,
        warehouses,
        categories,
        brands,
        suppliers,
        customers,
        products,
        warehouseStock,
        stockMovements,
        stockTransfers,
        stockAdjustments,
        purchases,
        sales,
        invoices,
        returns,
        expenses,
        payments,
        debts,
        auditLogs,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [
    isLoaded,
    settings,
    users,
    currentUser,
    warehouses,
    categories,
    brands,
    suppliers,
    customers,
    products,
    warehouseStock,
    stockMovements,
    stockTransfers,
    stockAdjustments,
    purchases,
    sales,
    invoices,
    returns,
    expenses,
    payments,
    debts,
    auditLogs,
  ]);

  const showToast = (message: string, type: ToastItem['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logAudit = (action: string, entityType: string, entityId: number | undefined, details: string) => {
    const newLog: AuditLog = {
      id: auditLogs.length + 1,
      userId: currentUser.id,
      username: currentUser.username,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // RBAC Permission checks
  const hasPermission = (permCode: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;

    const role = currentUser.role;
    switch (role) {
      case 'Manager':
        return ![
          'users.manage',
          'settings.manage',
          'expenses.delete',
        ].includes(permCode);
      case 'Sales':
        return [
          'dashboard.view',
          'products.view',
          'customers.manage',
          'sales.view',
          'sales.create',
          'sales.return',
          'invoices.view',
          'payments.view',
        ].includes(permCode);
      case 'Inventory':
        return [
          'dashboard.view',
          'products.view',
          'products.create',
          'products.update',
          'stock.view',
          'stock.adjust',
          'stock.transfer',
          'warehouses.view',
          'purchases.view',
          'purchases.create',
          'categories.manage',
          'brands.manage',
        ].includes(permCode);
      case 'Accountant':
        return [
          'dashboard.view',
          'sales.view',
          'purchases.view',
          'expenses.manage',
          'payments.manage',
          'debts.manage',
          'invoices.view',
          'reports.view',
        ].includes(permCode);
      default:
        return false;
    }
  };

  const switchUser = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      showToast(`Switched active profile to ${user.fullName} (${user.role})`, 'info');
      logAudit('SWITCH_USER', 'user', user.id, `Session active as ${user.username}`);
    }
  };

  const login = (username: string) => {
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (user && user.status === 'active') {
      setCurrentUser(user);
      setIsLoggedIn(true);
      showToast(`Welcome back, ${user.fullName}`, 'success');
      logAudit('LOGIN', 'user', user.id, `User logged in`);
      return true;
    }
    showToast('Invalid credentials or inactive account', 'error');
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    showToast('Signed out successfully', 'info');
  };

  // Helper to get stock for a product in a warehouse
  const getWarehouseStock = (warehouseId: number, productId: number): number => {
    const rec = warehouseStock.find((ws) => ws.warehouseId === warehouseId && ws.productId === productId);
    return rec ? rec.quantity : 0;
  };

  // Helper to adjust stock atomically and record ledger entry
  const recordStockMovementInternal = (
    productId: number,
    warehouseId: number,
    movementType: StockMovement['movementType'],
    qtyIn: number,
    qtyOut: number,
    refType: string,
    refId: number | undefined,
    refNo: string,
    notes: string = ''
  ) => {
    setWarehouseStock((prevStock) => {
      const idx = prevStock.findIndex((ws) => ws.warehouseId === warehouseId && ws.productId === productId);
      let newQuantity = 0;
      let updatedStock = [...prevStock];

      if (idx >= 0) {
        newQuantity = prevStock[idx].quantity + qtyIn - qtyOut;
        updatedStock[idx] = { ...prevStock[idx], quantity: newQuantity };
      } else {
        newQuantity = qtyIn - qtyOut;
        updatedStock.push({
          id: prevStock.length + 1,
          warehouseId,
          productId,
          quantity: newQuantity,
          reservedQuantity: 0,
        });
      }

      // Add movement log
      const newMovement: StockMovement = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        productId,
        warehouseId,
        movementType,
        quantityIn: qtyIn,
        quantityOut: qtyOut,
        balanceAfter: newQuantity,
        referenceType: refType,
        referenceId: refId,
        referenceNo: refNo,
        userId: currentUser.id,
        notes,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
      setStockMovements((prev) => [newMovement, ...prev]);

      return updatedStock;
    });
  };

  // PRODUCT CRUD
  const addProduct = (
    newProductData: Omit<Product, 'id'>,
    initialStock?: { warehouseId: number; qty: number }[]
  ): { success: boolean; error?: string } => {
    // Check duplicate SKU
    if (products.some((p) => p.sku.toLowerCase() === newProductData.sku.toLowerCase())) {
      return { success: false, error: `SKU '${newProductData.sku}' already exists.` };
    }
    if (
      newProductData.barcode &&
      products.some((p) => p.barcode && p.barcode.toLowerCase() === newProductData.barcode.toLowerCase())
    ) {
      return { success: false, error: `Barcode '${newProductData.barcode}' is already assigned.` };
    }

    const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const newProduct: Product = {
      ...newProductData,
      id: newId,
    };

    setProducts((prev) => [...prev, newProduct]);

    // Initialize stock if provided
    if (initialStock && initialStock.length > 0) {
      initialStock.forEach((st) => {
        if (st.qty > 0) {
          recordStockMovementInternal(
            newId,
            st.warehouseId,
            'Opening Stock',
            st.qty,
            0,
            'opening',
            newId,
            'INIT-STOCK',
            'Initial warehouse opening stock'
          );
        }
      });
    }

    logAudit('CREATE_PRODUCT', 'product', newId, `Added product ${newProduct.name} (${newProduct.sku})`);
    showToast(`Product '${newProduct.name}' created successfully`, 'success');
    return { success: true };
  };

  const updateProduct = (id: number, data: Partial<Product>): { success: boolean; error?: string } => {
    if (data.sku && products.some((p) => p.id !== id && p.sku.toLowerCase() === data.sku!.toLowerCase())) {
      return { success: false, error: `SKU '${data.sku}' already in use.` };
    }
    if (data.barcode && products.some((p) => p.id !== id && p.barcode && p.barcode.toLowerCase() === data.barcode!.toLowerCase())) {
      return { success: false, error: `Barcode '${data.barcode}' already in use.` };
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
    logAudit('UPDATE_PRODUCT', 'product', id, `Updated product ID #${id}`);
    showToast('Product updated successfully', 'success');
    return { success: true };
  };

  const deleteProduct = (id: number): { success: boolean; error?: string } => {
    // Check if referenced by sales or purchases
    const hasSales = sales.some((s) => s.items.some((i) => i.productId === id));
    const hasPurchases = purchases.some((p) => p.items.some((i) => i.productId === id));
    if (hasSales || hasPurchases) {
      return {
        success: false,
        error: 'Cannot delete product with existing sales or purchase transaction history. You can deactivate it instead.',
      };
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    setWarehouseStock((prev) => prev.filter((ws) => ws.productId !== id));
    logAudit('DELETE_PRODUCT', 'product', id, `Deleted product #${id}`);
    showToast('Product removed from catalog', 'success');
    return { success: true };
  };

  // CATEGORIES & BRANDS
  const addCategory = (name: string, description: string) => {
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      showToast('Category name already exists', 'error');
      return false;
    }
    const newId = categories.length > 0 ? Math.max(...categories.map((c) => c.id)) + 1 : 1;
    setCategories((prev) => [...prev, { id: newId, name, description, status: 'active' }]);
    showToast(`Category '${name}' added`, 'success');
    return true;
  };

  const updateCategory = (id: number, name: string, description: string, status: 'active' | 'inactive') => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name, description, status } : c)));
    showToast('Category updated', 'success');
    return true;
  };

  const deleteCategory = (id: number): { success: boolean; error?: string } => {
    if (products.some((p) => p.categoryId === id)) {
      return { success: false, error: 'Cannot delete category: products are assigned to it.' };
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Category deleted', 'success');
    return { success: true };
  };

  const addBrand = (name: string, description: string) => {
    if (brands.some((b) => b.name.toLowerCase() === name.toLowerCase())) {
      showToast('Brand name already exists', 'error');
      return false;
    }
    const newId = brands.length > 0 ? Math.max(...brands.map((b) => b.id)) + 1 : 1;
    setBrands((prev) => [...prev, { id: newId, name, description, status: 'active' }]);
    showToast(`Brand '${name}' added`, 'success');
    return true;
  };

  const updateBrand = (id: number, name: string, description: string, status: 'active' | 'inactive') => {
    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, name, description, status } : b)));
    showToast('Brand updated', 'success');
    return true;
  };

  const deleteBrand = (id: number): { success: boolean; error?: string } => {
    if (products.some((p) => p.brandId === id)) {
      return { success: false, error: 'Cannot delete brand: products are assigned to it.' };
    }
    setBrands((prev) => prev.filter((b) => b.id !== id));
    showToast('Brand deleted', 'success');
    return { success: true };
  };

  // SUPPLIERS & CUSTOMERS
  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const newId = suppliers.length > 0 ? Math.max(...suppliers.map((s) => s.id)) + 1 : 1;
    setSuppliers((prev) => [...prev, { ...supplierData, id: newId }]);
    showToast(`Supplier '${supplierData.company}' created`, 'success');
    return true;
  };

  const updateSupplier = (id: number, data: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    showToast('Supplier updated', 'success');
    return true;
  };

  const addCustomer = (customerData: Omit<Customer, 'id'>) => {
    const newId = customers.length > 0 ? Math.max(...customers.map((c) => c.id)) + 1 : 1;
    setCustomers((prev) => [...prev, { ...customerData, id: newId }]);
    showToast(`Customer '${customerData.name}' created`, 'success');
    return true;
  };

  const updateCustomer = (id: number, data: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    showToast('Customer updated', 'success');
    return true;
  };

  // WAREHOUSES
  const addWarehouse = (whData: Omit<Warehouse, 'id'>) => {
    const newId = warehouses.length > 0 ? Math.max(...warehouses.map((w) => w.id)) + 1 : 1;
    setWarehouses((prev) => [...prev, { ...whData, id: newId }]);
    showToast(`Warehouse '${whData.name}' added`, 'success');
    return true;
  };

  const updateWarehouse = (id: number, data: Partial<Warehouse>) => {
    setWarehouses((prev) => prev.map((w) => (w.id === id ? { ...w, ...data } : w)));
    showToast('Warehouse updated', 'success');
    return true;
  };

  // PURCHASES (Atomic: Creates Purchase, increments warehouse stock, logs movements, creates supplier debt if partial/unpaid, logs payment if paid)
  const createPurchase = (data: {
    supplierId: number;
    warehouseId: number;
    purchaseDate: string;
    items: { productId: number; quantity: number; unitCost: number; discount: number; tax: number }[];
    paidAmount: number;
    paymentMethod: 'Cash' | 'Bank' | 'Mobile Money' | 'Other';
    notes?: string;
  }): { success: boolean; purchase?: Purchase; error?: string } => {
    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'At least one product item is required.' };
    }

    const supplier = suppliers.find((s) => s.id === data.supplierId);
    if (!supplier) return { success: false, error: 'Supplier not found.' };

    const purchaseSeq = purchases.length + 1;
    const purchaseNumber = `${settings.purchasePrefix}2026-${String(purchaseSeq).padStart(3, '0')}`;

    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    const purchaseItems = data.items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      const lineSub = it.quantity * it.unitCost;
      const lineTotal = lineSub - it.discount + it.tax;
      subtotal += lineSub;
      totalDiscount += it.discount;
      totalTax += it.tax;
      return {
        productId: it.productId,
        productName: prod ? prod.name : 'Unknown Product',
        quantity: it.quantity,
        unitCost: it.unitCost,
        discount: it.discount,
        tax: it.tax,
        lineTotal,
      };
    });

    const total = subtotal - totalDiscount + totalTax;
    const paid = Math.min(data.paidAmount, total);
    const remaining = total - paid;
    const paymentStatus: Purchase['paymentStatus'] =
      paid >= total ? 'paid' : paid > 0 ? 'partial' : 'unpaid';

    const newPurchaseId = purchases.length > 0 ? Math.max(...purchases.map((p) => p.id)) + 1 : 1;
    const newPurchase: Purchase = {
      id: newPurchaseId,
      purchaseNumber,
      supplierId: data.supplierId,
      warehouseId: data.warehouseId,
      purchaseDate: data.purchaseDate,
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      total,
      paidAmount: paid,
      remainingAmount: remaining,
      paymentStatus,
      orderStatus: 'received',
      notes: data.notes,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      items: purchaseItems,
    };

    // 1. Commit purchase
    setPurchases((prev) => [newPurchase, ...prev]);

    // 2. Increase stock in target warehouse & record movements
    data.items.forEach((item) => {
      recordStockMovementInternal(
        item.productId,
        data.warehouseId,
        'Purchase',
        item.quantity,
        0,
        'purchase',
        newPurchaseId,
        purchaseNumber,
        `Received from ${supplier.company}`
      );
    });

    // 3. Record Payment if paid > 0
    if (paid > 0) {
      const payNumber = `PAY-PUR-${Date.now().toString().slice(-6)}`;
      const newPayment: Payment = {
        id: payments.length + 1,
        paymentNumber: payNumber,
        paymentType: 'Purchase Payment',
        relatedType: 'purchase',
        relatedId: newPurchaseId,
        partyType: 'supplier',
        partyId: data.supplierId,
        partyName: supplier.company,
        amount: paid,
        paymentMethod: data.paymentMethod,
        paymentDate: data.purchaseDate,
        notes: `Payment for Purchase ${purchaseNumber}`,
        createdBy: currentUser.id,
      };
      setPayments((prev) => [newPayment, ...prev]);
    }

    // 4. Create Supplier Debt if balance remaining
    if (remaining > 0) {
      const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
      const newDebt: Debt = {
        id: debts.length + 1,
        debtType: 'supplier',
        partyId: data.supplierId,
        partyName: supplier.company,
        referenceType: 'purchase',
        referenceId: newPurchaseId,
        referenceNumber: purchaseNumber,
        originalAmount: total,
        paidAmount: paid,
        remainingAmount: remaining,
        dueDate,
        status: paid > 0 ? 'partially_paid' : 'unpaid',
      };
      setDebts((prev) => [newDebt, ...prev]);
    }

    logAudit('CREATE_PURCHASE', 'purchase', newPurchaseId, `Received PO ${purchaseNumber} ($${total.toFixed(2)})`);
    showToast(`Purchase Order ${purchaseNumber} received & stock updated!`, 'success');
    return { success: true, purchase: newPurchase };
  };

  // SALES / POS (Atomic: Row lock check -> Validates warehouse stock -> Decrements stock -> Logs movement -> Creates Invoice -> Records Payment -> Creates Customer Debt if unpaid)
  const createSale = (data: {
    customerId: number;
    warehouseId: number;
    saleDate: string;
    items: { productId: number; quantity: number; unitPrice: number; discount: number; tax: number }[];
    paidAmount: number;
    paymentMethod: 'Cash' | 'Bank' | 'Mobile Money' | 'Other';
    saleType: 'pos' | 'standard' | 'credit';
    notes?: string;
  }): { success: boolean; sale?: Sale; invoice?: Invoice; error?: string } => {
    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'Shopping cart is empty.' };
    }

    const warehouse = warehouses.find((w) => w.id === data.warehouseId);
    const customer = customers.find((c) => c.id === data.customerId) || {
      id: 0,
      name: 'Walk-in Customer',
      phone: '—',
      email: '',
      address: '',
      customerType: 'retail' as const,
      creditLimit: 0,
      status: 'active' as const,
    };
    if (!warehouse) return { success: false, error: 'Selected warehouse not found.' };

    // 1. Critical Validation: Check available stock in the specified warehouse
    for (const item of data.items) {
      const currentStock = getWarehouseStock(data.warehouseId, item.productId);
      const prod = products.find((p) => p.id === item.productId);
      const prodName = prod ? prod.name : `Product #${item.productId}`;

      if (currentStock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for '${prodName}' in warehouse '${warehouse.name}'. Available: ${currentStock}, Requested: ${item.quantity}.`,
        };
      }
    }

    // 2. Calculate totals
    const saleSeq = sales.length + 1;
    const saleNumber = `SALE-2026-${String(saleSeq).padStart(3, '0')}`;
    const invoiceNumber = `${settings.invoicePrefix}2026-${String(saleSeq).padStart(3, '0')}`;

    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    const saleItems = data.items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      const lineSub = it.quantity * it.unitPrice;
      const lineTotal = lineSub - it.discount + it.tax;
      subtotal += lineSub;
      totalDiscount += it.discount;
      totalTax += it.tax;
      return {
        productId: it.productId,
        productName: prod ? prod.name : 'Unknown Product',
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        purchaseCost: prod ? prod.purchasePrice : 0,
        discount: it.discount,
        tax: it.tax,
        lineTotal,
      };
    });

    const total = subtotal - totalDiscount + totalTax;
    const paid = Math.min(data.paidAmount, total);
    const remaining = total - paid;

    // Check customer credit limit if there is debt
    if (remaining > 0 && customer.id === 0) {
      return {
        success: false,
        error: 'Walk-in retail sales must be paid in full. Please register a customer account to extend credit.',
      };
    }

    if (remaining > 0 && customer.customerType !== 'retail') {
      const currentCustomerDebt = debts
        .filter((d) => d.debtType === 'customer' && d.partyId === customer.id && d.status !== 'paid')
        .reduce((sum, d) => sum + d.remainingAmount, 0);

      if (currentCustomerDebt + remaining > customer.creditLimit) {
        return {
          success: false,
          error: `Customer credit limit exceeded! Limit: $${customer.creditLimit}, Current Debt: $${currentCustomerDebt.toFixed(2)}, Order Unpaid: $${remaining.toFixed(2)}.`,
        };
      }
    }

    const paymentStatus: Sale['paymentStatus'] =
      paid >= total ? 'paid' : paid > 0 ? 'partial' : 'unpaid';

    const newSaleId = sales.length > 0 ? Math.max(...sales.map((s) => s.id)) + 1 : 1;
    const newSale: Sale = {
      id: newSaleId,
      saleNumber,
      customerId: data.customerId,
      warehouseId: data.warehouseId,
      saleDate: data.saleDate,
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      total,
      paidAmount: paid,
      remainingAmount: remaining,
      paymentStatus,
      saleType: data.saleType,
      notes: data.notes,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      items: saleItems,
    };

    // 3. Create invoice
    const newInvoiceId = invoices.length > 0 ? Math.max(...invoices.map((i) => i.id)) + 1 : 1;
    const dueDate = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const newInvoice: Invoice = {
      id: newInvoiceId,
      invoiceNumber,
      saleId: newSaleId,
      customerId: data.customerId,
      invoiceDate: data.saleDate,
      dueDate,
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      total,
      paidAmount: paid,
      remainingAmount: remaining,
      status: paid >= total ? 'paid' : paid > 0 ? 'partial' : 'unpaid',
      notes: data.notes,
    };

    // 4. Commit Sale & Invoice
    setSales((prev) => [newSale, ...prev]);
    setInvoices((prev) => [newInvoice, ...prev]);

    // 5. Atomic Stock Deduction & Movement Ledger
    data.items.forEach((item) => {
      recordStockMovementInternal(
        item.productId,
        data.warehouseId,
        'Sale',
        0,
        item.quantity,
        'sale',
        newSaleId,
        saleNumber,
        `Sold via ${data.saleType.toUpperCase()} to ${customer.name}`
      );
    });

    // 6. Record Payment if paid > 0
    if (paid > 0) {
      const payNumber = `PAY-SAL-${Date.now().toString().slice(-6)}`;
      const newPayment: Payment = {
        id: payments.length + 1,
        paymentNumber: payNumber,
        paymentType: 'Sales Payment',
        relatedType: 'sale',
        relatedId: newSaleId,
        partyType: 'customer',
        partyId: data.customerId,
        partyName: customer.name,
        amount: paid,
        paymentMethod: data.paymentMethod,
        paymentDate: data.saleDate,
        notes: `POS/Sales settlement for ${saleNumber}`,
        createdBy: currentUser.id,
      };
      setPayments((prev) => [newPayment, ...prev]);
    }

    // 7. Record Customer Debt if unpaid
    if (remaining > 0) {
      const newDebt: Debt = {
        id: debts.length + 1,
        debtType: 'customer',
        partyId: data.customerId,
        partyName: customer.name,
        referenceType: 'invoice',
        referenceId: newInvoiceId,
        referenceNumber: invoiceNumber,
        originalAmount: total,
        paidAmount: paid,
        remainingAmount: remaining,
        dueDate,
        status: paid > 0 ? 'partially_paid' : 'unpaid',
      };
      setDebts((prev) => [newDebt, ...prev]);
    }

    logAudit('CREATE_SALE', 'sale', newSaleId, `Completed sale ${saleNumber} for $${total.toFixed(2)}`);
    showToast(`Sale ${saleNumber} completed! Invoice ${invoiceNumber} created.`, 'success');
    return { success: true, sale: newSale, invoice: newInvoice };
  };

  // STOCK TRANSFERS (Atomic: Source != Dest, Validates source stock, deducts from source, adds to dest, logs movements)
  const createTransfer = (data: {
    sourceWarehouseId: number;
    destinationWarehouseId: number;
    transferDate: string;
    items: { productId: number; quantity: number }[];
    notes?: string;
  }): { success: boolean; error?: string } => {
    if (data.sourceWarehouseId === data.destinationWarehouseId) {
      return { success: false, error: 'Source and Destination warehouses must be different.' };
    }
    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'At least one item must be transferred.' };
    }

    const sourceWh = warehouses.find((w) => w.id === data.sourceWarehouseId);
    const destWh = warehouses.find((w) => w.id === data.destinationWarehouseId);

    // Validate stock in source
    for (const item of data.items) {
      const available = getWarehouseStock(data.sourceWarehouseId, item.productId);
      const prod = products.find((p) => p.id === item.productId);
      if (available < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for '${prod?.name || 'Item'}' in ${sourceWh?.name}. Available: ${available}, requested: ${item.quantity}.`,
        };
      }
    }

    const transferSeq = stockTransfers.length + 1;
    const transferNumber = `TRF-2026-${String(transferSeq).padStart(3, '0')}`;
    const newTransferId = stockTransfers.length > 0 ? Math.max(...stockTransfers.map((t) => t.id)) + 1 : 1;

    const newTransfer: StockTransfer = {
      id: newTransferId,
      transferNumber,
      sourceWarehouseId: data.sourceWarehouseId,
      destinationWarehouseId: data.destinationWarehouseId,
      transferDate: data.transferDate,
      status: 'completed',
      notes: data.notes,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      items: data.items,
    };

    setStockTransfers((prev) => [newTransfer, ...prev]);

    // Move stock
    data.items.forEach((item) => {
      // Deduct from source
      recordStockMovementInternal(
        item.productId,
        data.sourceWarehouseId,
        'Transfer Out',
        0,
        item.quantity,
        'transfer',
        newTransferId,
        transferNumber,
        `Transferred to ${destWh?.name}`
      );
      // Add to destination
      recordStockMovementInternal(
        item.productId,
        data.destinationWarehouseId,
        'Transfer In',
        item.quantity,
        0,
        'transfer',
        newTransferId,
        transferNumber,
        `Received from ${sourceWh?.name}`
      );
    });

    logAudit('STOCK_TRANSFER', 'stock', newTransferId, `Transferred ${data.items.length} items from ${sourceWh?.code} to ${destWh?.code}`);
    showToast(`Stock transfer ${transferNumber} completed successfully`, 'success');
    return { success: true };
  };

  // STOCK ADJUSTMENTS (Physical audit discrepancy, damaged, expired)
  const createAdjustment = (data: {
    productId: number;
    warehouseId: number;
    adjustmentType: 'Increase' | 'Decrease';
    quantity: number;
    reason: StockAdjustment['reason'];
    notes: string;
  }): { success: boolean; error?: string } => {
    if (data.quantity <= 0) {
      return { success: false, error: 'Adjustment quantity must be greater than zero.' };
    }

    if (data.adjustmentType === 'Decrease') {
      const currentStock = getWarehouseStock(data.warehouseId, data.productId);
      if (currentStock < data.quantity) {
        return {
          success: false,
          error: `Cannot decrease stock by ${data.quantity}. Current available stock is only ${currentStock}.`,
        };
      }
    }

    const adjSeq = stockAdjustments.length + 1;
    const adjustmentNumber = `ADJ-2026-${String(adjSeq).padStart(3, '0')}`;
    const newAdjId = stockAdjustments.length > 0 ? Math.max(...stockAdjustments.map((a) => a.id)) + 1 : 1;

    const newAdjustment: StockAdjustment = {
      id: newAdjId,
      adjustmentNumber,
      productId: data.productId,
      warehouseId: data.warehouseId,
      adjustmentType: data.adjustmentType,
      quantity: data.quantity,
      reason: data.reason,
      notes: data.notes,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setStockAdjustments((prev) => [newAdjustment, ...prev]);

    const qtyIn = data.adjustmentType === 'Increase' ? data.quantity : 0;
    const qtyOut = data.adjustmentType === 'Decrease' ? data.quantity : 0;

    recordStockMovementInternal(
      data.productId,
      data.warehouseId,
      'Adjustment',
      qtyIn,
      qtyOut,
      'adjustment',
      newAdjId,
      adjustmentNumber,
      `${data.reason}: ${data.notes}`
    );

    logAudit('STOCK_ADJUSTMENT', 'stock', newAdjId, `${data.adjustmentType} of ${data.quantity} units (${data.reason})`);
    showToast(`Stock adjustment ${adjustmentNumber} logged`, 'success');
    return { success: true };
  };

  // SALES RETURNS
  const createSalesReturn = (data: {
    saleId: number;
    items: { productId: number; quantity: number; unitPrice: number; restockToInventory: boolean }[];
    reason: string;
  }): { success: boolean; error?: string } => {
    const sale = sales.find((s) => s.id === data.saleId);
    if (!sale) return { success: false, error: 'Sale not found.' };

    let totalRefund = 0;
    data.items.forEach((item) => {
      totalRefund += item.quantity * item.unitPrice;
      if (item.restockToInventory) {
        recordStockMovementInternal(
          item.productId,
          sale.warehouseId,
          'Sales Return',
          item.quantity,
          0,
          'sales_return',
          sale.id,
          sale.saleNumber,
          `Customer Return: ${data.reason}`
        );
      }
    });

    const returnSeq = returns.length + 1;
    const returnNumber = `RET-SL-2026-${String(returnSeq).padStart(3, '0')}`;
    const newReturn: ReturnRecord = {
      id: returns.length + 1,
      returnNumber,
      returnType: 'sale_return',
      referenceId: sale.id,
      referenceNo: sale.saleNumber,
      partyId: sale.customerId,
      warehouseId: sale.warehouseId,
      returnDate: new Date().toISOString().slice(0, 10),
      totalRefundAmount: totalRefund,
      reason: data.reason,
      status: 'completed',
      createdBy: currentUser.id,
      items: data.items.map((i) => ({
        ...i,
        lineTotal: i.quantity * i.unitPrice,
      })),
    };

    setReturns((prev) => [newReturn, ...prev]);

    // Record refund payment or adjust debt
    const payNumber = `REF-${Date.now().toString().slice(-6)}`;
    const newPayment: Payment = {
      id: payments.length + 1,
      paymentNumber: payNumber,
      paymentType: 'Customer Refund',
      relatedType: 'return',
      relatedId: newReturn.id,
      partyType: 'customer',
      partyId: sale.customerId,
      partyName: customers.find((c) => c.id === sale.customerId)?.name,
      amount: totalRefund,
      paymentMethod: 'Cash',
      paymentDate: new Date().toISOString().slice(0, 10),
      notes: `Sales return refund for ${sale.saleNumber}`,
      createdBy: currentUser.id,
    };
    setPayments((prev) => [newPayment, ...prev]);

    logAudit('SALES_RETURN', 'sale', sale.id, `Processed return ${returnNumber} ($${totalRefund.toFixed(2)})`);
    showToast(`Sales return ${returnNumber} processed successfully`, 'success');
    return { success: true };
  };

  // PURCHASE RETURNS
  const createPurchaseReturn = (data: {
    purchaseId: number;
    items: { productId: number; quantity: number; unitPrice: number }[];
    reason: string;
  }): { success: boolean; error?: string } => {
    const purchase = purchases.find((p) => p.id === data.purchaseId);
    if (!purchase) return { success: false, error: 'Purchase order not found.' };

    let totalRefund = 0;
    // Validate stock exists to return
    for (const item of data.items) {
      const avail = getWarehouseStock(purchase.warehouseId, item.productId);
      if (avail < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock in warehouse to return ${item.quantity} units. Available: ${avail}.`,
        };
      }
    }

    data.items.forEach((item) => {
      totalRefund += item.quantity * item.unitPrice;
      recordStockMovementInternal(
        item.productId,
        purchase.warehouseId,
        'Purchase Return',
        0,
        item.quantity,
        'purchase_return',
        purchase.id,
        purchase.purchaseNumber,
        `Returned to supplier: ${data.reason}`
      );
    });

    const returnSeq = returns.length + 1;
    const returnNumber = `RET-PO-2026-${String(returnSeq).padStart(3, '0')}`;
    const newReturn: ReturnRecord = {
      id: returns.length + 1,
      returnNumber,
      returnType: 'purchase_return',
      referenceId: purchase.id,
      referenceNo: purchase.purchaseNumber,
      partyId: purchase.supplierId,
      warehouseId: purchase.warehouseId,
      returnDate: new Date().toISOString().slice(0, 10),
      totalRefundAmount: totalRefund,
      reason: data.reason,
      status: 'completed',
      createdBy: currentUser.id,
      items: data.items.map((i) => ({
        ...i,
        lineTotal: i.quantity * i.unitPrice,
        restockToInventory: false,
      })),
    };

    setReturns((prev) => [newReturn, ...prev]);
    showToast(`Purchase return ${returnNumber} processed`, 'success');
    return { success: true };
  };

  // EXPENSES
  const addExpense = (expenseData: Omit<Expense, 'id' | 'referenceNo' | 'createdBy'>) => {
    const expSeq = expenses.length + 1;
    const referenceNo = `EXP-2026-${String(expSeq).padStart(3, '0')}`;
    const newId = expenses.length > 0 ? Math.max(...expenses.map((e) => e.id)) + 1 : 1;
    const newExpense: Expense = {
      ...expenseData,
      id: newId,
      referenceNo,
      createdBy: currentUser.id,
    };
    setExpenses((prev) => [newExpense, ...prev]);

    // Record in centralized payments ledger
    const payNumber = `PAY-EXP-${Date.now().toString().slice(-6)}`;
    const newPayment: Payment = {
      id: payments.length + 1,
      paymentNumber: payNumber,
      paymentType: 'Expense Payment',
      relatedType: 'expense',
      relatedId: newId,
      partyType: 'none',
      amount: expenseData.amount,
      paymentMethod: expenseData.paymentMethod,
      paymentDate: expenseData.expenseDate,
      notes: `Expense payment: ${expenseData.description}`,
      createdBy: currentUser.id,
    };
    setPayments((prev) => [newPayment, ...prev]);

    logAudit('CREATE_EXPENSE', 'expense', newId, `Recorded expense $${expenseData.amount.toFixed(2)} (${expenseData.description})`);
    showToast(`Expense ${referenceNo} recorded`, 'success');
    return true;
  };

  // DIRECT PAYMENT
  const recordDirectPayment = (paymentData: Omit<Payment, 'id' | 'paymentNumber' | 'createdBy'>) => {
    const payNumber = `PAY-${Date.now().toString().slice(-6)}`;
    const newPayment: Payment = {
      ...paymentData,
      id: payments.length + 1,
      paymentNumber: payNumber,
      createdBy: currentUser.id,
    };
    setPayments((prev) => [newPayment, ...prev]);
    showToast(`Payment ${payNumber} of $${paymentData.amount.toFixed(2)} recorded`, 'success');
    return true;
  };

  // DEBT SETTLEMENT
  const settleDebt = (debtId: number, amount: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile Money' | 'Other', notes: string = '') => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) return false;

    if (amount <= 0 || amount > debt.remainingAmount) {
      showToast(`Settlement amount must be between $0.01 and $${debt.remainingAmount.toFixed(2)}`, 'error');
      return false;
    }

    const newPaid = debt.paidAmount + amount;
    const newRemaining = debt.originalAmount - newPaid;
    const newStatus = newRemaining <= 0 ? 'paid' : 'partially_paid';

    setDebts((prev) =>
      prev.map((d) =>
        d.id === debtId
          ? { ...d, paidAmount: newPaid, remainingAmount: newRemaining, status: newStatus }
          : d
      )
    );

    // Update related invoice or purchase if linked
    if (debt.referenceType === 'invoice') {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === debt.referenceId
            ? {
                ...inv,
                paidAmount: inv.paidAmount + amount,
                remainingAmount: inv.total - (inv.paidAmount + amount),
                status: inv.total - (inv.paidAmount + amount) <= 0 ? 'paid' : 'partial',
              }
            : inv
        )
      );
    } else if (debt.referenceType === 'purchase') {
      setPurchases((prev) =>
        prev.map((po) =>
          po.id === debt.referenceId
            ? {
                ...po,
                paidAmount: po.paidAmount + amount,
                remainingAmount: po.total - (po.paidAmount + amount),
                paymentStatus: po.total - (po.paidAmount + amount) <= 0 ? 'paid' : 'partial',
              }
            : po
        )
      );
    }

    // Log payment entry
    const paymentType = debt.debtType === 'customer' ? 'Customer Debt Payment' : 'Supplier Debt Payment';
    const payNumber = `PAY-DBT-${Date.now().toString().slice(-6)}`;
    const newPayment: Payment = {
      id: payments.length + 1,
      paymentNumber: payNumber,
      paymentType,
      relatedType: 'debt',
      relatedId: debtId,
      partyType: debt.debtType,
      partyId: debt.partyId,
      partyName: debt.partyName,
      amount,
      paymentMethod,
      paymentDate: new Date().toISOString().slice(0, 10),
      notes: notes || `Debt settlement against ${debt.referenceNumber}`,
      createdBy: currentUser.id,
    };
    setPayments((prev) => [newPayment, ...prev]);

    logAudit('SETTLE_DEBT', 'debt', debtId, `Settled $${amount.toFixed(2)} against ${debt.referenceNumber}`);
    showToast(`Debt settlement of $${amount.toFixed(2)} recorded successfully`, 'success');
    return true;
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logAudit('UPDATE_SETTINGS', 'settings', undefined, 'Updated organization business settings');
    showToast('Business settings saved successfully', 'success');
  };

  const resetDatabaseToSeed = () => {
    setSettings(INITIAL_SETTINGS);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setWarehouses(INITIAL_WAREHOUSES);
    setCategories(INITIAL_CATEGORIES);
    setBrands(INITIAL_BRANDS);
    setSuppliers(INITIAL_SUPPLIERS);
    setCustomers(INITIAL_CUSTOMERS);
    setProducts(INITIAL_PRODUCTS);
    setWarehouseStock(INITIAL_WAREHOUSE_STOCK);
    setStockMovements(INITIAL_MOVEMENTS);
    setStockTransfers(INITIAL_TRANSFERS);
    setStockAdjustments(INITIAL_ADJUSTMENTS);
    setPurchases(INITIAL_PURCHASES);
    setSales(INITIAL_SALES);
    setInvoices(INITIAL_INVOICES);
    setReturns(INITIAL_RETURNS);
    setExpenses(INITIAL_EXPENSES);
    setPayments(INITIAL_PAYMENTS);
    setDebts(INITIAL_DEBTS);
    setAuditLogs([
      {
        id: 1,
        userId: 1,
        username: 'admin',
        action: 'DATABASE_RESET',
        entityType: 'database',
        details: 'Database restored to initial MySQL 8.0 seed state',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      },
    ]);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Database reset to clean MySQL seed baseline', 'info');
  };

  return (
    <InventoryContext.Provider
      value={{
        settings,
        users,
        currentUser,
        warehouses,
        categories,
        brands,
        suppliers,
        customers,
        products,
        warehouseStock,
        stockMovements,
        stockTransfers,
        stockAdjustments,
        purchases,
        sales,
        invoices,
        returns,
        expenses,
        expenseCategories,
        payments,
        debts,
        auditLogs,
        toasts,
        hasPermission,
        switchUser,
        login,
        logout,
        isLoggedIn,
        showToast,
        removeToast,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addBrand,
        updateBrand,
        deleteBrand,
        addSupplier,
        updateSupplier,
        addCustomer,
        updateCustomer,
        addWarehouse,
        updateWarehouse,
        createPurchase,
        createSale,
        createTransfer,
        createAdjustment,
        createSalesReturn,
        createPurchaseReturn,
        addExpense,
        recordDirectPayment,
        settleDebt,
        updateSettings,
        resetDatabaseToSeed,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

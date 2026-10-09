export type UserRole = 'Admin' | 'Manager' | 'Sales' | 'Inventory' | 'Accountant';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'inactive';
  lastLoginAt?: string;
}

export interface Permission {
  id: number;
  code: string;
  module: string;
  description: string;
}

export interface BusinessSettings {
  businessName: string;
  businessLogo?: string;
  taxNumber: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  currencySymbol: string;
  taxRate: number; // percentage, e.g. 8.5
  invoicePrefix: string;
  purchasePrefix: string;
  receiptFooterNote: string;
  defaultWarehouseId: number;
  lowStockThreshold: number;
  timezone: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface Brand {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface Supplier {
  id: number;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  taxNumber: string;
  status: 'active' | 'inactive';
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  customerType: 'retail' | 'wholesale' | 'corporate';
  creditLimit: number;
  status: 'active' | 'inactive';
}

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  location: string;
  managerName: string;
  phone: string;
  capacity: number;
  isDefault: boolean;
  status: 'active' | 'inactive';
}

export interface Product {
  id: number;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  categoryId: number;
  brandId?: number;
  defaultSupplierId?: number;
  purchasePrice: number;
  sellingPrice: number;
  wholesalePrice: number;
  minStockLevel: number;
  unit: string;
  imageUrl?: string;
  status: 'active' | 'inactive' | 'discontinued';
}

export interface WarehouseStock {
  id: number;
  warehouseId: number;
  productId: number;
  quantity: number;
  reservedQuantity: number;
}

export type MovementType =
  | 'Opening Stock'
  | 'Purchase'
  | 'Sale'
  | 'Purchase Return'
  | 'Sales Return'
  | 'Transfer In'
  | 'Transfer Out'
  | 'Adjustment';

export interface StockMovement {
  id: number;
  productId: number;
  warehouseId: number;
  movementType: MovementType;
  quantityIn: number;
  quantityOut: number;
  balanceAfter: number;
  referenceType: string;
  referenceId?: number;
  referenceNo: string;
  userId: number;
  notes?: string;
  createdAt: string;
}

export interface StockTransfer {
  id: number;
  transferNumber: string;
  sourceWarehouseId: number;
  destinationWarehouseId: number;
  transferDate: string;
  status: 'draft' | 'pending' | 'completed' | 'cancelled';
  notes?: string;
  createdBy: number;
  createdAt: string;
  items: {
    productId: number;
    quantity: number;
  }[];
}

export interface StockAdjustment {
  id: number;
  adjustmentNumber: string;
  productId: number;
  warehouseId: number;
  adjustmentType: 'Increase' | 'Decrease';
  quantity: number;
  reason: 'Damaged' | 'Expired' | 'Inventory Audit Discrepancy' | 'Theft or Loss' | 'Found Stock' | 'Other';
  notes: string;
  createdBy: number;
  createdAt: string;
}

export interface PurchaseItem {
  productId: number;
  productName?: string;
  quantity: number;
  unitCost: number;
  discount: number;
  tax: number;
  lineTotal: number;
}

export interface Purchase {
  id: number;
  purchaseNumber: string;
  supplierId: number;
  warehouseId: number;
  purchaseDate: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  orderStatus: 'pending' | 'received' | 'cancelled';
  notes?: string;
  createdBy: number;
  createdAt: string;
  items: PurchaseItem[];
}

export interface SaleItem {
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  purchaseCost: number; // for historical COGS calculations
  discount: number;
  tax: number;
  lineTotal: number;
}

export interface Sale {
  id: number;
  saleNumber: string;
  customerId: number;
  warehouseId: number;
  saleDate: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  saleType: 'pos' | 'standard' | 'credit';
  notes?: string;
  createdBy: number;
  createdAt: string;
  items: SaleItem[];
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  saleId: number;
  customerId: number;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'paid' | 'partial' | 'unpaid' | 'cancelled';
  notes?: string;
}

export interface ReturnItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  restockToInventory: boolean;
}

export interface ReturnRecord {
  id: number;
  returnNumber: string;
  returnType: 'sale_return' | 'purchase_return';
  referenceId: number;
  referenceNo: string;
  partyId: number; // customer or supplier
  warehouseId: number;
  returnDate: string;
  totalRefundAmount: number;
  reason: string;
  status: 'completed' | 'pending' | 'rejected';
  createdBy: number;
  items: ReturnItem[];
}

export interface ExpenseCategory {
  id: number;
  name: string;
  description?: string;
}

export interface Expense {
  id: number;
  referenceNo: string;
  categoryId: number;
  description: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank' | 'Mobile Money' | 'Other';
  expenseDate: string;
  createdBy: number;
  notes?: string;
}

export interface Payment {
  id: number;
  paymentNumber: string;
  paymentType:
    | 'Customer Payment'
    | 'Supplier Payment'
    | 'Sales Payment'
    | 'Purchase Payment'
    | 'Expense Payment'
    | 'Customer Debt Payment'
    | 'Supplier Debt Payment'
    | 'Customer Refund'
    | 'Supplier Refund';
  relatedType: 'sale' | 'purchase' | 'invoice' | 'expense' | 'debt' | 'return' | 'standalone';
  relatedId?: number;
  partyType: 'customer' | 'supplier' | 'none';
  partyId?: number;
  partyName?: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank' | 'Mobile Money' | 'Other';
  paymentDate: string;
  notes?: string;
  createdBy: number;
}

export interface Debt {
  id: number;
  debtType: 'customer' | 'supplier';
  partyId: number;
  partyName: string;
  referenceType: 'sale' | 'purchase' | 'invoice';
  referenceId: number;
  referenceNumber: string;
  originalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
}

export interface AuditLog {
  id: number;
  userId: number;
  username: string;
  action: string;
  entityType: string;
  entityId?: number;
  details: string;
  createdAt: string;
}

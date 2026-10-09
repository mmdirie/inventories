# REST API Reference Manual

## Base URL
`/api`

All requests expecting or returning payloads use `Content-Type: application/json`.

---

## 1. Authentication & Security
- `POST /api/auth/login`
  - Body: `{ username, password }`
  - Response: `{ success: true, user: { id, username, fullName, role, permissions } }`
- `POST /api/auth/logout`
  - Response: `{ success: true, message: "Logged out" }`
- `GET /api/auth/me`
  - Response: `{ success: true, user }`
- `POST /api/auth/change-password`
  - Body: `{ currentPassword, newPassword }`

---

## 2. Products
- `GET /api/products` (Filters: `search`, `category_id`, `brand_id`, `status`, `low_stock`)
- `POST /api/products`
  - Body: `{ sku, barcode, name, description, category_id, brand_id, default_supplier_id, purchase_price, selling_price, wholesale_price, min_stock_level, unit }`
- `GET /api/products/:id`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

---

## 3. Warehouses & Stock
- `GET /api/warehouses`
- `POST /api/warehouses`
- `PUT /api/warehouses/:id`
- `GET /api/stock` (Product stock grouped by warehouse)
- `GET /api/stock/movements` (Stock ledger history)
- `GET /api/stock/low-stock` (Items where current stock <= min_stock_level)
- `POST /api/stock/adjust`
  - Body: `{ product_id, warehouse_id, adjustment_type: 'Increase'|'Decrease', quantity, reason, notes }`
- `POST /api/stock/transfers`
  - Body: `{ source_warehouse_id, destination_warehouse_id, items: [{ product_id, quantity }], notes }`

---

## 4. Purchases & Suppliers
- `GET /api/suppliers`
- `POST /api/suppliers`
- `PUT /api/suppliers/:id`
- `GET /api/purchases`
- `POST /api/purchases`
  - Body: `{ supplier_id, warehouse_id, purchase_date, items: [{ product_id, quantity, unit_cost, discount, tax }], paid_amount, payment_method, notes }`
- `GET /api/purchases/:id`
- `POST /api/purchases/returns`

---

## 5. Sales & Point of Sale (POS)
- `GET /api/customers`
- `POST /api/customers`
- `PUT /api/customers/:id`
- `GET /api/sales`
- `POST /api/sales`
  - Body: `{ customer_id, warehouse_id, items: [{ product_id, quantity, unit_price, discount, tax }], paid_amount, payment_method, sale_type, notes }`
- `GET /api/sales/:id`
- `POST /api/sales/returns`

---

## 6. Financials & Invoices
- `GET /api/invoices`
- `GET /api/invoices/:id`
- `GET /api/expenses`
- `POST /api/expenses`
- `GET /api/payments`
- `POST /api/payments`
- `GET /api/debts` (Customer & Supplier debt ledgers)
- `POST /api/debts/:id/pay`

---

## 7. Reports
- `GET /api/reports/sales`
- `GET /api/reports/purchases`
- `GET /api/reports/inventory`
- `GET /api/reports/profit-loss`

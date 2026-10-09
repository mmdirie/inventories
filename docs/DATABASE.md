# Database Architecture & Entity Relationships

## Database Engine
- **Engine**: MySQL 8.0+ (InnoDB storage engine)
- **Character Encoding**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`

## Key Design Principles
1. **Referential Integrity**: Cascading deletes are only permitted on child item tables (`sale_items`, `purchase_items`, `role_permissions`). Master tables enforce `RESTRICT` to prevent financial history corruption.
2. **Precision Decimals**: All currency and financial figures use `DECIMAL(12, 2)`. Float and double types are prohibited.
3. **Atomic Transactions**: Multi-table updates (e.g., Sale -> Deduct Stock -> Create Movement -> Issue Invoice -> Record Payment -> Register Debt) execute inside `START TRANSACTION` / `COMMIT` blocks with rollback safety.
4. **Warehouse-Partitioned Stock**: Product records never store a single global stock number. Quantities reside in `warehouse_stock (warehouse_id, product_id)` with row-level integrity.
5. **Audited Ledger**: Every physical addition or subtraction logs to `stock_movements` recording user, timestamps, movement type, before/after balances, and source document.

## Schema Tables
- `settings`: Business master information and operational rules.
- `roles`, `permissions`, `role_permissions`: Granular RBAC matrix.
- `users`, `user_roles`, `audit_logs`: User identity, credential hashes, and audit trail.
- `categories`, `brands`, `suppliers`, `customers`: Master dimensions.
- `products`: Catalog items, SKU, Barcode, pricing tiers, min levels.
- `warehouses`: Multi-location storage hubs.
- `warehouse_stock`: Inventory matrix per warehouse.
- `stock_movements`: Immutable stock ledger.
- `stock_transfers`, `stock_transfer_items`: Inter-warehouse movement workflows.
- `stock_adjustments`: Physical audit variance reconciliation.
- `purchases`, `purchase_items`: Inbound inventory procurement.
- `sales`, `sale_items`: POS & customer orders.
- `invoices`: Formal commercial invoices with tax breakdown.
- `returns`, `return_items`: Sales and purchase return logs.
- `expenses`, `expense_categories`: Operational overhead tracking.
- `payments`: Unified financial transaction register.
- `debts`: Customer receivables and supplier payables.

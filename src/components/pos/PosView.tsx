import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Product, Customer } from '../../types/inventory';
import { BarcodeSvg } from '../common/BarcodeSvg';
import {
  Search,
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  CreditCard,
  Building2,
  User,
  Printer,
  X,
  AlertCircle,
  Coins,
  Receipt,
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export const PosView: React.FC = () => {
  const {
    products,
    categories,
    warehouses,
    customers,
    warehouseStock,
    settings,
    createSale,
    showToast,
  } = useInventory();

  // POS State
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(settings.defaultWarehouseId || 1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(0); // Walk-in Retail Customer (id 0)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [overallDiscountPercent, setOverallDiscountPercent] = useState<number>(0);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank' | 'Mobile Money' | 'Other'>('Cash');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [saleNotes, setSaleNotes] = useState('');
  const [completedSale, setCompletedSale] = useState<any>(null);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status !== 'active') return false;
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Stock for current warehouse
  const getProductStock = (productId: number) => {
    const ws = warehouseStock.find(
      (s) => s.warehouseId === selectedWarehouseId && s.productId === productId
    );
    return ws ? ws.quantity : 0;
  };

  // Add to cart
  const addToCart = (product: Product) => {
    const stockAvailable = getProductStock(product.id);
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    const currentCartQty = existingIndex >= 0 ? cart[existingIndex].quantity : 0;

    if (currentCartQty + 1 > stockAvailable) {
      showToast(`Cannot add more. Stock limit for '${product.name}' in this warehouse is ${stockAvailable}.`, 'warning');
      return;
    }

    if (existingIndex >= 0) {
      setCart((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          product,
          quantity: 1,
          unitPrice: product.sellingPrice,
          discount: 0,
        },
      ]);
    }
  };

  // Barcode quick scanner trigger
  const handleBarcodeLookup = () => {
    const clean = searchQuery.trim();
    if (!clean) return;
    const match = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === clean.toLowerCase()) ||
        p.sku.toLowerCase() === clean.toLowerCase()
    );
    if (match) {
      addToCart(match);
      setSearchQuery('');
      showToast(`Scanned & added: ${match.name}`, 'success');
    } else {
      showToast(`No product found with barcode/SKU: ${clean}`, 'error');
    }
  };

  const updateQuantity = (productId: number, delta: number) => {
    const stockAvailable = getProductStock(productId);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty > stockAvailable) {
              showToast(`Exceeds available stock (${stockAvailable})`, 'warning');
              return item;
            }
            return { ...item, quantity: Math.max(1, nextQty) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const setDirectQuantity = (productId: number, qtyStr: string) => {
    const qty = parseInt(qtyStr, 10);
    if (isNaN(qty) || qty <= 0) return;
    const stockAvailable = getProductStock(productId);
    if (qty > stockAvailable) {
      showToast(`Exceeds available stock (${stockAvailable})`, 'warning');
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: qty } : item))
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setOverallDiscountPercent(0);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountAmount = (subtotal * overallDiscountPercent) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * settings.taxRate) / 100;
  const totalAmount = taxableAmount + taxAmount;

  // Selected customer details
  const defaultWalkIn: Customer = {
    id: 0,
    name: 'Walk-in Customer',
    phone: '—',
    email: '',
    address: '',
    city: '',
    customerType: 'retail',
    creditLimit: 0,
    status: 'active',
  };
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || defaultWalkIn;

  // Open Checkout
  const handleInitiateCheckout = () => {
    if (cart.length === 0) {
      showToast('Cart is empty. Select items to proceed.', 'error');
      return;
    }
    setAmountTendered(totalAmount.toFixed(2));
    setIsCheckoutOpen(true);
  };

  // Submit Sale
  const handleFinalizeSale = () => {
    const paid = parseFloat(amountTendered) || 0;

    const saleItems = cart.map((item) => {
      // Calculate item tax share
      const itemSub = item.quantity * item.unitPrice;
      const itemDisc = (itemSub * overallDiscountPercent) / 100;
      const itemTax = ((itemSub - itemDisc) * settings.taxRate) / 100;
      return {
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: itemDisc,
        tax: itemTax,
      };
    });

    const res = createSale({
      customerId: selectedCustomerId,
      warehouseId: selectedWarehouseId,
      saleDate: new Date().toISOString().slice(0, 10),
      items: saleItems,
      paidAmount: paid,
      paymentMethod,
      saleType: 'pos',
      notes: saleNotes,
    });

    if (res.success && res.sale && res.invoice) {
      setCompletedSale({
        sale: res.sale,
        invoice: res.invoice,
        cartSnapshot: [...cart],
        customer: selectedCustomer,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total: totalAmount,
        paid,
        change: Math.max(0, paid - totalAmount),
        paymentMethod,
      });
      clearCart();
    } else {
      showToast(res.error || 'Sale could not be finalized.', 'error');
    }
  };

  const selectedWarehouse = warehouses.find((w) => w.id === selectedWarehouseId);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-slate-100">
      {/* LEFT: Product Catalog & Search (60%) */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 bg-white">
        {/* Top Controls Bar */}
        <div className="p-3 md:p-4 border-b border-slate-200 bg-slate-50 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Warehouse Selector */}
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
              <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                Fulfilling Warehouse:
              </label>
              <select
                value={selectedWarehouseId}
                onChange={(e) => {
                  setSelectedWarehouseId(Number(e.target.value));
                  clearCart();
                }}
                className="text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-500 cursor-pointer"
              >
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} ({wh.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Barcode / Search Box */}
            <div className="flex items-center gap-1.5 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search item, SKU, or Barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBarcodeLookup()}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
              <button
                onClick={handleBarcodeLookup}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap"
                title="Scan Barcode / Enter"
              >
                <Barcode className="w-4 h-4" />
                <span className="hidden sm:inline">Scan</span>
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4">
          {products.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <Search className="w-6 h-6" />
              </div>
              <div className="font-bold text-slate-800 text-sm mb-1">No products in inventory yet</div>
              <p className="text-slate-500 max-w-xs">
                Register inventory items with selling prices to start checking out items at POS.
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Search className="w-8 h-8 mb-2 opacity-50" />
              <span>No products match the selected criteria.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((p) => {
                const stock = getProductStock(p.id);
                const isOutOfStock = stock <= 0;

                return (
                  <button
                    key={p.id}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(p)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all group ${
                      isOutOfStock
                        ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                        : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-sm active:scale-[0.99]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono text-slate-600 tracking-wider">
                          {p.sku}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-700'
                              : stock <= p.minStockLevel
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {stock} {p.unit}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 text-xs line-clamp-2 leading-snug">
                        {p.name}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {settings.currencySymbol}{p.sellingPrice.toFixed(2)}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                        + Add
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Live POS Cart & Checkout Panel (40%) */}
      <div className="w-full md:w-96 lg:w-[420px] bg-slate-50 flex flex-col shrink-0 border-l border-slate-200">
        {/* Customer Header */}
        <div className="p-3 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <User className="w-4 h-4 text-slate-500" />
              <span>Customer:</span>
            </div>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
              className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-1 max-w-[220px] truncate focus:outline-none"
            >
              <option value={0}>Walk-in Customer (Retail)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.customerType})
                </option>
              ))}
            </select>
          </div>

          {selectedCustomer.customerType !== 'retail' && selectedCustomer.creditLimit > 0 && (
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded">
              <span>Credit Limit:</span>
              <span className="font-mono font-bold text-slate-700">
                {settings.currencySymbol}{selectedCustomer.creditLimit.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
              <ShoppingCart className="w-8 h-8 mb-2 opacity-40" />
              <span>Cart is empty</span>
              <span className="text-[11px] text-slate-600 mt-1">
                Click products on the left or scan barcodes
              </span>
            </div>
          ) : (
            cart.map((item) => {
              const lineTotal = item.quantity * item.unitPrice;
              return (
                <div
                  key={item.product.id}
                  className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {item.product.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-600">
                        {settings.currencySymbol}{item.unitPrice.toFixed(2)} / {item.product.unit}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div className="flex items-center border border-slate-200 rounded-md bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 rounded-l"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => setDirectQuantity(item.product.id, e.target.value)}
                        className="w-10 text-center text-xs font-mono font-bold bg-transparent focus:outline-none"
                      />
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 rounded-r"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right font-mono font-bold text-xs text-slate-900">
                      {settings.currencySymbol}{lineTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pricing Summary & Tender Bar */}
        <div className="p-3 bg-white border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono tabular-nums">{settings.currencySymbol}{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span>Order Discount:</span>
              <select
                value={overallDiscountPercent}
                onChange={(e) => setOverallDiscountPercent(Number(e.target.value))}
                className="text-[11px] font-semibold bg-slate-100 rounded px-1.5 py-0.5 border border-slate-300"
              >
                <option value={0}>0%</option>
                <option value={5}>5%</option>
                <option value={10}>10%</option>
                <option value={15}>15%</option>
              </select>
            </div>
            <span className="font-mono tabular-nums text-rose-600">
              -{settings.currencySymbol}{discountAmount.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Tax ({settings.taxRate}%):</span>
            <span className="font-mono tabular-nums">{settings.currencySymbol}{taxAmount.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
            <span>Payable Total:</span>
            <span className="font-mono text-base text-emerald-700 tabular-nums">
              {settings.currencySymbol}{totalAmount.toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleInitiateCheckout}
              disabled={cart.length === 0}
              className="col-span-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>Charge {settings.currencySymbol}{totalAmount.toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CHECKOUT PAYMENT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Payment & Settlement</h3>
                <p className="text-xs text-slate-400">Total Due: {settings.currencySymbol}{totalAmount.toFixed(2)}</p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Payment Methods */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Select Payment Method:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Cash', 'Bank', 'Mobile Money', 'Other'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        paymentMethod === method
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Tendered */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Amount Tendered ({settings.currencySymbol}):
                  </label>
                  <button
                    type="button"
                    onClick={() => setAmountTendered(totalAmount.toFixed(2))}
                    className="text-[11px] text-emerald-600 font-semibold hover:underline"
                  >
                    Exact Amount
                  </button>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                  className="w-full p-2.5 font-mono text-base font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              {/* Change / Remaining computation */}
              {parseFloat(amountTendered) > totalAmount ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-800">Change Due to Customer:</span>
                  <span className="font-mono font-bold text-base text-emerald-700">
                    {settings.currencySymbol}{(parseFloat(amountTendered) - totalAmount).toFixed(2)}
                  </span>
                </div>
              ) : parseFloat(amountTendered) < totalAmount && parseFloat(amountTendered) >= 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-800">Unpaid Balance (Recorded to Customer Debt):</span>
                  <span className="font-mono font-bold text-base text-amber-700">
                    {settings.currencySymbol}{(totalAmount - (parseFloat(amountTendered) || 0)).toFixed(2)}
                  </span>
                </div>
              ) : null}

              {/* Order Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Order Reference / Notes (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Counter #1, Customer PO ref"
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCheckoutOpen(false);
                  handleFinalizeSale();
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
              >
                Complete Sale & Generate Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED SALE RECEIPT MODAL */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">Sale Completed!</span>
              </div>
              <button
                onClick={() => setCompletedSale(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thermal Receipt Body */}
            <div className="p-5 font-mono text-xs bg-white text-slate-800 space-y-3">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <div className="font-bold text-sm text-slate-900">{settings.businessName}</div>
                <div className="text-[11px] text-slate-500">{settings.address}</div>
                <div className="text-[11px] text-slate-500">Tel: {settings.phone}</div>
                <div className="text-[11px] font-bold text-slate-700 mt-1">
                  INVOICE #{completedSale.invoice.invoiceNumber}
                </div>
                <div className="text-[10px] text-slate-500">
                  {completedSale.sale.saleDate} · {completedSale.customer.name}
                </div>
              </div>

              {/* Items */}
              <div className="space-y-1.5 py-1 border-b border-dashed border-slate-300 text-[11px]">
                {completedSale.cartSnapshot.map((item: CartItem, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span className="truncate pr-2">
                      {item.quantity}x {item.product.name}
                    </span>
                    <span className="tabular-nums font-semibold shrink-0">
                      {settings.currencySymbol}{(item.quantity * item.unitPrice).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="tabular-nums">{settings.currencySymbol}{completedSale.subtotal.toFixed(2)}</span>
                </div>
                {completedSale.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount:</span>
                    <span className="tabular-nums">-{settings.currencySymbol}{completedSale.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax ({settings.taxRate}%):</span>
                  <span className="tabular-nums">{settings.currencySymbol}{completedSale.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total:</span>
                  <span className="tabular-nums">{settings.currencySymbol}{completedSale.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1">
                  <span>Paid ({completedSale.paymentMethod}):</span>
                  <span className="tabular-nums">{settings.currencySymbol}{completedSale.paid.toFixed(2)}</span>
                </div>
                {completedSale.change > 0 && (
                  <div className="flex justify-between font-semibold text-emerald-700">
                    <span>Change:</span>
                    <span className="tabular-nums">{settings.currencySymbol}{completedSale.change.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Barcode & Footer note */}
              <div className="pt-3 text-center border-t border-dashed border-slate-300 space-y-2">
                <BarcodeSvg value={completedSale.invoice.invoiceNumber} height={40} />
                <p className="text-[10px] text-slate-500 italic leading-tight">
                  {settings.receiptFooterNote}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setCompletedSale(null)}
                className="py-2 px-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

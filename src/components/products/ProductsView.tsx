import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Product } from '../../types/inventory';
import { BarcodeSvg } from '../common/BarcodeSvg';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Building2,
  Barcode,
  Layers,
  X,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const {
    products,
    categories,
    brands,
    suppliers,
    warehouses,
    warehouseStock,
    settings,
    addProduct,
    updateProduct,
    deleteProduct,
    showToast,
    hasPermission,
  } = useInventory();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'low_stock'>('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    description: '',
    categoryId: categories[0]?.id || 1,
    brandId: brands[0]?.id || 1,
    defaultSupplierId: suppliers[0]?.id || 1,
    purchasePrice: 0,
    sellingPrice: 0,
    wholesalePrice: 0,
    minStockLevel: 10,
    unit: 'pcs',
    status: 'active' as Product['status'],
    initialStock: warehouses.map((wh) => ({ warehouseId: wh.id, qty: 0 })),
  });

  // Calculate total stock for any product across warehouses
  const getTotalStock = (productId: number) => {
    return warehouseStock
      .filter((ws) => ws.productId === productId)
      .reduce((sum, ws) => sum + ws.quantity, 0);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const totalStock = getTotalStock(p.id);
      if (statusFilter === 'active' && p.status !== 'active') return false;
      if (statusFilter === 'inactive' && p.status !== 'inactive') return false;
      if (statusFilter === 'low_stock' && totalStock > p.minStockLevel) return false;

      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
      if (selectedBrand !== 'all' && p.brandId !== selectedBrand) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesBarcode = p.barcode && p.barcode.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesBarcode) return false;
      }
      return true;
    });
  }, [products, warehouseStock, statusFilter, selectedCategory, selectedBrand, searchQuery]);

  // Open Edit Form
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      barcode: p.barcode || '',
      name: p.name,
      description: p.description || '',
      categoryId: p.categoryId,
      brandId: p.brandId || brands[0]?.id || 1,
      defaultSupplierId: p.defaultSupplierId || suppliers[0]?.id || 1,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      wholesalePrice: p.wholesalePrice,
      minStockLevel: p.minStockLevel,
      unit: p.unit,
      status: p.status,
      initialStock: [],
    });
    setIsCreateOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    const nextSku = `SKU-${Date.now().toString().slice(-4)}`;
    const nextBarcode = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    setFormData({
      sku: nextSku,
      barcode: nextBarcode,
      name: '',
      description: '',
      categoryId: categories[0]?.id || 1,
      brandId: brands[0]?.id || 1,
      defaultSupplierId: suppliers[0]?.id || 0,
      purchasePrice: 0,
      sellingPrice: 0,
      wholesalePrice: 0,
      minStockLevel: 10,
      unit: 'pcs',
      status: 'active',
      initialStock: warehouses.map((wh) => ({ warehouseId: wh.id, qty: 0 })),
    });
    setIsCreateOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }
    if (!formData.sku.trim()) {
      showToast('SKU is required', 'error');
      return;
    }

    if (editingProduct) {
      const res = updateProduct(editingProduct.id, {
        sku: formData.sku,
        barcode: formData.barcode,
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        defaultSupplierId: formData.defaultSupplierId,
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        wholesalePrice: Number(formData.wholesalePrice),
        minStockLevel: Number(formData.minStockLevel),
        unit: formData.unit,
        status: formData.status,
      });
      if (res.success) {
        setIsCreateOpen(false);
      } else {
        showToast(res.error || 'Failed to update product', 'error');
      }
    } else {
      const res = addProduct(
        {
          sku: formData.sku,
          barcode: formData.barcode,
          name: formData.name,
          description: formData.description,
          categoryId: formData.categoryId,
          brandId: formData.brandId,
          defaultSupplierId: formData.defaultSupplierId,
          purchasePrice: Number(formData.purchasePrice),
          sellingPrice: Number(formData.sellingPrice),
          wholesalePrice: Number(formData.wholesalePrice),
          minStockLevel: Number(formData.minStockLevel),
          unit: formData.unit,
          status: formData.status,
        },
        formData.initialStock
      );
      if (res.success) {
        setIsCreateOpen(false);
      } else {
        showToast(res.error || 'Failed to create product', 'error');
      }
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product? Historical constraints will be checked.')) {
      const res = deleteProduct(id);
      if (!res.success) {
        showToast(res.error || 'Could not delete product', 'error');
      }
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Product Catalog & Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage SKU identifiers, barcodes, prices, and multi-warehouse balances
          </p>
        </div>

        {hasPermission('products.create') && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Product Name, SKU, or Barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
            <option value="low_stock">⚠️ Low Stock Alerts</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Product / SKU</th>
                <th className="py-3 px-4">Category & Brand</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-center">Total Stock</th>
                <th className="py-3 px-4 text-center">Min Level</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                        <Package className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-slate-900 text-sm mb-1">
                        {products.length === 0 ? 'No products registered yet' : 'No matching products found'}
                      </div>
                      <p className="text-xs text-slate-500 max-w-sm mb-4">
                        {products.length === 0
                          ? 'Add your first inventory product with SKU, barcode, unit cost, and selling price.'
                          : 'Try adjusting your search query or filter options.'}
                      </p>
                      <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Product</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const category = categories.find((c) => c.id === product.categoryId);
                  const brand = brands.find((b) => b.id === product.brandId);
                  const totalStock = getTotalStock(product.id);
                  const isLow = totalStock <= product.minStockLevel;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 leading-tight">
                          {product.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{product.sku}</span>
                          {product.barcode && (
                            <>
                              <span>·</span>
                              <span className="text-slate-400">{product.barcode}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800">{category?.name || '—'}</div>
                        <div className="text-[11px] text-slate-400">{brand?.name || '—'}</div>
                      </td>

                      {/* Cost Price */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                        {settings.currencySymbol}{product.purchasePrice.toFixed(2)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {settings.currencySymbol}{product.sellingPrice.toFixed(2)}
                      </td>

                      {/* Total Stock */}
                      <td className="py-3 px-4 text-center font-mono tabular-nums">
                        <span
                          className={`inline-block font-bold px-2 py-0.5 rounded ${
                            isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {totalStock} {product.unit}
                        </span>
                      </td>

                      {/* Min Level */}
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-500">
                        {product.minStockLevel} {product.unit}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                            product.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingProduct(product)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="View Stock Breakdown & Barcode"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {hasPermission('products.update') && (
                            <button
                              onClick={() => handleOpenEdit(product)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                              title="Edit Product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {hasPermission('products.delete') && (
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing {filteredProducts.length} of {products.length} products</span>
          <span>Quantities tracked across all registered warehouses</span>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingProduct ? 'Edit Product Record' : 'Create New Inventory Product'}
                </h3>
                <p className="text-xs text-slate-400">Single organization master product catalog</p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SKU */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SKU (Unique Identifier)*</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-500 font-mono"
                  />
                </div>

                {/* Barcode */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Barcode (EAN/UPC)</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-500 font-mono"
                  />
                </div>

                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Product Name*</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-500 font-semibold"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category*</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Brand</label>
                  <select
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Default Supplier */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Default Supplier</label>
                  <select
                    value={formData.defaultSupplierId}
                    onChange={(e) => setFormData({ ...formData, defaultSupplierId: Number(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value={0}>None / Unassigned (Optional)</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.company} ({s.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Inventory Unit*</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="pcs, boxes, pairs, kg, meters"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>

                {/* Pricing Tiers */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Purchase Cost Price ($)*</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Selling Retail Price ($)*</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Wholesale Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.wholesalePrice}
                    onChange={(e) => setFormData({ ...formData, wholesalePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Minimum Stock Alert Level</label>
                  <input
                    type="number"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>
              </div>

              {/* Initial Stock Allocation (only during creation) */}
              {!editingProduct && (
                <div className="pt-3 border-t border-slate-200">
                  <label className="font-bold text-slate-900 block mb-1">
                    Initial Stock Count by Warehouse (Optional Opening Stock)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {warehouses.map((wh, idx) => (
                      <div key={wh.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="font-semibold text-slate-800 text-[11px] mb-1">{wh.name}</div>
                        <input
                          type="number"
                          min="0"
                          placeholder="Quantity"
                          value={formData.initialStock[idx]?.qty || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            const updated = [...formData.initialStock];
                            updated[idx] = { warehouseId: wh.id, qty: val };
                            setFormData({ ...formData, initialStock: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono text-xs font-bold"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PRODUCT DETAIL & WAREHOUSE BREAKDOWN MODAL */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{viewingProduct.name}</h3>
                <p className="text-xs text-slate-400">SKU: {viewingProduct.sku}</p>
              </div>
              <button onClick={() => setViewingProduct(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Barcode display */}
              {viewingProduct.barcode && (
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <BarcodeSvg value={viewingProduct.barcode} width={200} height={50} />
                </div>
              )}

              {/* Pricing Cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Cost Price</span>
                  <span className="font-mono font-bold text-sm text-slate-800">
                    {settings.currencySymbol}{viewingProduct.purchasePrice.toFixed(2)}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Retail Price</span>
                  <span className="font-mono font-bold text-sm text-emerald-700">
                    {settings.currencySymbol}{viewingProduct.sellingPrice.toFixed(2)}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Wholesale</span>
                  <span className="font-mono font-bold text-sm text-slate-800">
                    {settings.currencySymbol}{viewingProduct.wholesalePrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Warehouse Stock Matrix */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span>Warehouse Stock Balances</span>
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {warehouses.map((wh) => {
                    const ws = warehouseStock.find(
                      (s) => s.warehouseId === wh.id && s.productId === viewingProduct.id
                    );
                    const qty = ws ? ws.quantity : 0;
                    return (
                      <div key={wh.id} className="p-2.5 flex items-center justify-between bg-white hover:bg-slate-50">
                        <div>
                          <div className="font-semibold text-slate-800">{wh.name}</div>
                          <div className="text-[10px] text-slate-400">{wh.location}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-sm text-slate-900">
                            {qty} {viewingProduct.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setViewingProduct(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

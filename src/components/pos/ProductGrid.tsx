import React, { useState, useRef, useEffect } from 'react';
import { Search, Barcode, Package } from 'lucide-react';
import clsx from 'clsx';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { useCartStore } from '../../store/cartStore';
import { productsApi } from '../../api/products';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/currency';
import Spinner from '../ui/Spinner';

const ProductGrid: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const addItem = useCartStore((s) => s.addItem);

  const { data: categoriesData, isLoading: catsLoading } = useCategories();
  const { data: productsData, isLoading: prodsLoading } = useProducts({
    search: search || undefined,
    category: selectedCategory || undefined,
    status: 'active',
  });

  const categories = categoriesData || [];
  const products = productsData?.results || [];

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const handleBarcodeSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const barcode = (e.target as HTMLInputElement).value.trim();
      if (!barcode) return;
      try {
        const product = await productsApi.byBarcode(barcode);
        addItem(product);
        (e.target as HTMLInputElement).value = '';
      } catch {
        // not found
      }
    }
  };

  const handleProductClick = (product: Product) => {
    if (product.status === 'out_of_stock') return;
    addItem(product);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Barcode input */}
      <div className="mb-3">
        <div className="relative">
          <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            ref={barcodeRef}
            type="text"
            placeholder="Scan barcode or press Enter..."
            onKeyDown={handleBarcodeSearch}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        <button
          onClick={() => setSelectedCategory(null)}
          className={clsx(
            'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            selectedCategory === null
              ? 'bg-primary text-white'
              : 'bg-white text-text-secondary hover:bg-primary-50 border border-gray-200'
          )}
        >
          All
        </button>
        {!catsLoading &&
          categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={clsx(
                'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                selectedCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-white text-text-secondary hover:bg-primary-50 border border-gray-200'
              )}
            >
              {cat.name}
            </button>
          ))}
      </div>

      {/* Products grid */}
      <div className="flex-1 overflow-y-auto">
        {prodsLoading ? (
          <div className="flex items-center justify-center h-40">
            <Spinner />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                disabled={product.status === 'out_of_stock'}
                className={clsx(
                  'relative flex flex-col bg-white rounded-xl border border-gray-100 p-3 text-left transition-all duration-150',
                  product.status === 'out_of_stock'
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-secondary hover:shadow-card-hover cursor-pointer active:scale-95'
                )}
              >
                {/* Image placeholder */}
                <div className="w-full aspect-square rounded-lg bg-primary-50 flex items-center justify-center mb-2 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">🍫</span>
                  )}
                </div>
                <p className="text-xs font-medium text-text-primary line-clamp-2 leading-tight">
                  {product.name}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">{product.sku}</p>
                <p className="text-sm font-bold text-secondary mt-1">
                  {formatCurrency(product.price)}
                </p>
                {product.stock_quantity <= product.low_stock_threshold && product.status !== 'out_of_stock' && (
                  <span className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">
                    Low
                  </span>
                )}
                {product.status === 'out_of_stock' && (
                  <span className="absolute top-2 right-2 bg-red-100 text-danger text-xs px-1.5 py-0.5 rounded-full">
                    Out
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;

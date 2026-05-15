import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package, AlertTriangle, LayoutGrid, List } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Card from '../components/ui/Card';
import Table, { Column } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import {
  useProducts,
  useCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useAdjustStock,
} from '../hooks/useProducts';
import { formatCurrency } from '../utils/currency';
import { Product } from '../types';
import clsx from 'clsx';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  category: z.coerce.number().min(1, 'Category is required'),
  price: z.coerce.number().positive('Price must be positive'),
  cost_price: z.coerce.number().min(0).optional(),
  stock_quantity: z.coerce.number().int().min(0),
  low_stock_threshold: z.coerce.number().int().min(0),
  status: z.enum(['active', 'inactive', 'out_of_stock']),
  description: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

const ProductsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [stockModal, setStockModal] = useState<Product | null>(null);
  const [stockMovement, setStockMovement] = useState<'in' | 'out' | 'adjustment'>('in');
  const [stockQty, setStockQty] = useState(0);
  const [stockNotes, setStockNotes] = useState('');

  const { data: productsData, isLoading } = useProducts({
    search: search || undefined,
    category: categoryFilter ? parseInt(categoryFilter) : undefined,
    status: statusFilter || undefined,
  });
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProductMut = useDeleteProduct();
  const adjustStock = useAdjustStock();

  const products = productsData?.results || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { status: 'active', stock_quantity: 0, low_stock_threshold: 5 },
  });

  const openCreate = () => {
    reset({ status: 'active', stock_quantity: 0, low_stock_threshold: 5, price: 0 });
    setEditProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    reset({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || '',
      category: product.category,
      price: product.price,
      cost_price: product.cost_price || 0,
      stock_quantity: product.stock_quantity,
      low_stock_threshold: product.low_stock_threshold,
      status: product.status,
      description: product.description || '',
    });
    setEditProduct(product);
    setModalOpen(true);
  };

  const onSubmit = async (data: ProductForm) => {
    if (editProduct) {
      await updateProduct.mutateAsync({ id: editProduct.id, data });
    } else {
      await createProduct.mutateAsync(data);
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    await deleteProductMut.mutateAsync(deleteProduct.id);
    setDeleteProduct(null);
  };

  const handleStockAdjust = async () => {
    if (!stockModal) return;
    await adjustStock.mutateAsync({
      id: stockModal.id,
      movement_type: stockMovement,
      quantity: stockQty,
      notes: stockNotes,
    });
    setStockModal(null);
    setStockQty(0);
    setStockNotes('');
  };

  const categoryOptions = (categories || []).map((c) => ({ value: c.id, label: c.name }));
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'out_of_stock', label: 'Out of Stock' },
  ];

  const tableColumns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {row.image ? (
              <img src={row.image} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-4 h-4 text-primary-300" />
            )}
          </div>
          <div>
            <p className="font-medium text-text-primary text-sm">{row.name}</p>
            <p className="text-xs text-text-secondary">{row.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category_name',
      header: 'Category',
      render: (row) => row.category_name || '-',
    },
    {
      key: 'price',
      header: 'Price',
      render: (row) => <span className="font-semibold">{formatCurrency(row.price)}</span>,
    },
    {
      key: 'stock_quantity',
      header: 'Stock',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <span className={clsx('font-medium', row.stock_quantity <= row.low_stock_threshold ? 'text-amber-600' : 'text-text-primary')}>
            {row.stock_quantity}
          </span>
          {row.stock_quantity <= row.low_stock_threshold && row.status !== 'out_of_stock' && (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          variant={
            row.status === 'active' ? 'success' : row.status === 'out_of_stock' ? 'danger' : 'default'
          }
        >
          {row.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setStockModal(row); }}
            className="px-2 py-1 text-xs bg-primary-50 text-primary rounded-lg hover:bg-primary-100 transition-colors"
          >
            Stock
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(row); }}
            className="p-1.5 rounded-lg hover:bg-primary-50 text-text-secondary hover:text-primary transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteProduct(row); }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-text-secondary hover:text-danger transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <Input
              label="Search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-44">
            <Select
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={categoryOptions}
              placeholder="All Categories"
            />
          </div>
          <div className="w-40">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
              placeholder="All Statuses"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={clsx('p-2 rounded-lg border transition-colors', viewMode === 'table' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-text-secondary hover:bg-gray-50')}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={clsx('p-2 rounded-lg border transition-colors', viewMode === 'grid' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-text-secondary hover:bg-gray-50')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Add Product
          </Button>
        </div>
      </Card>

      {/* Content */}
      {isLoading ? (
        <Spinner className="py-16" />
      ) : viewMode === 'table' ? (
        <Card padding={false}>
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-text-primary">Products ({productsData?.count || 0})</h2>
          </div>
          <Table
            columns={tableColumns}
            data={products}
            keyExtractor={(row) => row.id}
            onRowClick={(row) => openEdit(row)}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <Card key={product.id} hover onClick={() => openEdit(product)}>
              <div className="aspect-square rounded-lg bg-primary-50 flex items-center justify-center mb-3 overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-primary-300" />
                )}
              </div>
              <p className="font-medium text-text-primary text-sm truncate">{product.name}</p>
              <p className="text-xs text-text-secondary">{product.sku}</p>
              <p className="font-bold text-secondary mt-1">{formatCurrency(product.price)}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-text-secondary">Stock: {product.stock_quantity}</span>
                <Badge variant={product.status === 'active' ? 'success' : 'danger'}>
                  {product.status.replace('_', ' ')}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editProduct ? 'Edit Product' : 'Add Product'}
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
              {editProduct ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form className="grid grid-cols-2 gap-4">
          <Input label="Product Name" error={errors.name?.message} {...register('name')} />
          <Input label="SKU" error={errors.sku?.message} {...register('sku')} />
          <Input label="Barcode" {...register('barcode')} />
          <Select
            label="Category"
            error={errors.category?.message}
            options={categoryOptions}
            placeholder="Select Category"
            {...register('category')}
          />
          <Input label="Price (MMK)" type="number" error={errors.price?.message} {...register('price')} />
          <Input label="Cost Price (MMK)" type="number" {...register('cost_price')} />
          <Input label="Stock Quantity" type="number" {...register('stock_quantity')} />
          <Input label="Low Stock Threshold" type="number" {...register('low_stock_threshold')} />
          <Select
            label="Status"
            options={statusOptions}
            error={errors.status?.message}
            {...register('status')}
          />
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Product description..."
            />
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        title="Delete Product"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteProduct(null)}>Cancel</Button>
            <Button variant="danger" loading={deleteProductMut.isPending} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-text-secondary">
          Are you sure you want to delete <span className="font-semibold text-text-primary">{deleteProduct?.name}</span>? This action cannot be undone.
        </p>
      </Modal>

      {/* Stock Adjust Modal */}
      <Modal
        open={!!stockModal}
        onClose={() => setStockModal(null)}
        title={`Adjust Stock — ${stockModal?.name}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setStockModal(null)}>Cancel</Button>
            <Button loading={adjustStock.isPending} onClick={handleStockAdjust}>Adjust</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Current stock: <span className="font-semibold text-text-primary">{stockModal?.stock_quantity}</span>
          </p>
          <Select
            label="Movement Type"
            value={stockMovement}
            onChange={(e) => setStockMovement(e.target.value as 'in' | 'out' | 'adjustment')}
            options={[
              { value: 'in', label: 'Stock In' },
              { value: 'out', label: 'Stock Out' },
              { value: 'adjustment', label: 'Adjustment' },
            ]}
          />
          <Input
            label="Quantity"
            type="number"
            min="1"
            value={stockQty}
            onChange={(e) => setStockQty(parseInt(e.target.value) || 0)}
          />
          <Input
            label="Notes"
            value={stockNotes}
            onChange={(e) => setStockNotes(e.target.value)}
            placeholder="Reason for adjustment..."
          />
        </div>
      </Modal>
    </div>
  );
};

export default ProductsPage;

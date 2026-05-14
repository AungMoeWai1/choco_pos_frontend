import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import {
  useCategories,
  useProductTypes,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../hooks/useProducts';
import { Category } from '../types';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

type CategoryForm = z.infer<typeof categorySchema>;

const CategoriesPage: React.FC = () => {
  const { data: categories, isLoading } = useCategories();
  const { data: productTypes } = useProductTypes();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { is_active: true },
  });

  const openCreate = () => {
    reset({ is_active: true });
    setEditCat(null);
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    reset({
      name: cat.name,
      description: cat.description || '',
      is_active: cat.is_active,
    });
    setEditCat(cat);
    setModalOpen(true);
  };

  const onSubmit = async (data: CategoryForm) => {
    if (editCat) {
      await updateCategory.mutateAsync({ id: editCat.id, data });
    } else {
      await createCategory.mutateAsync(data);
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteCat) return;
    await deleteCategory.mutateAsync(deleteCat.id);
    setDeleteCat(null);
  };

  if (isLoading) {
    return <Spinner className="py-16" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-text-primary">
          Categories ({categories?.length || 0})
        </h2>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {(categories || []).map((cat) => (
          <Card key={cat.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-primary truncate">{cat.name}</h3>
                {cat.description && (
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{cat.description}</p>
                )}
                {cat.product_type_name && (
                  <p className="text-xs text-text-secondary mt-1">Type: {cat.product_type_name}</p>
                )}
                <div className="mt-2">
                  <Badge variant={cat.is_active ? 'success' : 'default'}>
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1.5 rounded-lg hover:bg-primary-50 text-text-secondary hover:text-primary transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteCat(cat)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-text-secondary hover:text-danger transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Product Types section */}
      {productTypes && productTypes.length > 0 && (
        <Card>
          <h3 className="font-semibold text-text-primary mb-3">Product Types</h3>
          <div className="flex flex-wrap gap-2">
            {productTypes.map((pt) => (
              <span key={pt.id} className="px-3 py-1.5 bg-primary-50 text-primary text-sm rounded-lg font-medium">
                {pt.name}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCat ? 'Edit Category' : 'Add Category'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
              {editCat ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Category Name"
            error={errors.name?.message}
            {...register('name')}
            placeholder="e.g., Dark Chocolate"
          />
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Category description..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="is_active" className="text-sm text-text-primary">Active</label>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleteCat}
        onClose={() => setDeleteCat(null)}
        title="Delete Category"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteCat(null)}>Cancel</Button>
            <Button variant="danger" loading={deleteCategory.isPending} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-text-secondary">
          Are you sure you want to delete <span className="font-semibold text-text-primary">{deleteCat?.name}</span>?
        </p>
      </Modal>
    </div>
  );
};

export default CategoriesPage;

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { imageUrl } from '../api/products';
import {
  useCategories,
  useCreateProduct,
  useDeleteImage,
  useDeleteProduct,
  useSellerProducts,
  useUploadImage,
  type SellerProduct,
} from '../api/sellerProducts';
import EditProductForm from '../components/EditProductForm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Pagination } from '../components/ui/Pagination';
import { Skeleton } from '../components/ui/Skeleton';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { i18n } from '../i18n/es';
import { formatMoney } from '../lib/formatters';
import { ApiError } from '../lib/http';
import {
  Plus,
  Package,
  Trash2,
  Edit2,
  Upload,
  AlertCircle,
  Tag,
} from 'lucide-react';

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : i18n.common.error;
}

function CreateProductForm({ onDone }: { onDone: () => void }) {
  const categories = useCategories();
  const create = useCreateProduct();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [variantName, setVariantName] = useState('Estándar');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');

  function submit(event: FormEvent) {
    event.preventDefault();
    const cents = Math.round(Number(price) * 100);
    create.mutate(
      {
        categoryId,
        title: title.trim(),
        description: description.trim(),
        variantName: variantName.trim() || 'Estándar',
        price: cents,
        stock: Number(stock),
      },
      { onSuccess: onDone },
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Input
        label="Título del producto"
        placeholder="Ej. Mochila Antirrobo Impermeable con Candado TSA"
        value={title}
        required
        minLength={3}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Textarea
        label="Descripción completa (mínimo 10 caracteres)"
        rows={3}
        placeholder="Describe materiales, especificaciones técnicas y características del artículo..."
        value={description}
        required
        minLength={10}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Select
        label="Categoría del producto"
        value={categoryId}
        required
        onChange={(e) => setCategoryId(e.target.value)}
      >
        <option value="">Selecciona una categoría</option>
        {categories.data?.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <Input
          label="Nombre de variante inicial"
          value={variantName}
          required
          onChange={(e) => setVariantName(e.target.value)}
        />

        <Input
          label="Precio (S/.)"
          type="number"
          min="0.01"
          step="0.01"
          value={price}
          required
          placeholder="0.00"
          onChange={(e) => setPrice(e.target.value)}
        />

        <Input
          label="Stock inicial"
          type="number"
          min="0"
          step="1"
          value={stock}
          required
          onChange={(e) => setStock(e.target.value)}
        />
      </div>

      {create.isError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-soft text-danger border border-danger/30 text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage(create.error)}</span>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-3 border-t border-line/60">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          {i18n.common.cancel}
        </Button>
        <Button type="submit" size="sm" isLoading={create.isPending} className="font-semibold px-5">
          {i18n.common.save}
        </Button>
      </div>
    </form>
  );
}

function ProductRow({ product }: { product: SellerProduct }) {
  const upload = useUploadImage();
  const removeImage = useDeleteImage();
  const removeProduct = useDeleteProduct();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) upload.mutate({ productId: product.id, file });
  }

  const error = upload.error ?? removeImage.error ?? removeProduct.error;

  return (
    <Card padding="md" className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line/60">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-brand border border-line">
            <Package className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-semibold text-sm text-ink">{product.title}</h2>
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <span>{product.category?.name ?? 'Sin categoría'}</span>
              <span>·</span>
              <StatusBadge status={product.status} category="product" size="sm" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="secondary" size="sm" className="h-8 text-xs px-2.5" onClick={() => setEditing(true)}>
            <Edit2 className="h-3.5 w-3.5 mr-1" />
            {i18n.common.edit}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs px-2 text-danger hover:bg-danger-soft"
            isLoading={removeProduct.isPending}
            onClick={() => setConfirmingDelete(true)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            {i18n.common.delete}
          </Button>
        </div>
      </header>

      {/* Variantes y Precios */}
      <div className="flex flex-col gap-1.5 text-xs">
        <span className="font-semibold text-ink-muted text-xs uppercase tracking-wider">
          Variantes registradas:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {product.variants.map((variant) => (
            <div
              key={variant.id}
              className="flex items-center justify-between p-2 rounded-lg bg-surface-2 border border-line/60"
            >
              <span className="font-medium text-ink">{variant.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-brand tabular">{formatMoney(variant.price)}</span>
                <span className="text-xs text-ink-muted bg-surface px-1.5 py-0.5 rounded border border-line/40">
                  Stock: {variant.stock}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Galería de Imágenes y Subida */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-line/40">
        {product.images.map((image) => (
          <div key={image.id} className="relative group">
            <img
              src={imageUrl(image.fileName)}
              alt={`Fotografía de ${product.title}`}
              loading="lazy"
              decoding="async"
              className={`h-16 w-16 rounded-lg object-cover border border-line bg-surface-2 ${
                image.isMain ? 'ring-2 ring-brand' : ''
              }`}
            />
            <button
              type="button"
              aria-label="Quitar imagen"
              disabled={removeImage.isPending}
              onClick={() => removeImage.mutate({ productId: product.id, imageId: image.id })}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-surface text-xs text-danger shadow hover:bg-danger-soft transition-colors"
            >
              ×
            </button>
          </div>
        ))}

        <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line text-center text-xs text-ink-muted hover:border-brand hover:text-brand transition-colors bg-surface-2/30">
          <Upload className="h-4 w-4 mb-0.5" />
          <span>{upload.isPending ? '...' : '+ Foto'}</span>
          <input
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            disabled={upload.isPending}
            onChange={handleFile}
          />
        </label>
      </div>

      {error && (
        <p className="text-xs text-danger flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{errorMessage(error)}</span>
        </p>
      )}

      <Modal isOpen={editing} onClose={() => setEditing(false)} title={`Editar: ${product.title}`} size="lg">
        <EditProductForm key={product.id} product={product} onDone={() => setEditing(false)} />
      </Modal>

      <Modal
        isOpen={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        title="Eliminar Producto"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs text-ink-muted leading-relaxed">
            ¿Estás seguro de que deseas eliminar definitivamente el producto{' '}
            <strong className="text-ink">"{product.title}"</strong>? Esta acción no se puede deshacer y retirará el catálogo de la plataforma.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-line/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingDelete(false)}
            >
              {i18n.common.cancel}
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={removeProduct.isPending}
              onClick={() => {
                removeProduct.mutate(product.id, {
                  onSuccess: () => setConfirmingDelete(false),
                });
              }}
            >
              {i18n.common.delete}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

export default function SellerProductsPage() {
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const { data, isLoading, isError, error, refetch } = useSellerProducts(page);
  const meta = data?.meta;
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <PageHeader
        title={i18n.seller.myProducts}
        description="Publica y gestiona el inventario de artículos de tu comercio verificado."
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Panel de Vendedor' },
          { label: 'Mis Productos' },
        ]}
        actions={
          <Button size="sm" variant="primary" onClick={() => setCreating(true)} className="gap-1.5 font-semibold">
            <Plus className="h-4 w-4" />
            <span>{i18n.seller.addProduct}</span>
          </Button>
        }
      />

      <Modal isOpen={creating} onClose={() => setCreating(false)} title={i18n.seller.addProduct} size="md">
        <CreateProductForm onDone={() => setCreating(false)} />
      </Modal>

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton variant="block" className="h-32 w-full" />
          <Skeleton variant="block" className="h-32 w-full" />
        </div>
      )}

      {isError && (
        <ErrorState
          title="Error al consultar tus productos"
          description={errorMessage(error)}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          icon={<Tag className="h-8 w-8" />}
          title="Sin productos publicados"
          description="Aún no has publicado productos en tu catálogo comercial. Comienza publicando el primero."
          actionLabel={i18n.seller.addProduct}
          onAction={() => setCreating(true)}
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {data.items.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </div>

          {meta && lastPage > 1 && (
            <div className="pt-2 border-t border-line/40">
              <Pagination
                page={page}
                totalPages={lastPage}
                totalItems={meta.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

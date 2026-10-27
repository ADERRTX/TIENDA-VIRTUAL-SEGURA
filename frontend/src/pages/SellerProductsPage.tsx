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
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { i18n } from '../i18n/es';
import { formatMoney } from '../lib/formatters';
import { ApiError } from '../lib/http';

const inputClass =
  'w-full min-h-[44px] rounded-xl border border-line bg-bg px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

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
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Título
        <input className={inputClass} value={title} required minLength={3} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Descripción (mínimo 10 caracteres)
        <textarea
          className={`${inputClass} py-2`}
          rows={3}
          value={description}
          required
          minLength={10}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Categoría
        <select className={inputClass} value={categoryId} required onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Selecciona una categoría</option>
          {categories.data?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Nombre de la variante
        <input className={inputClass} value={variantName} required onChange={(e) => setVariantName(e.target.value)} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Precio (S/)
          <input
            type="number"
            min="0.01"
            step="0.01"
            className={inputClass}
            value={price}
            required
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Stock
          <input
            type="number"
            min="0"
            step="1"
            className={inputClass}
            value={stock}
            required
            onChange={(e) => setStock(e.target.value)}
          />
        </label>
      </div>
      {create.isError && <p className="text-sm text-red-400">{errorMessage(create.error)}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onDone}>
          {i18n.common.cancel}
        </Button>
        <Button type="submit" size="sm" isLoading={create.isPending}>
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

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) upload.mutate({ productId: product.id, file });
  }

  function handleDelete() {
    if (window.confirm(`¿Eliminar "${product.title}"?`)) {
      removeProduct.mutate(product.id);
    }
  }

  const error = upload.error ?? removeImage.error ?? removeProduct.error;

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-2 p-5">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-bold">{product.title}</h2>
          <p className="text-xs text-ink-muted">
            {product.category?.name ?? 'Sin categoría'} · {product.status}
          </p>
        </div>
        <Button variant="ghost" size="sm" isLoading={removeProduct.isPending} onClick={handleDelete}>
          {i18n.common.delete}
        </Button>
      </header>

      <ul className="flex flex-col gap-1 text-sm">
        {product.variants.map((variant) => (
          <li key={variant.id} className="flex justify-between gap-4">
            <span>{variant.name}</span>
            <span>
              {formatMoney(variant.price)} · stock {variant.stock}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-3">
        {product.images.map((image) => (
          <div key={image.id} className="relative">
            <img
              src={imageUrl(image.fileName)}
              alt={product.title}
              className={`h-20 w-20 rounded-xl object-cover ${image.isMain ? 'ring-2 ring-brand' : ''}`}
            />
            <button
              type="button"
              aria-label="Quitar imagen"
              disabled={removeImage.isPending}
              onClick={() => removeImage.mutate({ productId: product.id, imageId: image.id })}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-bg text-xs text-ink shadow border border-line"
            >
              ×
            </button>
          </div>
        ))}

        <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line text-center text-xs text-ink-muted hover:border-brand">
          {upload.isPending ? 'Subiendo...' : '+ Imagen'}
          <input
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            disabled={upload.isPending}
            onChange={handleFile}
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-400">{errorMessage(error)}</p>}
    </article>
  );
}

export default function SellerProductsPage() {
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const { data, isLoading, isError, error, refetch } = useSellerProducts(page);
  const meta = data?.meta;
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1;

  return (
    <section className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{i18n.seller.myProducts}</h1>
        <Button size="sm" onClick={() => setCreating(true)}>
          {i18n.seller.addProduct}
        </Button>
      </div>

      <Modal isOpen={creating} onClose={() => setCreating(false)} title={i18n.seller.addProduct}>
        <CreateProductForm onDone={() => setCreating(false)} />
      </Modal>

      {isLoading && <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />}

      {isError && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface-2 p-5">
          <p className="text-ink-muted">{errorMessage(error)}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            {i18n.common.retry}
          </Button>
        </div>
      )}

      {data && data.items.length === 0 && (
        <p className="text-ink-muted">Aún no tienes productos publicados.</p>
      )}

      {data?.items.map((product) => <ProductRow key={product.id} product={product} />)}

      {meta && lastPage > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-ink-muted">
            Página {page} de {lastPage}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>
            Siguiente
          </Button>
        </div>
      )}
    </section>
  );
}
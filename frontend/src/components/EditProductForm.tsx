import { useState, type FormEvent } from 'react';
import {
  useCreateVariant,
  useUpdateProduct,
  useUpdateVariant,
  type SellerProduct,
  type SellerProductVariant,
} from '../api/sellerProducts';
import { i18n } from '../i18n/es';
import { ApiError } from '../lib/http';
import { Button } from './ui/Button';

const inputClass =
  'w-full min-h-[44px] rounded-xl border border-line bg-bg px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : i18n.common.error;
}

function VariantEditor({ productId, variant }: { productId: string; variant: SellerProductVariant }) {
  const [name, setName] = useState(variant.name);
  const [price, setPrice] = useState((variant.price / 100).toFixed(2));
  const [stock, setStock] = useState(String(variant.stock));
  const update = useUpdateVariant();

  function save() {
    update.mutate({
      productId,
      variantId: variant.id,
      data: { name: name.trim(), price: Math.round(Number(price) * 100), stock: Number(stock) },
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line p-3">
      <div className="grid grid-cols-3 gap-2">
        <input className={inputClass} aria-label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={inputClass} aria-label="Precio (S/)" type="number" min="0.01" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input className={inputClass} aria-label="Stock" type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} />
      </div>
      {update.isError && <p className="text-sm text-red-400">{errorMessage(update.error)}</p>}
      {update.isSuccess && <p className="text-xs text-brand">Guardado.</p>}
      <Button size="sm" variant="secondary" className="self-start" isLoading={update.isPending} onClick={save}>
        {i18n.common.save}
      </Button>
    </div>
  );
}

function NewVariant({ productId }: { productId: string }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const create = useCreateVariant();

  function submit(event: FormEvent) {
    event.preventDefault();
    create.mutate(
      { productId, data: { name: name.trim(), price: Math.round(Number(price) * 100), stock: Number(stock) } },
      { onSuccess: () => { setName(''); setPrice(''); setStock('0'); } },
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 border-t border-line pt-3">
      <p className="text-sm font-semibold">Agregar variante</p>
      <div className="grid grid-cols-3 gap-2">
        <input className={inputClass} placeholder="Nombre" required value={name} onChange={(e) => setName(e.target.value)} />
        <input className={inputClass} placeholder="Precio (S/)" type="number" min="0.01" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} />
        <input className={inputClass} placeholder="Stock" type="number" min="0" step="1" required value={stock} onChange={(e) => setStock(e.target.value)} />
      </div>
      {create.isError && <p className="text-sm text-red-400">{errorMessage(create.error)}</p>}
      <Button type="submit" size="sm" className="self-start" isLoading={create.isPending}>
        Agregar
      </Button>
    </form>
  );
}

export default function EditProductForm({ product, onDone }: { product: SellerProduct; onDone: () => void }) {
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const update = useUpdateProduct();

  function submit(event: FormEvent) {
    event.preventDefault();
    update.mutate({ id: product.id, data: { title: title.trim(), description: description.trim() } });
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Título
          <input className={inputClass} required minLength={3} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Descripción (mínimo 10 caracteres)
          <textarea className={`${inputClass} py-2`} rows={3} required minLength={10} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        {update.isError && <p className="text-sm text-red-400">{errorMessage(update.error)}</p>}
        {update.isSuccess && <p className="text-xs text-brand">Guardado.</p>}
        <Button type="submit" size="sm" className="self-start" isLoading={update.isPending}>
          {i18n.common.save}
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">Variantes</p>
        {product.variants.map((variant) => (
          <VariantEditor key={variant.id} productId={product.id} variant={variant} />
        ))}
      </div>

      <NewVariant productId={product.id} />

      <Button variant="secondary" size="sm" className="self-end" onClick={onDone}>
        {i18n.common.back}
      </Button>
    </div>
  );
}
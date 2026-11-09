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
import { CheckCircle2, AlertCircle, Plus, Layers } from 'lucide-react';

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
    <div className="flex flex-col gap-2.5 rounded-xl border border-line bg-surface-2/40 p-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <label className="flex flex-col gap-1 text-[11px] text-ink-muted">
          <span>Nombre de variante</span>
          <input
            className="h-9 px-3 rounded-lg border border-line bg-surface-2 text-xs text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
            aria-label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-[11px] text-ink-muted">
          <span>Precio (S/.)</span>
          <input
            className="h-9 px-3 rounded-lg border border-line bg-surface-2 text-xs text-ink tabular focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
            aria-label="Precio (S/)"
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-[11px] text-ink-muted">
          <span>Stock disponible</span>
          <input
            className="h-9 px-3 rounded-lg border border-line bg-surface-2 text-xs text-ink tabular focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
            aria-label="Stock"
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </label>
      </div>

      {update.isError && (
        <p className="text-xs text-danger flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          <span>{errorMessage(update.error)}</span>
        </p>
      )}

      <div className="flex items-center justify-between pt-1">
        {update.isSuccess ? (
          <span className="text-[11px] text-brand flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Guardado exitoso</span>
          </span>
        ) : <span />}

        <Button
          size="sm"
          variant="secondary"
          className="text-xs h-7 px-3"
          isLoading={update.isPending}
          onClick={save}
        >
          {i18n.common.save}
        </Button>
      </div>
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
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl border border-dashed border-line p-3.5 bg-surface-2/20">
      <div className="flex items-center gap-2 text-xs font-semibold text-ink">
        <Plus className="h-3.5 w-3.5 text-brand" />
        <span>Agregar nueva variante</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          className="h-9 px-3 rounded-lg border border-line bg-surface-2 text-xs text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
          placeholder="Ej. Talla L / Color Azul"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="h-9 px-3 rounded-lg border border-line bg-surface-2 text-xs text-ink tabular placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
          placeholder="Precio S/."
          type="number"
          min="0.01"
          step="0.01"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          className="h-9 px-3 rounded-lg border border-line bg-surface-2 text-xs text-ink tabular placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
          placeholder="Stock inicial"
          type="number"
          min="0"
          step="1"
          required
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
      </div>

      {create.isError && (
        <p className="text-xs text-danger">{errorMessage(create.error)}</p>
      )}

      <Button
        type="submit"
        size="sm"
        className="self-start text-xs font-semibold"
        isLoading={create.isPending}
      >
        Añadir variante
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
    <div className="flex flex-col gap-6">
      {/* Información básica */}
      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-xs font-medium text-ink">
          <span>Título del producto</span>
          <input
            className="h-10 px-3.5 rounded-lg border border-line bg-surface-2 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all"
            required
            minLength={3}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-ink">
          <span>Descripción (mínimo 10 caracteres)</span>
          <textarea
            className="w-full min-h-[80px] rounded-lg border border-line bg-surface-2 p-3 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all"
            rows={3}
            required
            minLength={10}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        {update.isError && (
          <p className="text-xs text-danger">{errorMessage(update.error)}</p>
        )}

        {update.isSuccess && (
          <p className="text-xs text-brand flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Datos guardados correctamente</span>
          </p>
        )}

        <Button
          type="submit"
          size="sm"
          className="self-start font-semibold px-4"
          isLoading={update.isPending}
        >
          {i18n.common.save}
        </Button>
      </form>

      {/* Variantes del Producto */}
      <div className="flex flex-col gap-3 border-t border-line/60 pt-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-brand" />
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
            Variantes y Stock
          </h3>
        </div>

        <div className="flex flex-col gap-2.5">
          {product.variants.map((variant) => (
            <VariantEditor key={variant.id} productId={product.id} variant={variant} />
          ))}
        </div>

        <NewVariant productId={product.id} />
      </div>

      <div className="flex justify-end pt-3 border-t border-line/60">
        <Button variant="secondary" size="sm" onClick={onDone}>
          {i18n.common.back}
        </Button>
      </div>
    </div>
  );
}

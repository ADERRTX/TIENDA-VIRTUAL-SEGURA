import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../api/products';
import { imageUrl, mainImage } from '../api/products';
import { useAddToCart } from '../api/cart';
import { useMe } from '../api/auth';
import { Button } from './ui/Button';
import { formatMoney } from '../lib/formatters';
import { Store, Package, Check } from 'lucide-react';

export interface ProductCardProps {
  product: Product;
  className?: string;
}

function minPrice(product: Product): number | null {
  if (!product.variants || product.variants.length === 0) return null;
  return Math.min(...product.variants.map((v) => v.price));
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const navigate = useNavigate();
  const { data: user } = useMe();
  const addToCart = useAddToCart();
  const [added, setAdded] = useState(false);

  const price = minPrice(product);
  const image = mainImage(product);
  const totalStock = product.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
  const defaultVariant = product.variants.find((v) => v.stock > 0) || product.variants[0];
  const hasStock = totalStock > 0 && Boolean(defaultVariant);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (!hasStock || !defaultVariant) return;

    // Si tiene múltiples variantes, dirigimos al detalle para que elija
    if (product.variants.length > 1) {
      navigate(`/catalogo/${product.id}`);
      return;
    }

    addToCart.mutate(
      { variantId: defaultVariant.id, quantity: 1 },
      {
        onSuccess: () => {
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
        },
      },
    );
  }

  return (
    <div
      className={`group flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-soft hover:shadow-sm ${className}`}
    >
      <Link to={`/catalogo/${product.id}`} className="flex flex-col flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-t-xl">
        {/* Recuadro de imagen aspect-[4/3] sobre surface-2 con rounded-xl */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
          {image ? (
            <img
              src={imageUrl(image.fileName)}
              alt={`Fotografía de ${product.title}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-muted/50">
              <Package size={40} strokeWidth={1.5} aria-hidden="true" />
            </div>
          )}

          {/* Categoría superior flotante */}
          {product.category?.name && (
            <div className="absolute top-2.5 left-2.5">
              <span className="rounded-md bg-surface/90 backdrop-blur-xs px-2 py-0.5 text-xs font-medium text-ink-muted border border-line">
                {product.category.name}
              </span>
            </div>
          )}

          {/* Badge de Sin stock sobre imagen si no hay existencias */}
          {!hasStock && (
            <div className="absolute top-2.5 right-2.5">
              <span className="rounded-md bg-danger/90 text-brand-ink px-2 py-0.5 text-xs font-semibold">
                Sin stock
              </span>
            </div>
          )}
        </div>

        {/* Metadatos del producto */}
        <div className="flex flex-1 flex-col p-4 gap-2">
          {/* Tienda */}
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Store className="h-3.5 w-3.5 text-brand shrink-0" aria-hidden="true" />
            <span className="truncate">{product.seller.storeName}</span>
          </div>

          {/* Título en máximo 2 líneas */}
          <h3 className="text-sm sm:text-base font-semibold text-ink line-clamp-2 leading-snug group-hover:text-brand transition-colors">
            {product.title}
          </h3>

          {/* Precio destacado en 20px font-semibold con tabular-nums */}
          <div className="mt-auto pt-2">
            <span className="text-xl font-semibold text-ink tabular">
              {price !== null ? formatMoney(price) : 'No disponible'}
            </span>
          </div>
        </div>
      </Link>

      {/* Botón de acción a todo el ancho */}
      <div className="p-4 pt-0">
        <Button
          type="button"
          variant={hasStock ? 'primary' : 'secondary'}
          size="sm"
          disabled={!hasStock || addToCart.isPending}
          isLoading={addToCart.isPending}
          onClick={handleAddToCart}
          className="w-full text-xs font-medium min-h-[40px]"
        >
          {added ? (
            <span className="flex items-center gap-1.5 text-brand-ink">
              <Check className="h-4 w-4" aria-hidden="true" />
              Agregado
            </span>
          ) : !hasStock ? (
            'Sin stock'
          ) : product.variants.length > 1 ? (
            'Ver opciones'
          ) : (
            'Agregar al carrito'
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;

import { Link } from 'react-router-dom';
import { useMe } from '../api/auth';
import { useCart, useRemoveCartItem, useUpdateCartItem } from '../api/cart';
import { imageUrl } from '../api/products';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';
import { formatMoney } from '../lib/formatters';

export default function CartPage() {
  const { data: user, isLoading: loadingUser } = useMe();
  const { data: cart, isLoading, isError, refetch } = useCart(Boolean(user));
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const busy = updateItem.isPending || removeItem.isPending;

  if (loadingUser) {
    return <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />;
  }

  if (!user) {
    return (
      <section className="flex flex-col items-start gap-3">
        <h1 className="text-2xl font-bold">{i18n.cart.title}</h1>
        <p className="text-ink-muted">Inicia sesión para ver tu carrito.</p>
        <Link to="/login" className="text-brand underline">
          {i18n.nav.login}
        </Link>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{i18n.cart.title}</h1>

      {isLoading && <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />}

      {isError && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface-2 p-5">
          <p className="text-ink-muted">{i18n.common.error}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            {i18n.common.retry}
          </Button>
        </div>
      )}

      {cart && cart.groups.length === 0 && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-ink-muted">{i18n.cart.empty}</p>
          <Link to="/catalogo" className="text-brand underline">
            {i18n.cart.startShopping}
          </Link>
        </div>
      )}

      {cart && cart.warnings.length > 0 && (
        <div className="rounded-2xl border border-line bg-surface-2 p-4">
          <p className="mb-2 font-bold">{i18n.cart.warnings}</p>
          <ul className="list-disc pl-5 text-sm text-red-500">
            {cart.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {cart &&
        cart.groups.map((group) => (
          <div key={group.sellerId} className="flex flex-col gap-3">
            <h2 className="text-sm text-ink-muted">
              {i18n.cart.sellerGroup} <span className="font-bold">{group.storeName}</span>
            </h2>

            {group.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface-2 p-3"
              >
                {item.image ? (
                  <img
                    src={imageUrl(item.image)}
                    alt={item.title}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface text-xs text-ink-muted">
                    Sin imagen
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <Link to={`/catalogo/${item.productId}`} className="font-bold hover:text-brand">
                    {item.title}
                  </Link>
                  <p className="text-xs text-ink-muted">{item.variantName}</p>
                  <p className="text-sm text-brand">{formatMoney(item.price)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label="Disminuir cantidad"
                    disabled={busy || item.quantity <= 1}
                    onClick={() =>
                      updateItem.mutate({ variantId: item.variantId, quantity: item.quantity - 1 })
                    }
                  >
                    −
                  </Button>
                  <span className="w-6 text-center font-bold">{item.quantity}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label="Aumentar cantidad"
                    disabled={busy || item.quantity >= item.stock}
                    onClick={() =>
                      updateItem.mutate({ variantId: item.variantId, quantity: item.quantity + 1 })
                    }
                  >
                    +
                  </Button>
                </div>

                <p className="w-24 text-right font-bold">{formatMoney(item.total)}</p>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => removeItem.mutate(item.variantId)}
                >
                  {i18n.cart.remove}
                </Button>
              </div>
            ))}

            <p className="text-right text-sm text-ink-muted">
              {i18n.cart.subtotal}: <span className="font-bold">{formatMoney(group.subtotal)}</span>
            </p>
          </div>
        ))}

      {cart && cart.groups.length > 0 && (
        <div className="flex flex-col items-end gap-3 border-t border-line pt-4">
          <p className="text-lg">
            {i18n.cart.total}: <span className="font-bold text-brand">{formatMoney(cart.total)}</span>
          </p>
          {/* El checkout se conecta en el siguiente paso */}
          <Link
  to="/checkout"
  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand/50 bg-gradient-to-b from-[#3FE0CB] to-[#14B8A6] px-5 py-2.5 text-sm font-bold text-[#04211D] shadow-[0_0_18px_rgba(45,212,191,0.35)] hover:brightness-110"
>
  {i18n.cart.checkout}
</Link>
        </div>
      )}
    </section>
  );
}
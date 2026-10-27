import { useProductReviews } from '../api/products';
import { i18n } from '../i18n/es';
import { formatDate } from '../lib/formatters';

function Stars({ value }: { value: number }) {
  return (
    <span aria-label={`${value} de 5 estrellas`} className="text-brand">
      {'★'.repeat(value)}
      <span className="text-ink-muted">{'★'.repeat(5 - value)}</span>
    </span>
  );
}

export default function ReviewsSection({ productId }: { productId: string }) {
  const { data, isLoading, isError } = useProductReviews(productId);

  return (
    <section className="flex flex-col gap-4 border-t border-line pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold">{i18n.reviews.title}</h2>
        {data && data.count > 0 && data.average !== null && (
          <p className="text-sm text-ink-muted">
            <span className="font-bold text-brand">{Number(data.average).toFixed(1)}</span> / 5 ·{' '}
            {data.count} {data.count === 1 ? 'opinión' : 'opiniones'}
          </p>
        )}
      </div>

      {isLoading && <div className="h-16 animate-pulse rounded-2xl bg-surface-2" />}
      {isError && <p className="text-sm text-ink-muted">{i18n.common.error}</p>}
      {data && data.items.length === 0 && (
        <p className="text-sm text-ink-muted">Este producto aún no tiene opiniones.</p>
      )}

      {data?.items.map((review) => (
        <article
          key={review.id}
          className="flex flex-col gap-1 rounded-2xl border border-line bg-surface-2 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Stars value={review.stars} />
            <span className="text-xs text-ink-muted">{formatDate(review.createdAt)}</span>
          </div>
          {review.user?.fullName && <p className="text-xs text-ink-muted">{review.user.fullName}</p>}
          {review.comment && <p className="text-sm">{review.comment}</p>}
        </article>
      ))}
    </section>
  );
}
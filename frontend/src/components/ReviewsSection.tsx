import { useProductReviews } from '../api/products';
import { i18n } from '../i18n/es';
import { formatDate } from '../lib/formatters';
import { Card } from './ui/Card';
import { Skeleton } from './ui/Skeleton';
import { Star, MessageSquare } from 'lucide-react';

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5 text-brand" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= value
              ? 'fill-brand text-brand'
              : 'fill-transparent text-ink-muted/40'
          }`}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection({ productId }: { productId: string }) {
  const { data, isLoading, isError } = useProductReviews(productId);

  return (
    <section className="flex flex-col gap-6 border-t border-line/60 pt-8 mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-brand" />
          <h2 className="text-xl font-semibold text-ink">{i18n.reviews.title}</h2>
        </div>
        {data && data.count > 0 && data.average !== null && (
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <span className="text-base font-semibold text-brand tabular">
              {Number(data.average).toFixed(1)}
            </span>
            <span>de 5</span>
            <span>·</span>
            <span>
              {data.count} {data.count === 1 ? 'opinión verificada' : 'opiniones verificadas'}
            </span>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton variant="block" className="h-20 w-full" />
          <Skeleton variant="block" className="h-20 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-xs text-danger">No se pudieron cargar las opiniones del producto.</p>
      )}

      {data && data.items.length === 0 && (
        <Card padding="md" className="text-center py-8">
          <p className="text-sm text-ink-muted">
            Este producto aún no tiene calificaciones registradas por compradores.
          </p>
        </Card>
      )}

      {data && data.items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.items.map((review) => (
            <Card key={review.id} padding="md" className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <Stars value={review.stars} />
                <span className="text-xs text-ink-muted">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              {review.user?.fullName && (
                <p className="text-xs font-semibold text-ink">
                  {review.user.fullName}
                </p>
              )}
              {review.comment && (
                <p className="text-xs text-ink-muted leading-relaxed">
                  "{review.comment}"
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

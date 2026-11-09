import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  className?: string;
  totalItems?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  className = '',
  totalItems,
}) => {
  const safeTotal = Math.max(1, totalPages);
  const isFirst = page <= 1;
  const isLast = page >= safeTotal;

  return (
    <nav
      aria-label="Paginación"
      className={`flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-line/60 ${className}`}
    >
      <div className="text-xs text-ink-muted">
        {typeof totalItems === 'number' && (
          <span className="mr-2">
            Total: <strong className="text-ink tabular">{totalItems}</strong> resultados ·
          </span>
        )}
        <span>
          Página <strong className="text-ink tabular">{page}</strong> de{' '}
          <strong className="text-ink tabular">{safeTotal}</strong>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={isFirst}
          onClick={() => onPageChange(page - 1)}
          className="gap-1.5"
          aria-label="Ir a la página anterior"
        >
          <ChevronLeft size={16} />
          <span>Anterior</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          disabled={isLast}
          onClick={() => onPageChange(page + 1)}
          className="gap-1.5"
          aria-label="Ir a la página siguiente"
        >
          <span>Siguiente</span>
          <ChevronRight size={16} />
        </Button>
      </div>
    </nav>
  );
};

export default Pagination;

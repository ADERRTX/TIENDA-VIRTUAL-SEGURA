import React from 'react';
import { Skeleton } from './Skeleton';

export interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyState,
  className = '',
}: DataTableProps<T>) {
  return (
    <div className={`w-full overflow-hidden rounded-xl border border-line bg-surface ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-line bg-surface-2 text-xs font-semibold uppercase tracking-wider text-ink-muted sticky top-0 z-10">
              {columns.map((col) => (
                <th key={col.key} scope="col" className={`px-4 py-3.5 ${col.headerClassName || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-sm">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-4 py-3.5">
                      <Skeleton variant="line" className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-ink-muted">
                  {emptyState || 'No se encontraron registros.'}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className="transition-colors hover:bg-surface-2 h-12"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-ink ${col.className || ''}`}>
                      {col.render ? col.render(row) : (row as unknown as Record<string, React.ReactNode>)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;

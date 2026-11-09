import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  description?: string;
  onRetry?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ocurrió un problema al cargar los datos',
  message,
  description,
  onRetry,
  actionLabel,
  onAction,
  className = '',
}) => {
  const displayMessage =
    description ||
    message ||
    'No pudimos completar la solicitud. Por favor verifica tu conexión o intenta nuevamente.';

  const handleAction = onRetry || onAction;
  const label = actionLabel || 'Reintentar';

  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-10 rounded-xl border border-danger/30 bg-danger/5 ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center text-danger mb-3">
        <AlertCircle size={28} strokeWidth={1.75} />
      </div>
      <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
      <p className="text-sm text-ink-muted max-w-sm mb-4">{displayMessage}</p>
      {handleAction && (
        <Button variant="secondary" size="sm" onClick={handleAction} className="gap-2">
          <RotateCcw size={14} />
          <span>{label}</span>
        </Button>
      )}
    </div>
  );
};

export default ErrorState;

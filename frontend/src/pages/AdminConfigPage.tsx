import { useState, type FormEvent } from 'react';
import { useAdminConfig, useUpdateConfig, type ConfigEntry } from '../api/admin';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { i18n } from '../i18n/es';
import { ApiError } from '../lib/http';
import { Clock, CheckCircle2, AlertCircle, Save } from 'lucide-react';

const labels: Record<string, string> = {
  PAYMENT_TIMEOUT_MINUTES: 'Plazo para abonar y pagar un pedido (minutos)',
  SELLER_CONFIRM_HOURS: 'Plazo para que el comercio confirme el pedido (horas)',
  DISPATCH_HOURS: 'Plazo máximo para despachar y registrar guía (horas)',
  FINALIZE_AFTER_DELIVERY_DAYS: 'Plazo para liberación automática tras entrega (días)',
  CLAIM_WINDOW_DAYS: 'Ventana de reclamo permitida tras entrega (días)',
  CLAIM_RESPONSE_HOURS: 'Plazo para respuesta del comercio en reclamo (horas)',
  APPEAL_DAYS: 'Ventana de días hábiles para apelar resolución (días)',
  RETURN_SHIP_DAYS: 'Plazo para despachar mercadería de devolución (días)',
};

function ConfigRow({ entry }: { entry: ConfigEntry }) {
  const [value, setValue] = useState(entry.value);
  const update = useUpdateConfig();
  const changed = value !== entry.value;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    update.mutate({ key: entry.key, value: value.trim() });
  };

  return (
    <Card padding="md" className="flex flex-col gap-3 shadow-sm">
      <form onSubmit={submit} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-brand border border-line shrink-0">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-xs sm:text-sm text-ink">
              {labels[entry.key] ?? entry.key}
            </h2>
            <span className="font-mono text-[10px] text-ink-muted">
              SystemConfig: {entry.key}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            type="number"
            min={1}
            required
            className="w-24 h-10 px-3 rounded-lg border border-line bg-surface-2 text-xs text-ink font-bold tabular focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand text-center transition-all"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              update.reset();
            }}
          />

          <Button
            type="submit"
            size="sm"
            disabled={!changed}
            isLoading={update.isPending}
            className="font-semibold text-xs gap-1"
          >
            <Save className="h-3 w-3" />
            <span>{i18n.common.save}</span>
          </Button>
        </div>
      </form>

      {update.isError && (
        <p className="text-xs text-danger flex items-center gap-1.5 pt-1 border-t border-line/40">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{update.error instanceof ApiError ? update.error.message : i18n.common.error}</span>
        </p>
      )}

      {update.isSuccess && !changed && (
        <p className="text-xs text-brand flex items-center gap-1.5 pt-1 border-t border-line/40">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Parámetro de plazo actualizado exitosamente</span>
        </p>
      )}
    </Card>
  );
}

export default function AdminConfigPage() {
  const { data, isLoading, isError, error, refetch } = useAdminConfig();

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <PageHeader
        title={i18n.admin.configTitle}
        description="Configuración de tiempos límite del marketplace (timeouts de pago, confirmación y custodia)."
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Panel Admin' },
          { label: 'Configuración de Plazos' },
        ]}
      />

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton variant="block" className="h-20 w-full" />
          <Skeleton variant="block" className="h-20 w-full" />
          <Skeleton variant="block" className="h-20 w-full" />
        </div>
      )}

      {isError && (
        <ErrorState
          title="Error al consultar configuración del sistema"
          description={error instanceof ApiError ? error.message : i18n.common.error}
          onRetry={() => refetch()}
        />
      )}

      {data && (
        <div className="flex flex-col gap-3">
          {data.map((entry) => (
            <ConfigRow key={`${entry.key}:${entry.value}`} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

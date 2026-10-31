import { useState, type FormEvent } from 'react';
import { useAdminConfig, useUpdateConfig, type ConfigEntry } from '../api/admin';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';
import { ApiError } from '../lib/http';

const labels: Record<string, string> = {
  PAYMENT_TIMEOUT_MINUTES: 'Minutos para pagar un pedido',
  SELLER_CONFIRM_HOURS: 'Horas para que el vendedor confirme',
  DISPATCH_HOURS: 'Horas para despachar',
  FINALIZE_AFTER_DELIVERY_DAYS: 'Días para finalizar tras la entrega',
  CLAIM_WINDOW_DAYS: 'Días para reclamar tras la entrega',
  CLAIM_RESPONSE_HOURS: 'Horas para que el vendedor responda un reclamo',
  APPEAL_DAYS: 'Días para apelar una resolución',
  RETURN_SHIP_DAYS: 'Días para enviar la devolución',
};

const inputClass =
  'w-28 min-h-[44px] rounded-xl border border-line bg-bg px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

function ConfigRow({ entry }: { entry: ConfigEntry }) {
  const [value, setValue] = useState(entry.value);
  const update = useUpdateConfig();
  const changed = value !== entry.value;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    update.mutate({ key: entry.key, value: value.trim() });
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface-2 p-4"
    >
      <div>
        <h2 className="text-sm font-bold">{labels[entry.key] ?? entry.key}</h2>
        <p className="text-xs text-ink-muted">{entry.key}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          required
          className={inputClass}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            update.reset();
          }}
        />
        <Button type="submit" size="sm" disabled={!changed} isLoading={update.isPending}>
          {i18n.common.save}
        </Button>
      </div>
      {update.isError && (
        <p className="w-full text-sm text-red-400">
          {update.error instanceof ApiError ? update.error.message : i18n.common.error}
        </p>
      )}
      {update.isSuccess && !changed && <p className="w-full text-sm text-brand">Guardado.</p>}
    </form>
  );
}

export default function AdminConfigPage() {
  const { data, isLoading, isError, error, refetch } = useAdminConfig();

  return (
    <section className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-bold">{i18n.admin.configTitle}</h1>

      {isLoading && <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />}
      {isError && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface-2 p-5">
          <p className="text-ink-muted">{error instanceof ApiError ? error.message : i18n.common.error}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            {i18n.common.retry}
          </Button>
        </div>
      )}
      {data?.map((entry) => <ConfigRow key={`${entry.key}:${entry.value}`} entry={entry} />)}
    </section>
  );
}
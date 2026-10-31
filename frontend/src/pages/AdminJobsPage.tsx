import { useRunJob } from '../api/admin';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';
import { ApiError } from '../lib/http';

const jobs = [
  { id: 'expire_payments', label: 'Cancelar pagos vencidos' },
  { id: 'expire_unconfirmed', label: 'Cancelar pedidos sin confirmar por el vendedor' },
  { id: 'finalize_delivered', label: 'Finalizar pedidos entregados' },
];

export default function AdminJobsPage() {
  const run = useRunJob();

  return (
    <section className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{i18n.admin.demoTitle}</h1>
        <p className="text-sm text-ink-muted">{i18n.admin.demoDesc}</p>
      </div>

      <div className="flex flex-col gap-2">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-surface-2 p-3"
          >
            <span className="text-sm">{job.label}</span>
            <Button size="sm" variant="secondary" isLoading={run.isPending} onClick={() => run.mutate(job.id)}>
              Ejecutar
            </Button>
          </div>
        ))}
        <Button isLoading={run.isPending} onClick={() => run.mutate(undefined)}>
          Ejecutar todas
        </Button>
      </div>

      {run.isError && (
        <p className="text-sm text-red-400">
          {run.error instanceof ApiError ? run.error.message : i18n.common.error}
        </p>
      )}
      {run.isSuccess && (
        <pre className="overflow-x-auto rounded-2xl border border-line bg-surface-2 p-4 text-xs">
          {JSON.stringify(run.data, null, 2)}
        </pre>
      )}
    </section>
  );
}
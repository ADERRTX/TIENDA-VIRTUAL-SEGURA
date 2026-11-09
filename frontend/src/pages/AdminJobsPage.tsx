import { useRunJob } from '../api/admin';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { i18n } from '../i18n/es';
import { ApiError } from '../lib/http';
import {
  Play,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';

const jobs = [
  {
    id: 'expire_payments',
    label: 'Cancelar Pagos Vencidos',
    desc: 'Cancela pedidos con timeout excedido y libera el stock reservado.',
  },
  {
    id: 'expire_unconfirmed',
    label: 'Cancelar Pedidos sin Confirmar por Comercio',
    desc: 'Cancela y reembolsa automáticamente sub-pedidos no atendidos a tiempo.',
  },
  {
    id: 'finalize_delivered',
    label: 'Finalizar y Liberar Fondos de Pedidos Entregados',
    desc: 'Cierra el ciclo de custodia y transfiere los fondos tras expirar la ventana de reclamo.',
  },
];

export default function AdminJobsPage() {
  const run = useRunJob();

  const columns: Column<(typeof jobs)[0]>[] = [
    {
      key: 'job',
      header: 'Proceso Automatizado',
      render: (job) => (
        <div className="flex flex-col py-1">
          <span className="font-semibold text-xs text-ink">{job.label}</span>
          <span className="text-xs text-ink-muted leading-relaxed">{job.desc}</span>
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Cron ID',
      render: (job) => (
        <span className="font-mono text-xs text-brand bg-brand-soft px-2 py-0.5 rounded border border-brand/20 whitespace-nowrap">
          {job.id}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Acción',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (job) => (
        <Button
          size="sm"
          variant="secondary"
          className="text-xs font-semibold gap-1.5 h-8 shrink-0"
          isLoading={run.isPending && run.variables === job.id}
          onClick={() => run.mutate(job.id)}
        >
          <Play className="h-3 w-3 text-brand" />
          <span>Ejecutar</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <PageHeader
        title={i18n.admin.demoTitle}
        description={i18n.admin.demoDesc}
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Panel Admin' },
          { label: 'Simulador de Tareas' },
        ]}
      />

      <Card padding="lg" className="flex flex-col gap-6 shadow-sm">
        <div className="flex items-center gap-3 pb-3 border-b border-line/60">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 border border-brand/30 text-brand">
            <Layers className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-semibold text-ink">Tareas Programadas (Crons)</h2>
            <span className="text-xs text-ink-muted">
              Dispara manualmente los procesos de conciliación de custodia y plazos.
            </span>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={jobs}
          keyExtractor={(job) => job.id}
        />

        <div className="pt-2 border-t border-line/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-ink-muted">
            Ejecuta todas las tareas en secuencia con un solo clic.
          </span>

          <Button
            size="md"
            variant="primary"
            className="w-full sm:w-auto font-medium text-xs gap-2 px-6"
            isLoading={run.isPending && run.variables === undefined}
            onClick={() => run.mutate(undefined)}
          >
            <PlayCircle className="h-4 w-4" />
            <span>Ejecutar Todas las Tareas</span>
          </Button>
        </div>

        {run.isError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-soft text-danger border border-danger/30 text-xs font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{run.error instanceof ApiError ? run.error.message : i18n.common.error}</span>
          </div>
        )}

        {run.isSuccess && (
          <div className="flex flex-col gap-2 pt-2 border-t border-line/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand">
              <CheckCircle2 className="h-4 w-4" />
              <span>Resultado de la Ejecución</span>
            </div>
            <pre className="p-4 rounded-xl border border-line bg-surface-2 font-mono text-xs text-ink overflow-x-auto leading-relaxed">
              {JSON.stringify(run.data, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
}

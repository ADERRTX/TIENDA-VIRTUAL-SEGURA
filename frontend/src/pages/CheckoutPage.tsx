import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAddresses, useCreateAddress, useCreateOrder, usePay, type Address } from '../api/checkout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { i18n } from '../i18n/es';
import { ApiError } from '../lib/http';
import {
  ShieldCheck,
  CreditCard,
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Lock,
  ArrowRight,
} from 'lucide-react';

const emptyForm = { label: '', line1: '', city: '', province: '' };

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : i18n.common.error;
}

function CheckoutStep({
  stepNumber,
  title,
  icon,
  children,
}: {
  stepNumber: number;
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card padding="lg" className="flex flex-col gap-4">
      <div className="flex items-center gap-3 border-b border-line/60 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/15 text-brand text-xs font-medium border border-brand/30">
          {stepNumber}
        </div>
        <div className="flex items-center gap-2 text-ink font-semibold text-base">
          {icon}
          <span>{title}</span>
        </div>
      </div>
      {children}
    </Card>
  );
}

function NewAddressForm({ onCreated, onCancel }: { onCreated: (id: string) => void; onCancel: () => void }) {
  const [form, setForm] = useState(emptyForm);
  const create = useCreateAddress();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate(form, {
      onSuccess: (address) => {
        setForm(emptyForm);
        onCreated(address.id);
      },
    });
  };

  const field = (key: keyof typeof emptyForm, label: string, placeholder: string) => (
    <label className="flex flex-col gap-1 text-xs font-medium text-ink">
      <span>{label}</span>
      <input
        className="h-10 px-3 rounded-lg border border-line bg-surface-2 text-xs text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all"
        value={form[key]}
        placeholder={placeholder}
        required
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </label>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl border border-line/70 bg-surface-2/40 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {field('label', 'Etiqueta de la dirección', 'Ej. Casa, Departamento, Oficina')}
        {field('line1', 'Dirección física y número', 'Ej. Av. Los Libertadores 123 Dpto 401')}
        {field('city', 'Ciudad / Distrito', 'Ej. Miraflores, Lima')}
        {field('province', 'Provincia / Región', 'Ej. Lima')}
      </div>

      {create.isError && (
        <p className="text-xs text-danger flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{errorMessage(create.error)}</span>
        </p>
      )}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-line/40">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" isLoading={create.isPending} className="font-semibold">
          Guardar dirección
        </Button>
      </div>
    </form>
  );
}

function AddressStep(props: {
  addresses: Address[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <CheckoutStep
      stepNumber={1}
      title={i18n.checkout.step1}
      icon={<MapPin className="h-5 w-5 text-brand" />}
    >
      {props.addresses.length === 0 && !showForm && (
        <p className="text-xs text-ink-muted leading-relaxed">
          {i18n.checkout.addressPrompt}
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        {props.addresses.map((address) => {
          const isSelected = props.selectedId === address.id;
          return (
            <label
              key={address.id}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-brand bg-brand-soft/20 ring-1 ring-brand'
                  : 'border-line bg-surface hover:border-line-soft'
              }`}
            >
              <input
                type="radio"
                name="address"
                checked={isSelected}
                onChange={() => props.onSelect(address.id)}
                className="mt-1 h-4 w-4 border-line text-brand focus:ring-brand"
              />
              <div className="flex flex-col text-xs">
                <span className="font-medium text-ink flex items-center gap-2">
                  {address.label}
                  {address.isDefault && (
                    <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-xs text-brand border border-brand/30">
                      Predeterminada
                    </span>
                  )}
                </span>
                <span className="text-ink-muted mt-0.5">
                  {address.line1}, {address.city}, {address.province}
                </span>
              </div>
            </label>
          );
        })}
      </div>

      {showForm ? (
        <NewAddressForm
          onCreated={(id) => {
            props.onSelect(id);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <Button
          variant="secondary"
          size="sm"
          className="self-start gap-1.5 text-xs font-semibold"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{i18n.checkout.addAddress}</span>
        </Button>
      )}
    </CheckoutStep>
  );
}

function Confirmation() {
  return (
    <section className="flex flex-col items-center justify-center gap-6 py-12 max-w-xl mx-auto text-center animate-scale-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand/15 text-brand border border-brand/40 ">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-semibold text-ink">
          {i18n.checkout.successTitle}
        </h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          {i18n.checkout.successDesc}
        </p>
      </div>

      <div className="rounded-xl border border-brand/30 bg-surface p-4 text-xs text-ink-muted leading-relaxed max-w-md">
        <div className="flex items-center justify-center gap-1.5 text-brand font-medium mb-1">
          <ShieldCheck className="h-4 w-4" />
          <span>Fondos en Custodia Segura</span>
        </div>
        El importe abonado permanecerá retenido por el sistema TVS hasta que confirmes la entrega física satisfactoria de tus productos.
      </div>

      <Link
        to="/pedidos"
        className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-brand-ink  hover:bg-brand-hover transition-colors gap-2"
      >
        <span>{i18n.checkout.viewOrder}</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

export default function CheckoutPage() {
  const addresses = useAddresses();
  const createOrder = useCreateOrder();
  const pay = usePay();
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [token, setToken] = useState('tok_ok');
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const list = addresses.data ?? [];
  const addressId = chosenId ?? list.find((a) => a.isDefault)?.id ?? list[0]?.id ?? null;

  const handlePay = async () => {
    if (!addressId) return;
    setError(null);
    try {
      const id = orderId ?? (await createOrder.mutateAsync(addressId)).id;
      setOrderId(id);
      const result = await pay.mutateAsync({ orderId: id, token });
      if (typeof result.status === 'string' && result.status !== 'APROBADO') {
        setError('El pago simulado fue rechazado por el emisor. Prueba con la tarjeta de prueba aprobada.');
        return;
      }
      setPaid(true);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  if (paid) return <Confirmation />;

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      <PageHeader
        title={i18n.cart.checkout}
        description="Confirma tu dirección de entrega y completa el pago en custodia para proteger tu compra."
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Carrito', to: '/carrito' },
          { label: 'Pasarela de Pago' },
        ]}
      />

      <div className="flex flex-col gap-6">
        {/* Paso 1: Dirección */}
        <AddressStep addresses={list} selectedId={addressId} onSelect={setChosenId} />

        {/* Paso 2: Método de Envío */}
        <CheckoutStep
          stepNumber={2}
          title={i18n.checkout.step2}
          icon={<Truck className="h-5 w-5 text-info" />}
        >
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-surface">
            <div className="flex flex-col text-xs">
              <span className="font-semibold text-ink">{i18n.checkout.shippingMethod}</span>
              <span className="text-ink-muted">Coordinado y despachado directamente por cada comercio verificado</span>
            </div>
            <span className="text-xs font-medium text-success bg-success-soft px-2 py-0.5 rounded-full border border-success/30">
              {i18n.checkout.shippingCost}
            </span>
          </div>
        </CheckoutStep>

        {/* Paso 3: Tarjeta y Pago */}
        <CheckoutStep
          stepNumber={3}
          title={i18n.checkout.step3}
          icon={<CreditCard className="h-5 w-5 text-brand" />}
        >
          <p className="text-xs text-ink-muted leading-relaxed">
            {i18n.checkout.paymentPrompt}
          </p>

          <div className="flex flex-col gap-2.5">
            {[
              {
                value: 'tok_ok',
                label: i18n.checkout.testCardOk,
                desc: 'Simula una transacción exitosa con retención de fondos en custodia TVS.',
              },
              {
                value: 'tok_fail',
                label: i18n.checkout.testCardFail,
                desc: 'Simula el rechazo bancario por fondos insuficientes o tarjeta denegada.',
              },
            ].map((option) => {
              const isSelected = token === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand bg-brand-soft/20 ring-1 ring-brand'
                      : 'border-line bg-surface hover:border-line-soft'
                  }`}
                >
                  <input
                    type="radio"
                    name="token"
                    checked={isSelected}
                    onChange={() => setToken(option.value)}
                    className="mt-1 h-4 w-4 border-line text-brand focus:ring-brand"
                  />
                  <div className="flex flex-col text-xs">
                    <span className="font-medium text-ink">{option.label}</span>
                    <span className="text-ink-muted mt-0.5">{option.desc}</span>
                  </div>
                </label>
              );
            })}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-soft text-danger border border-danger/30 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 border-t border-line/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <Lock className="h-3.5 w-3.5 text-brand" />
              <span>Cifrado TLS y tokenización segura de tarjetas</span>
            </div>

            <Button
              size="lg"
              variant="primary"
              className="w-full sm:w-auto font-medium px-8 "
              disabled={!addressId}
              isLoading={createOrder.isPending || pay.isPending}
              onClick={handlePay}
            >
              <ShieldCheck className="h-4 w-4 mr-1.5" />
              {i18n.checkout.confirmAndPay}
            </Button>
          </div>
        </CheckoutStep>
      </div>
    </div>
  );
}

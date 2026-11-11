import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAddresses,
  useCreateAddress,
  useCreateOrder,
  usePay,
  type Address,
} from '../api/checkout';
import { useCart } from '../api/cart';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { i18n } from '../i18n/es';
import { formatMoney } from '../lib/formatters';
import { ApiError } from '../lib/http';
import {
  ShieldCheck,
  CreditCard,
  MapPin,
  Truck,
  Check,
  AlertCircle,
  Plus,
  Lock,
  ArrowRight,
} from 'lucide-react';

const emptyForm = { label: '', line1: '', city: '', province: '' };

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : i18n.common.error;
}

// 1. Indicador de 3 pasos numerados
function StepIndicator({ activeStep }: { activeStep: number }) {
  const steps = [
    { number: 1, label: i18n.checkout.step1.replace(/^[0-9.]+\s*/, '') },
    { number: 2, label: i18n.checkout.step2.replace(/^[0-9.]+\s*/, '') },
    { number: 3, label: i18n.checkout.step3.replace(/^[0-9.]+\s*/, '') },
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-xl mx-auto py-2 px-1 select-none">
      {steps.map((step, idx) => {
        const isCompleted = activeStep > step.number;
        const isActive = activeStep === step.number;

        return (
          <div key={step.number} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2.5">
              {/* Círculo del paso */}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors shrink-0 shadow-sm ${
                  isCompleted
                    ? 'bg-success text-brand-ink'
                    : isActive
                    ? 'bg-brand text-brand-ink ring-2 ring-brand/30'
                    : 'bg-surface-2 text-ink-muted border border-line'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" /> : step.number}
              </div>

              {/* Etiqueta del paso */}
              <span
                className={`text-xs whitespace-nowrap hidden sm:inline ${
                  isActive
                    ? 'font-semibold text-ink'
                    : isCompleted
                    ? 'font-medium text-ink-muted'
                    : 'text-ink-muted/70'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Línea conectora */}
            {idx < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-3 sm:mx-4 transition-colors ${
                  activeStep > step.number ? 'bg-success' : 'bg-line'
                }`}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Formulario de nueva dirección con inputs de 44 px
function NewAddressForm({
  onCreated,
  onCancel,
}: {
  onCreated: (id: string) => void;
  onCancel: () => void;
}) {
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

  const field = (
    key: keyof typeof emptyForm,
    label: string,
    placeholder: string,
  ) => (
    <div className="flex flex-col gap-1.5 text-xs font-semibold text-ink-muted">
      <label htmlFor={`addr-${key}`}>{label}</label>
      <input
        id={`addr-${key}`}
        className="w-full min-h-[44px] h-11 px-3.5 rounded-lg border border-line bg-surface text-sm text-ink placeholder-ink-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all shadow-sm"
        value={form[key]}
        placeholder={placeholder}
        required
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 rounded-xl border border-line bg-surface-2 p-4 sm:p-5 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {field('label', 'Etiqueta de la dirección', 'Ej. Casa, Departamento, Oficina')}
        {field('line1', 'Dirección física y número', 'Ej. Av. Los Libertadores 123 Dpto 401')}
        {field('city', 'Ciudad / Distrito', 'Ej. Miraflores, Lima')}
        {field('province', 'Provincia / Región', 'Ej. Lima')}
      </div>

      {create.isError && (
        <p className="text-xs text-danger flex items-center gap-1.5" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage(create.error)}</span>
        </p>
      )}

      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-line">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          size="sm"
          variant="primary"
          isLoading={create.isPending}
          className="font-semibold"
        >
          Guardar dirección
        </Button>
      </div>
    </form>
  );
}

// Paso 1: Dirección
function AddressStep(props: {
  addresses: Address[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <Card padding="lg" className="flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-mint text-brand shrink-0">
            <MapPin className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-sm sm:text-base font-semibold text-ink">
            {i18n.checkout.step1}
          </span>
        </div>
      </div>

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
                  ? 'border-brand bg-mint/40 ring-1 ring-brand/50 shadow-sm'
                  : 'border-line bg-surface hover:border-brand/30'
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
                <span className="font-semibold text-ink flex items-center gap-2">
                  {address.label}
                  {address.isDefault && (
                    <span className="rounded-md bg-mint text-brand px-1.5 py-0.5 text-xs font-semibold border border-mint-strong">
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
          className="self-start gap-1.5 text-xs font-medium"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{i18n.checkout.addAddress}</span>
        </Button>
      )}
    </Card>
  );
}

// 3. Pantalla de confirmación con círculo mint e icono Check de 64 px
function Confirmation() {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-center justify-center gap-6 py-12 max-w-xl mx-auto text-center animate-fade-in">
      {/* Círculo mint con icono Check de 64 px */}
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-mint text-brand border border-mint-strong shadow-sm">
        <Check className="h-16 w-16" strokeWidth={2.5} aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink">
          {i18n.checkout.successTitle}
        </h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          {i18n.checkout.successDesc}
        </p>
      </div>

      {/* Tarjeta de custodia segura */}
      <div className="rounded-xl border border-brand/30 bg-surface p-4 text-xs text-ink-muted leading-relaxed max-w-md shadow-sm">
        <div className="flex items-center justify-center gap-1.5 text-brand font-semibold mb-1">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span>Fondos en Custodia Segura TVS</span>
        </div>
        El importe abonado permanecerá retenido por el sistema TVS hasta que confirmes la entrega física satisfactoria de tus productos.
      </div>

      <Button
        size="lg"
        variant="primary"
        onClick={() => navigate('/pedidos')}
        className="font-semibold px-8 gap-2 shadow-sm text-base"
      >
        <span>{i18n.checkout.viewOrder}</span>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </section>
  );
}

export default function CheckoutPage() {
  const addresses = useAddresses();
  const { data: cart } = useCart(true);
  const createOrder = useCreateOrder();
  const pay = usePay();

  const [chosenId, setChosenId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [token, setToken] = useState('tok_ok');
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const list = addresses.data ?? [];
  const addressId = chosenId ?? list.find((a) => a.isDefault)?.id ?? list[0]?.id ?? null;

  // Paso activo en el indicador: Si tiene dirección seleccionada está en paso 3 (Pago)
  const activeStep = addressId ? 3 : 1;

  const handlePay = async () => {
    if (!addressId) return;
    setError(null);
    try {
      const id = orderId ?? (await createOrder.mutateAsync(addressId)).id;
      setOrderId(id);
      const result = await pay.mutateAsync({ orderId: id, token });
      if (typeof result.status === 'string' && result.status !== 'APROBADO') {
        setError(
          'El pago simulado fue rechazado por el emisor. Prueba con la tarjeta de prueba aprobada.',
        );
        return;
      }
      setPaid(true);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  if (paid) return <Confirmation />;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-6xl mx-auto">
      {/* Encabezado */}
      <PageHeader
        title={i18n.cart.checkout}
        titleClassName="font-display"
        description="Confirma tu dirección de entrega y completa el pago en custodia para proteger tu compra."
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Carrito', to: '/carrito' },
          { label: 'Pasarela de Pago' },
        ]}
      />

      {/* Indicador de 3 pasos numerados */}
      <StepIndicator activeStep={activeStep} />

      {/* Disposición en dos columnas: Izquierda pasos, Derecha resumen del pedido */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Pasos de Checkout */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Paso 1: Dirección */}
          <AddressStep
            addresses={list}
            selectedId={addressId}
            onSelect={setChosenId}
          />

          {/* Paso 2: Método de Envío */}
          <Card padding="lg" className="flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-line pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-mint text-brand shrink-0">
                <Truck className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="text-sm sm:text-base font-semibold text-ink">
                {i18n.checkout.step2}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-surface shadow-sm">
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-ink">
                  {i18n.checkout.shippingMethod}
                </span>
                <span className="text-ink-muted mt-0.5">
                  Coordinado y despachado directamente por cada comercio verificado
                </span>
              </div>
              <span className="text-xs font-semibold text-success bg-success/8 px-2.5 py-1 rounded-full border border-success/30">
                {i18n.checkout.shippingCost}
              </span>
            </div>
          </Card>

          {/* Paso 3: Tarjeta y Pago */}
          <Card padding="lg" className="flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-line pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-mint text-brand shrink-0">
                <CreditCard className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="text-sm sm:text-base font-semibold text-ink">
                {i18n.checkout.step3}
              </span>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              {i18n.checkout.paymentPrompt}
            </p>

            {/* Opciones de pago como tarjetas seleccionables con radio accesible */}
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
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand bg-mint/40 ring-1 ring-brand/50 shadow-sm'
                        : 'border-line bg-surface hover:border-brand/30'
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
                      <span className="font-semibold text-ink">{option.label}</span>
                      <span className="text-ink-muted mt-0.5 leading-relaxed">
                        {option.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 p-3.5 rounded-lg bg-danger/8 text-danger border border-danger/30 text-xs font-medium"
              >
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-3 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <Lock className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                <span>Cifrado TLS y tokenización segura</span>
              </div>

              {/* Botón de pago destacado */}
              <Button
                size="lg"
                variant="primary"
                className="w-full sm:w-auto font-semibold px-8 shadow-sm gap-2"
                disabled={!addressId || createOrder.isPending || pay.isPending}
                isLoading={createOrder.isPending || pay.isPending}
                onClick={handlePay}
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>
                  {i18n.checkout.confirmAndPay}{' '}
                  {cart?.total ? `— ${formatMoney(cart.total)}` : ''}
                </span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Columna Derecha: Resumen del Pedido Siempre Visible (Sticky en escritorio) */}
        <aside className="lg:col-span-5 w-full lg:sticky lg:top-24 flex flex-col gap-4">
          <Card padding="lg" className="flex flex-col gap-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink border-b border-line pb-3">
              Resumen de la Compra
            </h2>

            {cart && cart.groups.length > 0 ? (
              <>
                {/* Desglose por comercio */}
                <div className="flex flex-col gap-3 border-b border-line pb-3">
                  <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                    Artículos por comercio
                  </span>
                  {cart.groups.map((group) => (
                    <div key={group.sellerId} className="flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-ink truncate max-w-[170px]">{group.storeName}</span>
                        <span className="font-semibold text-ink tabular">{formatMoney(group.subtotal)}</span>
                      </div>
                      <span className="text-ink-muted text-xs">
                        {group.items.length} {group.items.length === 1 ? 'artículo' : 'artículos'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Métricas del pedido */}
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between text-ink-muted">
                    <span>Total de artículos:</span>
                    <span className="font-semibold text-ink tabular">{cart.totalItems}</span>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <span>Costo de envío:</span>
                    <span className="text-brand font-semibold">Gratis</span>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <span>Custodia de pago (Escrow):</span>
                    <span className="text-brand font-semibold">Gratis</span>
                  </div>
                </div>

                {/* Total destacado */}
                <div className="pt-3 border-t border-line flex items-baseline justify-between">
                  <span className="text-base font-semibold text-ink">Total a pagar:</span>
                  <span className="text-2xl font-semibold text-brand tabular">
                    {formatMoney(cart.total)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs text-ink-muted">Cargando datos del pedido...</p>
            )}

            {/* Aviso de seguridad */}
            <div className="flex items-start gap-2.5 pt-2 border-t border-line text-xs text-ink-muted leading-relaxed">
              <ShieldCheck className="h-4 w-4 text-brand shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Transacción con custodia simulada. El dinero solo se entrega al comercio tras tu verificación de conformidad.
              </span>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

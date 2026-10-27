import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAddresses, useCreateAddress, useCreateOrder, usePay, type Address } from '../api/checkout';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';
import { ApiError } from '../lib/http';

const emptyForm = { label: '', line1: '', city: '', province: '' };
const inputClass =
  'w-full min-h-[44px] rounded-xl border border-line bg-bg px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : i18n.common.error;
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-2 p-5">
      <h2 className="font-bold text-brand">{title}</h2>
      {children}
    </div>
  );
}

function NewAddressForm({ onCreated }: { onCreated: (id: string) => void }) {
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

  const field = (key: keyof typeof emptyForm, label: string) => (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <input
        className={inputClass}
        value={form[key]}
        required
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </label>
  );

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      {field('label', 'Etiqueta (ej. Casa)')}
      {field('line1', 'Dirección')}
      {field('city', 'Ciudad')}
      {field('province', 'Provincia')}
      <div className="sm:col-span-2 flex flex-col items-start gap-2">
        {create.isError && <p className="text-sm text-red-400">{errorMessage(create.error)}</p>}
        <Button type="submit" size="sm" isLoading={create.isPending}>
          {i18n.common.save}
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
    <Step title={i18n.checkout.step1}>
      {props.addresses.length === 0 && !showForm && (
        <p className="text-sm text-ink-muted">{i18n.checkout.addressPrompt}</p>
      )}
      {props.addresses.map((address) => (
        <label key={address.id} className="flex items-start gap-3 text-sm">
          <input
            type="radio"
            name="address"
            checked={props.selectedId === address.id}
            onChange={() => props.onSelect(address.id)}
          />
          <span>
            <strong>{address.label}</strong> · {address.line1}, {address.city}, {address.province}
          </span>
        </label>
      ))}
      {showForm ? (
        <NewAddressForm
          onCreated={(id) => {
            props.onSelect(id);
            setShowForm(false);
          }}
        />
      ) : (
        <Button variant="secondary" size="sm" className="self-start" onClick={() => setShowForm(true)}>
          {i18n.checkout.addAddress}
        </Button>
      )}
    </Step>
  );
}

function Confirmation() {
  return (
    <section className="flex flex-col items-start gap-4 py-6">
      <h1 className="text-2xl font-bold text-brand">{i18n.checkout.successTitle}</h1>
      <p className="text-ink-muted">{i18n.checkout.successDesc}</p>
      <Link to="/pedidos" className="font-semibold text-brand underline">
        {i18n.checkout.viewOrder}
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
        setError('El pago fue rechazado. Puedes intentarlo de nuevo con otra tarjeta.');
        return;
      }
      setPaid(true);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  if (paid) return <Confirmation />;

  return (
    <section className="flex flex-col gap-6 max-w-3xl">
      <h1 className="text-2xl font-bold">{i18n.cart.checkout}</h1>
      <AddressStep addresses={list} selectedId={addressId} onSelect={setChosenId} />
      <Step title={i18n.checkout.step2}>
        <p className="text-sm text-ink-muted">
          {i18n.checkout.shippingMethod} · {i18n.checkout.shippingCost}
        </p>
      </Step>
      <Step title={i18n.checkout.step3}>
        <p className="text-sm text-ink-muted">{i18n.checkout.paymentPrompt}</p>
        {[
          { value: 'tok_ok', label: i18n.checkout.testCardOk },
          { value: 'tok_fail', label: i18n.checkout.testCardFail },
        ].map((option) => (
          <label key={option.value} className="flex items-center gap-3 text-sm">
            <input
              type="radio"
              name="token"
              checked={token === option.value}
              onChange={() => setToken(option.value)}
            />
            {option.label}
          </label>
        ))}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button
          size="lg"
          className="self-start"
          disabled={!addressId}
          isLoading={createOrder.isPending || pay.isPending}
          onClick={handlePay}
        >
          {i18n.checkout.confirmAndPay}
        </Button>
      </Step>
    </section>
  );
}
import { useState, type FormEvent } from 'react';
import { useMe, useUpdateProfile } from '../api/auth';
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useUpdateAddress,
  type Address,
  type NewAddress,
} from '../api/checkout';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { i18n } from '../i18n/es';
import { ApiError } from '../lib/http';

const inputClass =
  'w-full min-h-[44px] rounded-xl border border-line bg-bg px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : i18n.common.error;
}

function ProfileForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const update = useUpdateProfile();

  function submit(event: FormEvent) {
    event.preventDefault();
    update.mutate(name.trim());
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-2 p-5">
      <h2 className="font-bold">Datos personales</h2>
      <label className="flex flex-col gap-1 text-sm">
        Nombre completo
        <input className={inputClass} value={name} required minLength={2} onChange={(e) => setName(e.target.value)} />
      </label>
      {update.isError && <p className="text-sm text-red-400">{errorMessage(update.error)}</p>}
      {update.isSuccess && <p className="text-sm text-brand">{i18n.common.success}</p>}
      <Button type="submit" size="sm" className="self-start" isLoading={update.isPending}>
        {i18n.common.save}
      </Button>
    </form>
  );
}

function AddressForm({ address, onDone }: { address?: Address; onDone: () => void }) {
  const create = useCreateAddress();
  const update = useUpdateAddress();
  const [form, setForm] = useState<NewAddress>({
    label: address?.label ?? '',
    line1: address?.line1 ?? '',
    city: address?.city ?? '',
    province: address?.province ?? '',
    isDefault: address?.isDefault ?? false,
  });
  const pending = create.isPending || update.isPending;
  const error = create.error ?? update.error;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (address) {
      update.mutate({ id: address.id, data: form }, { onSuccess: onDone });
    } else {
      create.mutate(form, { onSuccess: onDone });
    }
  }

  const field = (key: 'label' | 'line1' | 'city' | 'province', label: string) => (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <input
        className={inputClass}
        required
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </label>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      {field('label', 'Etiqueta (Casa, Oficina)')}
      {field('line1', 'Dirección')}
      {field('city', 'Ciudad')}
      {field('province', 'Provincia')}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isDefault ?? false}
          onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
        />
        Dirección predeterminada
      </label>
      {error && <p className="text-sm text-red-400">{errorMessage(error)}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onDone}>
          {i18n.common.cancel}
        </Button>
        <Button type="submit" size="sm" isLoading={pending}>
          {i18n.common.save}
        </Button>
      </div>
    </form>
  );
}

export default function AccountPage() {
  const { data: user } = useMe();
  const { data: addresses, isLoading, isError } = useAddresses();
  const remove = useDeleteAddress();
  const [editing, setEditing] = useState<Address | 'new' | null>(null);

  return (
    <section className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-bold">Mi cuenta</h1>
      {user && <p className="text-sm text-ink-muted">{user.email}</p>}

      {user && <ProfileForm key={user.id} initialName={user.fullName ?? ''} />}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold">Mis direcciones</h2>
        <Button size="sm" onClick={() => setEditing('new')}>
          {i18n.checkout.addAddress}
        </Button>
      </div>

      {isLoading && <div className="h-24 animate-pulse rounded-2xl bg-surface-2" />}
      {isError && <p className="text-sm text-red-400">{i18n.common.error}</p>}
      {addresses && addresses.length === 0 && (
        <p className="text-sm text-ink-muted">Aún no tienes direcciones guardadas.</p>
      )}

      {addresses?.map((address) => (
        <article
          key={address.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface-2 p-4"
        >
          <div>
            <p className="font-bold">
              {address.label}
              {address.isDefault && (
                <span className="ml-2 rounded-full border border-brand/50 px-2 py-0.5 text-xs text-brand">
                  Predeterminada
                </span>
              )}
            </p>
            <p className="text-sm text-ink-muted">
              {address.line1}, {address.city}, {address.province}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing(address)}>
              {i18n.common.edit}
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={remove.isPending && remove.variables === address.id}
              onClick={() => {
                if (window.confirm(`¿Eliminar "${address.label}"?`)) remove.mutate(address.id);
              }}
            >
              {i18n.common.delete}
            </Button>
          </div>
        </article>
      ))}
      {remove.isError && <p className="text-sm text-red-400">{errorMessage(remove.error)}</p>}

      <Modal
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' || editing === null ? i18n.checkout.addAddress : i18n.common.edit}
      >
        {editing !== null && (
          <AddressForm
            key={editing === 'new' ? 'new' : editing.id}
            address={editing === 'new' ? undefined : editing}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>
    </section>
  );
}
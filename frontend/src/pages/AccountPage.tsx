import { useState, type FormEvent } from 'react';
import { useMe, useUpdateProfile, useChangePassword } from '../api/auth';
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useUpdateAddress,
  type Address,
  type NewAddress,
} from '../api/checkout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/ui/PageHeader';
import { Skeleton } from '../components/ui/Skeleton';
import { Input } from '../components/ui/Input';
import { Tabs } from '../components/ui/Tabs';
import { i18n } from '../i18n/es';
import { ApiError } from '../lib/http';
import {
  User,
  KeyRound,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

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
    <Card padding="lg" className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-line/60">
        <User className="h-5 w-5 text-brand" />
        <h2 className="text-base font-semibold text-ink">Datos Personales</h2>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input
          label="Nombre completo"
          value={name}
          required
          minLength={2}
          onChange={(e) => setName(e.target.value)}
        />

        {update.isError && (
          <p className="text-xs text-danger flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{errorMessage(update.error)}</span>
          </p>
        )}

        {update.isSuccess && (
          <p className="text-xs text-brand flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{i18n.common.success}</span>
          </p>
        )}

        <Button
          type="submit"
          size="sm"
          className="self-start font-semibold px-5"
          isLoading={update.isPending}
        >
          {i18n.common.save}
        </Button>
      </form>
    </Card>
  );
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const changePassword = useChangePassword();

  function submit(event: FormEvent) {
    event.preventDefault();
    setValidationError('');
    if (newPassword.length < 12) {
      setValidationError('La nueva contraseña debe tener al menos 12 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('Las contraseñas no coinciden.');
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      },
    );
  }

  return (
    <Card padding="lg" className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-line/60">
        <KeyRound className="h-5 w-5 text-brand" />
        <div className="flex flex-col">
          <h2 className="text-base font-semibold text-ink">Seguridad y Contraseña</h2>
          <span className="text-xs text-ink-muted">
            Al actualizar tu contraseña, se revocarán automáticamente todas las demás sesiones activas.
          </span>
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input
          label="Contraseña actual"
          type="password"
          value={currentPassword}
          required
          autoComplete="current-password"
          placeholder="••••••••••••"
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <Input
          label="Nueva contraseña"
          helperText="Mínimo 12 caracteres"
          type="password"
          value={newPassword}
          required
          minLength={12}
          autoComplete="new-password"
          placeholder="••••••••••••"
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <Input
          label="Confirmar nueva contraseña"
          type="password"
          value={confirmPassword}
          required
          minLength={12}
          autoComplete="new-password"
          placeholder="••••••••••••"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {validationError && (
          <p className="text-xs text-danger flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{validationError}</span>
          </p>
        )}

        {changePassword.isError && (
          <p className="text-xs text-danger flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{errorMessage(changePassword.error)}</span>
          </p>
        )}

        {changePassword.isSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-brand-soft text-brand border border-brand/30 text-xs font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Contraseña actualizada correctamente. Las demás sesiones activas han sido invalidadas.</span>
          </div>
        )}

        <Button
          type="submit"
          size="sm"
          className="self-start font-semibold px-5"
          isLoading={changePassword.isPending}
        >
          Actualizar contraseña
        </Button>
      </form>
    </Card>
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

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Etiqueta"
          placeholder="Ej. Casa, Oficina"
          required
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
        />
        <Input
          label="Dirección física"
          placeholder="Ej. Calle 123 Dpto 4"
          required
          value={form.line1}
          onChange={(e) => setForm({ ...form, line1: e.target.value })}
        />
        <Input
          label="Ciudad / Distrito"
          placeholder="Ej. Miraflores"
          required
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <Input
          label="Provincia / Región"
          placeholder="Ej. Lima"
          required
          value={form.province}
          onChange={(e) => setForm({ ...form, province: e.target.value })}
        />
      </div>

      <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.isDefault ?? false}
          onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
        />
        <span>Establecer como dirección predeterminada</span>
      </label>

      {error && (
        <p className="text-xs text-danger flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{errorMessage(error)}</span>
        </p>
      )}

      <div className="flex justify-end gap-2 pt-3 border-t border-line/50">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          {i18n.common.cancel}
        </Button>
        <Button type="submit" size="sm" isLoading={pending} className="font-semibold px-5">
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
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);
  const [activeTab, setActiveTab] = useState('perfil');

  const tabs = [
    { id: 'perfil', label: 'Datos Personales', icon: <User className="h-4 w-4" /> },
    { id: 'seguridad', label: 'Seguridad y Acceso', icon: <KeyRound className="h-4 w-4" /> },
    { id: 'direcciones', label: 'Direcciones de Entrega', count: addresses?.length, icon: <MapPin className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      <PageHeader
        title="Mi Cuenta"
        description="Gestiona tu información personal, seguridad de acceso y libreta de direcciones de entrega."
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Mi Cuenta' },
        ]}
      />

      {/* Tarjeta de Resumen de Usuario */}
      {user && (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-line bg-surface">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/15 text-brand font-semibold text-base border border-brand/30">
            {(user.fullName || user.email || 'U').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-ink">{user.fullName || 'Usuario'}</span>
            <span className="text-xs text-ink-muted">{user.email}</span>
          </div>
          <div className="ml-auto">
            <Badge variant="brand" size="md">
              {i18n.roles[user.role]}
            </Badge>
          </div>
        </div>
      )}

      {/* Pestañas */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Formulario de Perfil */}
      {activeTab === 'perfil' && user && (
        <div className="animate-fade-in">
          <ProfileForm key={user.id} initialName={user.fullName ?? ''} />
        </div>
      )}

      {/* Formulario de Contraseña Segura */}
      {activeTab === 'seguridad' && user && (
        <div className="animate-fade-in">
          <ChangePasswordForm />
        </div>
      )}

      {/* Libreta de Direcciones */}
      {activeTab === 'direcciones' && (
        <div className="animate-fade-in">
          <Card padding="lg" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line/60">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand" />
                <h2 className="text-base font-semibold text-ink">Mis Direcciones de Entrega</h2>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="gap-1.5 text-xs font-semibold"
                onClick={() => setEditing('new')}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{i18n.checkout.addAddress}</span>
              </Button>
            </div>

            {isLoading && (
              <div className="flex flex-col gap-2">
                <Skeleton variant="block" className="h-16 w-full" />
                <Skeleton variant="block" className="h-16 w-full" />
              </div>
            )}

            {isError && (
              <p className="text-xs text-danger">{i18n.common.error}</p>
            )}

            {addresses && addresses.length === 0 && (
              <p className="text-xs text-ink-muted py-4 text-center">
                Aún no tienes direcciones registradas. Agrega una para agilizar tus compras.
              </p>
            )}

            {addresses && addresses.length > 0 && (
              <div className="flex flex-col gap-3">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-line bg-surface-2/40 hover:border-line-soft transition-colors"
                  >
                    <div className="flex flex-col text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink">{address.label}</span>
                        {address.isDefault && (
                          <span className="rounded-md bg-brand-soft px-1.5 py-0.5 text-xs font-medium text-brand border border-brand/20">
                            Predeterminada
                          </span>
                        )}
                      </div>
                      <span className="text-ink-muted mt-0.5">
                        {address.line1}, {address.city}, {address.province}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs px-2.5"
                        onClick={() => setEditing(address)}
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" />
                        {i18n.common.edit}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="h-8 text-xs px-2.5"
                        isLoading={remove.isPending && remove.variables === address.id}
                        onClick={() => setDeletingAddress(address)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        {i18n.common.delete}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {remove.isError && (
              <p className="text-xs text-danger mt-1">{errorMessage(remove.error)}</p>
            )}
          </Card>
        </div>
      )}

      {/* Modal para Crear o Editar Dirección */}
      <Modal
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' || editing === null ? i18n.checkout.addAddress : i18n.common.edit}
        size="md"
      >
        {editing !== null && (
          <AddressForm
            key={editing === 'new' ? 'new' : editing.id}
            address={editing === 'new' ? undefined : editing}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>

      {/* Modal de Confirmación para Eliminar Dirección */}
      <Modal
        isOpen={deletingAddress !== null}
        onClose={() => setDeletingAddress(null)}
        title="Eliminar Dirección de Entrega"
        size="sm"
      >
        {deletingAddress && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-ink-muted leading-relaxed">
              ¿Estás seguro de que deseas eliminar la dirección{' '}
              <strong className="text-ink">"{deletingAddress.label}"</strong> ({deletingAddress.line1}, {deletingAddress.city})? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-line/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeletingAddress(null)}
              >
                {i18n.common.cancel}
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={remove.isPending}
                onClick={() => {
                  remove.mutate(deletingAddress.id, {
                    onSuccess: () => setDeletingAddress(null),
                  });
                }}
              >
                {i18n.common.delete}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

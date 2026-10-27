import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin, useRegister } from '../api/auth';
import { ApiError } from '../lib/http';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const login = useLogin();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const busy = register.isPending || login.isPending;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);

    if (password.length < 12) {
      setLocalError('La contraseña debe tener al menos 12 caracteres.');
      return;
    }

    register.mutate(
      { fullName: fullName.trim(), email: email.trim(), password },
      {
        onSuccess: () => {
          // Tras registrarse, inicia sesión automáticamente.
          login.mutate(
            { email: email.trim(), password },
            { onSuccess: () => navigate('/catalogo') },
          );
        },
      },
    );
  }

  let errorMessage: string | null = localError;
  if (!errorMessage && register.error) {
    errorMessage =
      register.error instanceof ApiError && register.error.status === 409
        ? 'Ya existe una cuenta con ese correo.'
        : register.error instanceof ApiError && register.error.status === 400
          ? register.error.message
          : i18n.common.error;
  }
  if (!errorMessage && login.error) {
    errorMessage = 'Tu cuenta se creó, pero no se pudo iniciar sesión. Intenta desde Iniciar Sesión.';
  }

  const inputClass =
    'rounded-2xl border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-brand';

  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-2xl font-bold">{i18n.nav.register}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Nombre completo
          <input
            type="text"
            required
            minLength={2}
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Correo
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Contraseña (mínimo 12 caracteres)
          <input
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>

        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

        <Button type="submit" disabled={busy}>
          {busy ? i18n.common.loading : i18n.nav.register}
        </Button>
      </form>

      <p className="text-sm text-ink-muted">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-brand">
          {i18n.nav.login}
        </Link>
      </p>
    </section>
  );
}
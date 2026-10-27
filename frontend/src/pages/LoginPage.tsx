import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../api/auth';
import { ApiError } from '../lib/http';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    login.mutate(
      { email, password },
      { onSuccess: () => navigate('/catalogo') },
    );
  }

  const errorMessage =
    login.error instanceof ApiError && login.error.status === 401
      ? 'Correo o contraseña incorrectos.'
      : login.error
        ? i18n.common.error
        : null;

  const inputClass =
    'rounded-2xl border border-line bg-surface-2 px-3 py-2 text-ink outline-none focus:border-brand';

  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-2xl font-bold">{i18n.nav.login}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
          Contraseña
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>

        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

        <Button type="submit" disabled={login.isPending}>
          {login.isPending ? i18n.common.loading : i18n.nav.login}
        </Button>
      </form>

      <p className="text-sm text-ink-muted">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="text-brand">
          {i18n.nav.register}
        </Link>
      </p>
    </section>
  );
}
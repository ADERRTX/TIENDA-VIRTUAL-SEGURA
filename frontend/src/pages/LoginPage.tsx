import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../api/auth';
import { ApiError } from '../lib/http';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { i18n } from '../i18n/es';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: (user) => {
          if (user.role === 'ADMIN') {
            navigate('/admin/vendedores');
          } else if (user.role === 'SUPPORT') {
            navigate('/envios');
          } else if (user.role === 'SELLER') {
            navigate('/vendedor/pedidos');
          } else {
            navigate('/catalogo');
          }
        },
      },
    );
  }

  const errorMessage =
    login.error instanceof ApiError && (login.error.code === 'ACCOUNT_LOCKED' || login.error.status === 423)
      ? login.error.message || 'Cuenta bloqueada temporalmente por 15 minutos debido a múltiples intentos fallidos.'
      : login.error instanceof ApiError && login.error.code === 'USER_BLOCKED'
        ? login.error.message || 'Tu cuenta ha sido bloqueada por la administración.'
        : login.error instanceof ApiError && login.error.status === 401
          ? 'Correo o contraseña incorrectos.'
          : login.error
            ? i18n.common.error
            : null;

  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center py-8">
      <Card padding="lg" className="w-full max-w-md shadow-2xl flex flex-col gap-6">
        {/* Encabezado con Icono */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 border border-brand/30 text-brand shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-ink-muted">
            Acceso seguro a Tienda Virtual Segura con protección de credenciales Argon2id.
          </p>
        </div>

        {/* Mensaje de Error */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-danger-soft text-danger border border-danger/30 text-xs font-medium animate-shake">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-ink">
            <span>Correo electrónico</span>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-lg border border-line bg-surface-2 text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-ink">
            <span>Contraseña</span>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-lg border border-line bg-surface-2 text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all"
              />
            </div>
          </label>

          <Button
            type="submit"
            size="lg"
            variant="primary"
            isLoading={login.isPending}
            className="w-full font-bold mt-2 shadow-lg shadow-brand/10"
          >
            <span>{login.isPending ? i18n.common.loading : i18n.nav.login}</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </form>

        {/* Pie de tarjeta con link de registro */}
        <div className="pt-4 border-t border-line/60 text-center text-xs text-ink-muted">
          ¿No tienes una cuenta aún?{' '}
          <Link to="/registro" className="font-bold text-brand hover:text-brand-hover underline">
            {i18n.nav.register}
          </Link>
        </div>
      </Card>
    </div>
  );
}

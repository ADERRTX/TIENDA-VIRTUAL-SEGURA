import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin, useRegister } from '../api/auth';
import { ApiError } from '../lib/http';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { i18n } from '../i18n/es';
import { ShieldCheck, User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

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
      setLocalError('La contraseña debe tener al menos 12 caracteres por seguridad.');
      return;
    }

    register.mutate(
      { fullName: fullName.trim(), email: email.trim(), password },
      {
        onSuccess: () => {
          // Tras registrarse, inicia sesión automáticamente
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
        ? 'Ya existe una cuenta registrada con ese correo electrónico.'
        : register.error instanceof ApiError && register.error.status === 400
          ? register.error.message
          : i18n.common.error;
  }
  if (!errorMessage && login.error) {
    errorMessage = 'Tu cuenta se creó exitosamente, pero no se pudo iniciar sesión automática. Por favor inicia sesión manualmente.';
  }

  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center py-8">
      <Card padding="lg" className="w-full max-w-md shadow-2xl flex flex-col gap-6">
        {/* Encabezado */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 border border-brand/30 text-brand shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
            Crear Cuenta Segura
          </h1>
          <p className="text-xs text-ink-muted">
            Regístrate para comprar y vender con custodia y protección de identidad.
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
            <span>Nombre completo</span>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
              <input
                type="text"
                required
                minLength={2}
                autoComplete="name"
                placeholder="Nombre y Apellidos"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-lg border border-line bg-surface-2 text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all"
              />
            </div>
          </label>

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
            <div className="flex justify-between items-baseline">
              <span>Contraseña segura</span>
              <span className="text-[10px] text-ink-muted">Mínimo 12 caracteres</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
              <input
                type="password"
                required
                minLength={12}
                autoComplete="new-password"
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
            isLoading={busy}
            className="w-full font-bold mt-2 shadow-lg shadow-brand/10"
          >
            <span>{busy ? i18n.common.loading : i18n.nav.register}</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </form>

        {/* Pie de tarjeta con link de login */}
        <div className="pt-4 border-t border-line/60 text-center text-xs text-ink-muted">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-bold text-brand hover:text-brand-hover underline">
            {i18n.nav.login}
          </Link>
        </div>
      </Card>
    </div>
  );
}

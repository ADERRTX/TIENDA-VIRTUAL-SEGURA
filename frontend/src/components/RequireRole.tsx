import { Link, Outlet } from 'react-router-dom';
import { useMe, type UserRole } from '../api/auth';
import { Skeleton } from './ui/Skeleton';
import { i18n } from '../i18n/es';

export default function RequireRole({ roles }: { roles: UserRole[] }) {
  const { data: user, isLoading } = useMe();

  if (isLoading) {
    return <Skeleton variant="block" className="h-32 w-full rounded-xl" />;
  }

  if (!user) {
    return (
      <section className="flex flex-col items-start gap-3">
        <p className="text-ink-muted">Inicia sesión para continuar.</p>
        <Link to="/login" className="font-semibold text-brand underline">
          {i18n.nav.login}
        </Link>
      </section>
    );
  }

  if (!roles.includes(user.role)) {
    return <p className="text-ink-muted">No tienes permiso para ver esta página.</p>;
  }

  return <Outlet />;
}
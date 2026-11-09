import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Compass, Home, ShoppingBag } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-20rem)] items-center justify-center py-12">
      <Card padding="lg" className="w-full max-w-lg shadow-2xl flex flex-col items-center text-center gap-6 animate-scale-in">
        {/* Icono central */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 border border-brand/30 text-brand shadow-sm">
          <Compass className="h-8 w-8 animate-pulse" />
        </div>

        {/* Cifra 404 */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-brand uppercase tracking-widest">
            Error 404 · Ruta no encontrada
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Página No Encontrada
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-sm">
            La dirección que buscas no existe, ha sido trasladada o requiere permisos de acceso adicionales.
          </p>
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            size="md"
            variant="primary"
            onClick={() => navigate('/')}
            className="font-bold text-xs gap-2"
          >
            <Home className="h-4 w-4" />
            <span>Volver al Inicio</span>
          </Button>

          <Button
            size="md"
            variant="secondary"
            onClick={() => navigate('/catalogo')}
            className="font-medium text-xs gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Explorar Catálogo</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}

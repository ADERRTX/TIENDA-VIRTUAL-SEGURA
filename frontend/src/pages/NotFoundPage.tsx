import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-start gap-4 py-6">
      <h1 className="text-2xl font-bold">Página no encontrada</h1>
      <p className="text-ink-muted">La página que buscas no existe o aún no está disponible.</p>
      <Button variant="secondary" onClick={() => navigate('/')}>
        {i18n.common.back}
      </Button>
    </section>
  );
}
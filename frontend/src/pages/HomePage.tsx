import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-start gap-6 py-6">
      <h1 className="text-3xl md:text-4xl font-bold">{i18n.app.name}</h1>
      <p className="text-lg text-ink-muted max-w-2xl">{i18n.app.tagline}</p>

      <div className="rounded-2xl border border-line bg-surface-2 p-5 max-w-2xl">
        <h2 className="font-bold text-brand mb-1">{i18n.app.protectedPurchase}</h2>
        <p className="text-sm text-ink-muted">{i18n.app.protectedPurchaseDesc}</p>
      </div>

      <Button size="lg" onClick={() => navigate('/catalogo')}>
        {i18n.cart.startShopping}
      </Button>
    </section>
  );
}
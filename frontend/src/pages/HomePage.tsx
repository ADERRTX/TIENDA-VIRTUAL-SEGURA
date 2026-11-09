import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { i18n } from '../i18n/es';
import {
  ShieldCheck,
  Truck,
  Scale,
  ArrowRight,
  Lock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-16 py-4 sm:py-8">
      {/* 1. HERO SECTION */}
      <section className="relative flex flex-col items-start gap-6 pt-4 pb-8 max-w-4xl">
        {/* Badge superior de confianza */}
        <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-soft px-3.5 py-1 text-xs font-semibold text-brand animate-fade-in">
          <ShieldCheck className="h-4 w-4" />
          <span>Custodia de Pagos Segura (Escrow) 100% Protegida</span>
        </div>

        {/* Titular Principal */}
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-ink leading-[1.15]">
          Tu dinero seguro, tus compras protegidas con{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-hover to-teal-200">
            custodia real
          </span>
          .
        </h1>

        {/* Subtítulo descriptivo */}
        <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl">
          {i18n.app.tagline}. Retenemos el pago de tu compra hasta que recibes tu pedido en perfecto estado y confirmas tu satisfacción. Cero riesgo para ti, máxima confianza para el vendedor.
        </p>

        {/* Botones de Acción */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/catalogo')}
            className="gap-2 font-medium"
          >
            <span>{i18n.cart.startShopping}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/vender')}
            className="gap-2 font-medium"
          >
            <span>Vender en TVS</span>
          </Button>
        </div>

        {/* Micro-garantías rápidas */}
        <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-ink-muted">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-brand" />
            <span>Fondos retenidos hasta entrega</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-brand" />
            <span>Envíos con guía verificable</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-brand" />
            <span>Mediación de reclamos formal</span>
          </div>
        </div>
      </section>

      {/* 2. LOS 3 PILARES DE SEGURIDAD (CARDS) */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-brand uppercase tracking-wider">
            Arquitectura de Confianza
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink">
            ¿Por qué comprar y vender en TVS?
          </h2>
          <p className="text-sm text-ink-muted max-w-xl">
            Diseñamos cada transacción bajo un modelo criptográfico con trazabilidad completa y reglas de negocio inmutables.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pilar 1 */}
          <Card padding="lg" className="flex flex-col gap-4 relative overflow-hidden group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 border border-brand/30 text-brand">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-ink">Custodia de Fondos (Escrow)</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              Al pagar, tu dinero no viaja a la cuenta del vendedor. Permanece en custodia bancaria blindada. Solo se libera cuando confirmas que recibiste el producto acordado.
            </p>
            <div className="mt-auto pt-2 flex items-center gap-1.5 text-xs text-brand font-semibold">
              <span>Protección anti-estafa</span>
            </div>
          </Card>

          {/* Pilar 2 */}
          <Card padding="lg" className="flex flex-col gap-4 relative overflow-hidden group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10 border border-info/30 text-info">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-ink">Logística y Despacho Trazable</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              Cada paquete cuenta con empresa transportista y número de guía. Si el vendedor no despacha en los plazos estipulados por el sistema, tu compra se cancela y se reembolsa íntegra.
            </p>
            <div className="mt-auto pt-2 flex items-center gap-1.5 text-xs text-info font-semibold">
              <span>Tiempos de entrega auditados</span>
            </div>
          </Card>

          {/* Pilar 3 */}
          <Card padding="lg" className="flex flex-col gap-4 relative overflow-hidden group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 border border-warning/30 text-warning">
              <Scale className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-ink">Mediación Imparcial</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              ¿El producto llegó defectuoso o no corresponde a la descripción? Abre un reclamo formal con evidencia. Nuestro equipo de soporte dictamina con facultad de reembolso y reposición.
            </p>
            <div className="mt-auto pt-2 flex items-center gap-1.5 text-xs text-warning font-semibold">
              <span>Resolución con arbitraje</span>
            </div>
          </Card>
        </div>
      </section>

      {/* 3. CÓMO FUNCIONA EL FLUJO DE PROTECCIÓN */}
      <section className="rounded-xl border border-line bg-surface p-6 sm:p-10 flex flex-col gap-8">
        <div className="flex flex-col gap-2 text-center items-center">
          <span className="text-xs font-semibold text-brand uppercase tracking-wider">
            Paso a Paso
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink">
            El ciclo de compra segura en 4 pasos
          </h2>
          <p className="text-sm text-ink-muted max-w-lg">
            Todo el proceso está automatizado y auditado para tu absoluta tranquilidad.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-brand-ink font-semibold text-sm">
              1
            </div>
            <h4 className="font-semibold text-sm text-ink">Eliges y Pagas</h4>
            <p className="text-xs text-ink-muted">
              Seleccionas tu producto y realizas el pago. El dinero queda protegido en custodia.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 border border-line text-ink font-semibold text-sm">
              2
            </div>
            <h4 className="font-semibold text-sm text-ink">El Vendedor Prepara</h4>
            <p className="text-xs text-ink-muted">
              El comercio empaqueta tu pedido y registra el número de guía del transportista.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 border border-line text-ink font-semibold text-sm">
              3
            </div>
            <h4 className="font-semibold text-sm text-ink">Recibes y Verificas</h4>
            <p className="text-xs text-ink-muted">
              Recibes el paquete en tu dirección y tienes plazo para revisar que todo esté conforme.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 border border-line text-brand font-semibold text-sm">
              4
            </div>
            <h4 className="font-semibold text-sm text-ink">Liberación Conforme</h4>
            <p className="text-xs text-ink-muted">
              Confirmas la recepción en el sistema y los fondos son liberados al vendedor.
            </p>
          </div>
        </div>
      </section>

      {/* 4. BANNER CTA FINAL */}
      <section className="relative overflow-hidden rounded-xl border border-brand/40 bg-gradient-to-r from-surface to-surface-2 p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 ">
        <div className="flex flex-col gap-2 max-w-xl text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-brand text-xs font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>Explora el Catálogo Verificado</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-semibold text-ink">
            ¿Listo para comprar con total protección?
          </h3>
          <p className="text-sm text-ink-muted">
            Encuentra productos verificados de vendedores calificados con soporte en cada paso.
          </p>
        </div>

        <Button
          size="lg"
          variant="primary"
          onClick={() => navigate('/catalogo')}
          className="shrink-0 font-semibold gap-2 px-8"
        >
          <span>Ir a la Tienda</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </section>
    </div>
  );
}

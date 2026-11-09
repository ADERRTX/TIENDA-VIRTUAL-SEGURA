import React from 'react';
import { Badge } from './Badge';
import { i18n } from '../../i18n/es';

export type StatusCategory = 'order' | 'claim' | 'seller' | 'product' | 'user';

export interface StatusBadgeProps {
  status: string;
  category?: StatusCategory;
  dot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

type BadgeVariant = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const ORDER_VARIANTS: Record<string, BadgeVariant> = {
  PENDIENTE_PAGO: 'warning',
  PAGADO: 'info',
  CONFIRMADO: 'info',
  EN_PREPARACION: 'info',
  DESPACHADO: 'info',
  EN_TRANSITO: 'info',
  EN_REPARTO: 'info',
  ENTREGADO: 'success',
  FINALIZADO: 'success',
  CANCELADO: 'neutral',
  RECLAMADO: 'warning',
  DEVUELTO: 'neutral',
  REEMBOLSADO: 'neutral',
};

const CLAIM_VARIANTS: Record<string, BadgeVariant> = {
  ABIERTO: 'warning',
  EN_RESPUESTA: 'info',
  RESUELTO: 'success',
  APELADO: 'warning',
  CERRADO: 'neutral',
};

const CLAIM_LABELS: Record<string, string> = {
  ABIERTO: 'Abierto',
  EN_RESPUESTA: 'En respuesta',
  RESUELTO: 'Resuelto',
  APELADO: 'Apelado',
  CERRADO: 'Cerrado',
};

const SELLER_VARIANTS: Record<string, BadgeVariant> = {
  PENDING: 'warning',
  ACTIVE: 'success',
  SUSPENDED: 'danger',
  REJECTED: 'danger',
};

const PRODUCT_VARIANTS: Record<string, BadgeVariant> = {
  ACTIVE: 'success',
  DRAFT: 'neutral',
  PAUSED: 'warning',
  REMOVED: 'danger',
};

const USER_VARIANTS: Record<string, BadgeVariant> = {
  ACTIVE: 'success',
  BLOCKED: 'danger',
  LOCKED: 'warning',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  category = 'order',
  dot = true,
  size = 'md',
  className = '',
}) => {
  const normStatus = (status || '').toUpperCase();

  let variant: BadgeVariant = 'neutral';
  let label = normStatus;

  if (category === 'order' || ORDER_VARIANTS[normStatus]) {
    variant = ORDER_VARIANTS[normStatus] || 'neutral';
    label = (i18n.orderStatus as Record<string, string>)[normStatus] || normStatus;
  } else if (category === 'claim' || CLAIM_VARIANTS[normStatus]) {
    variant = CLAIM_VARIANTS[normStatus] || 'neutral';
    label = CLAIM_LABELS[normStatus] || normStatus;
  } else if (category === 'seller' || SELLER_VARIANTS[normStatus]) {
    variant = SELLER_VARIANTS[normStatus] || 'neutral';
    label = (i18n.sellerStatus as Record<string, string>)[normStatus] || normStatus;
  } else if (category === 'product' || PRODUCT_VARIANTS[normStatus]) {
    variant = PRODUCT_VARIANTS[normStatus] || 'neutral';
    label = normStatus === 'ACTIVE' ? 'Activo' : normStatus === 'PAUSED' ? 'Pausado' : normStatus === 'DRAFT' ? 'Borrador' : normStatus;
  } else if (category === 'user' || USER_VARIANTS[normStatus]) {
    variant = USER_VARIANTS[normStatus] || 'neutral';
    label = normStatus === 'ACTIVE' ? 'Activo' : normStatus === 'BLOCKED' ? 'Bloqueado' : normStatus === 'LOCKED' ? 'Bloqueo temporal' : normStatus;
  }

  return (
    <Badge variant={variant} size={size} dot={dot} className={className}>
      {label}
    </Badge>
  );
};

export default StatusBadge;

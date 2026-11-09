export {
  UserRole,
  UserStatus,
  SellerStatus,
  ProductStatus,
  SubOrderStatus,
  OrderStatus,
  OrderPaymentStatus,
  PaymentStatus,
  CustodyStatus,
  RefundStatus,
  ShipmentStatus,
  ClaimStatus,
  ClaimResolution,
  TrackingEventType,
  NotificationType,
} from '../generated/prisma/enums';

export const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};
export const JWT_COOKIE_NAME = 'jwt';

export function getAllowedCorsOrigins(): string[] {
  const isProduction = process.env['NODE_ENV'] === 'production';
  const raw = process.env['CORS_ORIGINS'];
  if (isProduction) {
    if (!raw || !raw.trim()) {
      throw new Error('CORS_ORIGINS must be defined in production');
    }
    return raw.split(',').map((o) => o.trim()).filter(Boolean);
  }
  return (raw ?? 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}




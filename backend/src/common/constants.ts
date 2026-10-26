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

export const JWT_COOKIE_NAME = 'jwt';
export const IDEMPOTENCY_HEADER = 'idempotency-key';
export const JWT_SECRET_DEFAULT = 'dev_jwt_secret_tienda_virtual_segura_2026';

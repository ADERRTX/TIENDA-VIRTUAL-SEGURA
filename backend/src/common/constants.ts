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


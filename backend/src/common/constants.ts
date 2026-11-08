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



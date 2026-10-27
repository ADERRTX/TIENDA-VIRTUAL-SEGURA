-- Corrige el trigger de reembolsos: el pago se registra por pedido (orderId),
-- no por sub-pedido. Se compara la suma de reembolsos del pedido contra el pago aprobado.
CREATE OR REPLACE FUNCTION check_refund_total() RETURNS trigger AS $$
DECLARE
  v_order_id uuid;
  paid_amount integer;
  refunded_sum integer;
BEGIN
  SELECT "orderId" INTO v_order_id FROM "sub_order" WHERE "id" = NEW."subOrderId";

  SELECT "amount" INTO paid_amount FROM "payment"
    WHERE "orderId" = v_order_id AND "status" = 'APROBADO';
  IF paid_amount IS NULL THEN
    RAISE EXCEPTION 'REFUND_NO_APPROVED_PAYMENT';
  END IF;

  SELECT COALESCE(SUM(r."amount"), 0) INTO refunded_sum
    FROM "refund" r
    JOIN "sub_order" s ON s."id" = r."subOrderId"
    WHERE s."orderId" = v_order_id
      AND r."status" IN ('EN_PROCESO', 'APROBADO')
      AND r."id" <> NEW."id";

  IF refunded_sum + NEW."amount" > paid_amount THEN
    RAISE EXCEPTION 'REFUND_EXCEEDS_PAID';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
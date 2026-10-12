export class ApplicationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly reintenable: boolean = false,
    public readonly httpStatus: number = 500,
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export class OrderInvalidTransitionError extends ApplicationError {
  constructor(from: string, to: string, actor: string) {
    super(
      'ORDER_INVALID_TRANSITION',
      `Transición de '${from}' → '${to}' no permitida para actor '${actor}'`,
      false,
      409,
    );
  }
}

export class StockInsufficientError extends ApplicationError {
  constructor(varianteId: string, requerido: number, disponible: number) {
    super(
      'STOCK_INSUFFICIENT',
      `Stock insuficiente para variante ${varianteId}: requerido ${requerido}, disponible ${disponible}`,
      false,
      409,
    );
  }
}

export class RefoundExceedsPaidError extends ApplicationError {
  constructor(pagoId: string, reembolsado: number, pagado: number) {
    super(
      'REFUND_EXCEEDS_PAID',
      `Reembolso ${reembolsado} excede monto pagado ${pagado} para pago ${pagoId}`,
      false,
      409,
    );
  }
}

export class OrderNotFoundError extends ApplicationError {
  constructor(orderId: string) {
    super('ORDER_NOT_FOUND', `Pedido no encontrado: ${orderId}`, false, 404);
  }
}

export class InvalidInputError extends ApplicationError {
  constructor(field: string, reason: string) {
    super(
      'INVALID_INPUT',
      `Campo '${field}' inválido: ${reason}`,
      false,
      400,
    );
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor() {
    super('UNAUTHORIZED', 'No autorizado', false, 401);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor() {
    super('FORBIDDEN', 'Prohibido', false, 403);
  }
}
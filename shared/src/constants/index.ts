export const PLAZOS_DEFAULT = {
  PAGO_PEDIDO_PENDIENTE_MIN: 30,
  CONFIRMACION_VENDEDOR_H: 48,
  DESPACHO_TRAS_CONFIRMAR_H: 72,
  RECLAMO_TRAS_ENTREGA_D: 7,
  RESPUESTA_VENDEDOR_RECLAMO_H: 72,
  APELACION_D: 3,
  ENVIO_DEVOLUCION_D: 7,
} as const;

export const LIMITES = {
  MAX_PRODUCTOS_POR_VENDEDOR_NUEVO: 10,
  MAX_FOTOS_PRODUCTO: 10,
  MIN_FOTOS_PRODUCTO: 3,
  MAX_CARACTERES_DESCRIPCION: 5000,
  MIN_CARACTERES_DESCRIPCION: 50,
  MAX_INTENTOS_LOGIN: 5,
  BLOQUEO_TEMPORAL_MIN: 15,
  TOKEN_VERIFICACION_H: 24,
  TOKEN_RECUPERACION_H: 2,
} as const;

export const DINERO = {
  MONEDA: 'PEN',
  CENTIMOS_POR_UNIDAD: 100,
  MAX_MONTO_TRANSACCION_CENTIMOS: 10000000,
} as const;

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TELEFONO_PE: /^(\+51)?9\d{8}$/,
  RUC: /^\d{11}$/,
  DNI: /^\d{8}$/,
  SKU: /^[A-Z0-9\-]{3,50}$/,
  PASSWORD_MIN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

export const PAGINACION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const ARCHIVOS = {
  MAX_TAMANO_MB: 10,
  TIPOS_PERMITIDOS: ['image/jpeg', 'image/png', 'image/webp'],
} as const;
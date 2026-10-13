import { z } from 'zod';
import { Role } from '../enums';
import { UserStatus } from '../enums';
import { VendedorStatus } from '../enums';
import { ProductoEstado } from '../enums';
import { SubPedidoEstado } from '../enums';
import { EstadoPago } from '../enums';
import { EstadoCompra } from '../enums';
import { MotivoReclamo } from '../enums';
import { ResolucionReclamo } from '../enums';
import { EstadoDevolucion } from '../enums';
import { EstadoCustodia } from '../enums';
import { MetodoPago } from '../enums';
import { TipoAlerta } from '../enums';
import { LIMITES, DINERO, REGEX, PAGINACION } from '../constants';

// Validadores comunes
export const emailValidator = z.string().email('Correo electrónico inválido');
export const telefonoValidator = z
  .string()
  .regex(REGEX.TELEFONO_PE, 'Teléfono peruano inválido (debe comenzar con 9 y tener 9 dígitos)')
  .optional();
export const passwordValidator = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña no debe exceder 128 caracteres')
  .regex(REGEX.PASSWORD_MIN, 'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial');
export const nombreValidator = z
  .string()
  .min(2, 'Nombre muy corto')
  .max(100, 'Nombre muy largo');
export const descripcionValidator = z
  .string()
  .min(LIMITES.MIN_CARACTERES_DESCRIPCION, `Descripción demasiado corta (mínimo ${LIMITES.MIN_CARACTERES_DESCRIPCION} caracteres)`)
  .max(LIMITES.MAX_CARACTERES_DESCRIPCION, `Descripción demasiado larga (máximo ${LIMITES.MAX_CARACTERES_DESCRIPCION} caracteres)`);
export const montoValidator = z
  .number()
  .int()
  .positive('El monto debe ser positivo')
  .max(DINERO.MAX_MONTO_TRANSACCION_CENTIMOS / 100, `Monto máximo permitido: ${DINERO.MAX_MONTO_TRANSACCION_CENTIMOS / 100} ${DINERO.MONEDA}`);
export const precioValidator = z
  .number()
  .int()
  .positive('El precio debe ser positivo');
export const cantidadValidator = z
  .number()
  .int()
  .positive('La cantidad debe ser positiva')
  .max(10000, 'Cantidad demasiado alta');
export const skuValidator = z
  .string()
  .regex(REGEX.SKU, 'SKU inválido (solo letras mayúsculas, números y guiones)');

// Esquemas base
export const loginSchema = z.object({
  email: emailValidator,
  password: passwordValidator,
});

export const registroSchema = z.object({
  email: emailValidator,
  nombre: nombreValidator,
  telefono: telefonoValidator,
  password: passwordValidator,
});

export const paginacionSchema = z.object({
  page: z.number().int().min(1).default(PAGINACION.DEFAULT_PAGE),
  limit: z.number().int().min(1).max(PAGINACION.MAX_LIMIT).default(PAGINACION.DEFAULT_LIMIT),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
});

// Para datos de dinero (usar enteros en céntimos)
export const dineroSchema = z
  .number()
  .int()
  .nonnegative('El dinero debe ser no negativo');

// Para validar roles
export const roleSchema = z.nativeEnum(Role);
export const userStatusSchema = z.nativeEnum(UserStatus);
export const vendedorStatusSchema = z.nativeEnum(VendedorStatus);
export const productoEstadoSchema = z.nativeEnum(ProductoEstado);
export const subPedidoEstadoSchema = z.nativeEnum(SubPedidoEstado);
export const estadoPagoSchema = z.nativeEnum(EstadoPago);
export const estadoCompraSchema = z.nativeEnum(EstadoCompra);
export const motivoReclamoSchema = z.nativeEnum(MotivoReclamo);
export const resolucionReclamoSchema = z.nativeEnum(ResolucionReclamo);
export const estadoDevolucionSchema = z.nativeEnum(EstadoDevolucion);
export const estadoCustodiaSchema = z.nativeEnum(EstadoCustodia);
export const metodoPagoSchema = z.nativeEnum(MetodoPago);
export const tipoAlertaSchema = z.nativeEnum(TipoAlerta);

// Esquemas para actualizaciones parciales (opcional)
export const partialLoginSchema = loginSchema.partial();
export const partialRegistroSchema = registroSchema.partial();

// Exportar todos los esquemas
export const schemas = {
  login: loginSchema,
  registro: registroSchema,
  paginacion: paginacionSchema,
  dinero: dineroSchema,
  email: emailValidator,
  telefono: telefonoValidator,
  password: passwordValidator,
  nombre: nombreValidator,
  descripcion: descripcionValidator,
  monto: montoValidator,
  precio: precioValidator,
  cantidad: cantidadValidator,
  sku: skuValidator,
  role: roleSchema,
  userStatus: userStatusSchema,
  vendedorStatus: vendedorStatusSchema,
  productoEstado: productoEstadoSchema,
  subPedidoEstado: subPedidoEstadoSchema,
  estadoPago: estadoPagoSchema,
  estadoCompra: estadoCompraSchema,
  motivoReclamo: motivoReclamoSchema,
  resolucionReclamo: resolucionReclamoSchema,
  estadoDevolucion: estadoDevolucionSchema,
  estadoCustodia: estadoCustodiaSchema,
  metodoPago: metodoPagoSchema,
  tipoAlerta: tipoAlertaSchema,
  partialLogin: partialLoginSchema,
  partialRegistro: partialRegistroSchema,
};
// [REGLAS & FUNCIONES: Contexto Asíncrono por Petición] Almacena metadatos de la petición activa (ID de usuario, IP, Trace ID) usando AsyncLocalStorage para trazabilidad.
import { AsyncLocalStorage } from 'async_hooks';

export const requestAsyncStorage = new AsyncLocalStorage<{ ip?: string; userAgent?: string }>();

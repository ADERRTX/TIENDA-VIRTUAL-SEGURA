import { AsyncLocalStorage } from 'async_hooks';

export const requestAsyncStorage = new AsyncLocalStorage<{ ip?: string; userAgent?: string }>();

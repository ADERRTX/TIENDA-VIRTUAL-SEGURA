# Seguridad – Tienda Virtual Segura

## Recuperación de contraseña

La API expone dos endpoints para que el usuario pueda recuperar su contraseña:

| Método | Ruta | Público | Body | Respuesta |
|--------|------|---------|------|-----------|
| **POST** | `/auth/forgot-password` | Sí | `{ "email": "user@example.com" }` | `{ "data": { "ok": true } }` |
| **POST** | `/auth/reset-password` | Sí | `{ "token": "<token>`, "newPassword": "NuevaClave123" }` | `{ "data": { "ok": true } }` |

### Flujo
1. **Solicitud** – `POST /auth/forgot-password` genera un token de un solo uso, lo guarda en la tabla `PasswordReset` (hash SHA‑256) con expiración de 15 min y registra el intento en `AuditLog` (IP y User‑Agent).
2. **Desarrollo** – En modo *development* se escribe en la consola una URL del tipo:
   ```
   http://localhost:{PORT}/auth/reset-password?token=abcdef...
   ```
   Esta URL solo está visible en los logs del servidor.
3. **Restablecimiento** – `POST /auth/reset-password` valida el token (hash, existencia y expiración). Si es válido:
   - Actualiza la contraseña del usuario (con Argon2).
   - Revoca sesiones anteriores (`tokensValidAfter` = ahora).
   - Elimina todos los tokens de reset del usuario.
   - Registra la acción en `AuditLog`.

### Auditoría
Cada petición de recuperación y cada reset exitoso generan un registro en la tabla `AuditLog` con los campos:
- `action`: `FORGOT_PASSWORD_REQUEST` o `PASSWORD_RESET`
- `entity`: `user`
- `entityId`: id del usuario
- `ip` y `userAgent`: capturados del request mediante *AsyncLocalStorage*.

Esta información permite rastrear intentos de recuperación y detectar posibles abusos.

# ==============================================================================
# Dockerfile Multi-Stage de Producción — Backend TVS (Tienda Virtual Segura)
# ==============================================================================

# ------------------------------------------------------------------------------
# Etapa 1: Construcción y Compilación (Builder)
# ------------------------------------------------------------------------------
FROM node:24-alpine AS builder

WORKDIR /app

# Dependencias para compilación de módulos nativos (Argon2, Prisma en Alpine)
RUN apk add --no-cache openssl libc6-compat python3 make g++

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar manifiestos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar todas las dependencias para compilar
RUN pnpm install --frozen-lockfile

# Copiar esquema de Prisma y código fuente
COPY prisma ./prisma
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

# Generar cliente de Prisma y compilar NestJS
RUN pnpm prisma generate
RUN pnpm build

# Limpiar dependencias de desarrollo para aislar las de producción
RUN pnpm prune --prod

# ------------------------------------------------------------------------------
# Etapa 2: Imagen Ligera de Producción (Runner)
# ------------------------------------------------------------------------------
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Dependencias de runtime para Prisma en Alpine
RUN apk add --no-cache openssl libc6-compat

# Instalar pnpm para poder ejecutar 'pnpm prisma migrate deploy'
RUN corepack enable && corepack prepare pnpm@latest --activate

# Crear directorio de subidas y ajustar permisos
RUN mkdir -p /app/uploads && chown -R node:node /app

# Copiar manifiestos y dependencias de producción
COPY --chown=node:node package.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/src/generated ./src/generated

# Usuario no-root por seguridad
USER node

EXPOSE 3000

# Ejecutar el servidor compilado
CMD ["node", "dist/src/main.js"]

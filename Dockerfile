# Usar Node.js 18 LTS
FROM node:18-alpine

# Instalar dependencias del sistema necesarias para PostgreSQL
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Cambiar propiedad de archivos al usuario nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exponer puerto
EXPOSE 8080

# Variable de entorno para el puerto
ENV PORT=8080

# Script de inicio que ejecuta migraciones y luego inicia la aplicación
COPY scripts/start.sh /app/scripts/start.sh
RUN chmod +x /app/scripts/start.sh

# Comando para iniciar la aplicación
CMD ["/app/scripts/start.sh"] 
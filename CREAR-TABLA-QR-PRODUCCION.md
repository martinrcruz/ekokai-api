# Crear Tabla QR WhatsApp en Producción

Este documento explica cómo crear la tabla `qr_whatsapp` en la base de datos de producción de EKOKAI.

## 🚀 Método Rápido (Recomendado)

### 1. Configurar Variables de Entorno

Ejecuta estos comandos con las credenciales de tu base de datos de producción:

```bash
export NODE_ENV=production
export DB_HOST=tu-host-de-produccion.com
export DB_NAME=tu-base-de-datos
export DB_USERNAME=tu-usuario
export DB_PASSWORD=tu-password
export DB_SSL=true
```

### 2. Ejecutar Script

```bash
node scripts/create-qr-whatsapp-production-simple.js
```

## 🔧 Método Alternativo (Una Línea)

Si prefieres ejecutar todo en una sola línea:

```bash
NODE_ENV=production DB_HOST=tu-host DB_NAME=tu-db DB_USERNAME=tu-user DB_PASSWORD=tu-pass DB_SSL=true node scripts/create-qr-whatsapp-production-simple.js
```

## 📋 Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `production` |
| `DB_HOST` | Host de la base de datos | `db-ekokai.ondigitalocean.com` |
| `DB_NAME` | Nombre de la base de datos | `ekokai_db_production` |
| `DB_USERNAME` | Usuario de la base de datos | `ekokai_user` |
| `DB_PASSWORD` | Contraseña de la base de datos | `tu_password_seguro` |
| `DB_SSL` | Usar SSL (recomendado para producción) | `true` |
| `DB_PORT` | Puerto (opcional, default: 5432) | `5432` |

## ✅ Verificación

Si el script se ejecuta correctamente, verás:

```
🚀 Creando tabla QR WhatsApp en PRODUCCIÓN...
✅ Conectado a PostgreSQL de producción
✅ Tabla qr_whatsapp creada exitosamente
✅ Índices creados exitosamente

📋 Estructura de la tabla qr_whatsapp:
   - id: uuid (NOT NULL)
   - mensaje: text (NOT NULL)
   - fechaCreacion: timestamp with time zone (NOT NULL)
   - fechaExpiracion: timestamp with time zone (NOT NULL)
   - activo: boolean (NULL)
   - numeroWhatsapp: character varying (NULL)
   - qrDataUrl: text (NULL)
   - nombre: character varying (NOT NULL)
   - descripcion: text (NULL)
   - createdAt: timestamp with time zone (NOT NULL)
   - updatedAt: timestamp with time zone (NOT NULL)

🔍 Índices creados:
   - qr_whatsapp_activo
   - qr_whatsapp_fecha_expiracion
   - qr_whatsapp_fecha_creacion

🎉 ¡TABLA QR WHATSAPP CREADA EXITOSAMENTE EN PRODUCCIÓN!
✅ La funcionalidad de códigos QR WhatsApp está lista para usar
```

## 🐛 Solución de Problemas

### Error: "ECONNREFUSED"
- Verifica que `DB_HOST` sea correcto
- Verifica que el puerto 5432 esté abierto
- Verifica que el firewall permita conexiones desde tu IP

### Error: "authentication failed"
- Verifica que `DB_USERNAME` y `DB_PASSWORD` sean correctos
- Verifica que el usuario tenga permisos para crear tablas

### Error: "database does not exist"
- Verifica que `DB_NAME` sea correcto
- Asegúrate de que la base de datos exista

### Error: "relation already exists"
- La tabla ya existe, esto es normal
- El script es seguro de ejecutar múltiples veces

## 🔒 Seguridad

- **Nunca** commits las credenciales de producción al repositorio
- Usa variables de entorno para las credenciales
- Considera usar un archivo `.env.production` local (no versionado)
- Para producción, siempre usa SSL (`DB_SSL=true`)

## 📝 Notas Importantes

1. **El script es seguro**: Puede ejecutarse múltiples veces sin problemas
2. **No elimina datos**: Solo crea la tabla si no existe
3. **Incluye validaciones**: Campos con restricciones de longitud
4. **Optimizado**: Incluye índices para consultas rápidas
5. **Compatible**: Funciona con PostgreSQL 12+ (incluyendo Digital Ocean)

## 🎯 Después de Crear la Tabla

Una vez creada la tabla, la funcionalidad estará disponible en:

- **Frontend**: `/administrador/qr-whatsapp`
- **API**: `/api/qr-whatsapp/*`

Los administradores podrán:
- Crear códigos QR con mensajes personalizados
- Configurar fechas de expiración
- Descargar códigos QR como imágenes
- Copiar enlaces de WhatsApp
- Ver estadísticas de uso

## 📞 Soporte

Si tienes problemas creando la tabla, verifica:

1. Las credenciales de la base de datos
2. La conectividad de red
3. Los permisos del usuario de base de datos
4. La configuración SSL

Para más ayuda, contacta al equipo de desarrollo de EKOKAI.

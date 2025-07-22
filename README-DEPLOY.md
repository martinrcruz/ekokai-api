# 🚀 Despliegue en Digital Ocean App Platform

## 📋 Requisitos Previos

1. **Cuenta de Digital Ocean** con App Platform habilitado
2. **Repositorio de GitHub** con el código de la aplicación
3. **Credenciales configuradas** (ya incluidas en el archivo `.do/app.yaml`)

## 🛠️ Configuración Automática

### 1. Subir el código a GitHub

```bash
# Asegúrate de que todos los archivos estén en el repositorio
git add .
git commit -m "Configuración para Digital Ocean App Platform"
git push origin main
```

### 2. Desplegar en Digital Ocean

#### Opción A: Usando Digital Ocean CLI

```bash
# Instalar doctl si no lo tienes
brew install doctl  # macOS
# o descargar desde: https://github.com/digitalocean/doctl/releases

# Autenticarse con Digital Ocean
doctl auth init

# Desplegar la aplicación
doctl apps create --spec .do/app.yaml
```

#### Opción B: Usando la interfaz web de Digital Ocean

1. Ve a [Digital Ocean App Platform](https://cloud.digitalocean.com/apps)
2. Haz clic en "Create App"
3. Selecciona tu repositorio de GitHub
4. Digital Ocean detectará automáticamente que es una aplicación Node.js
5. Las variables de entorno ya están configuradas en `.do/app.yaml`

### 3. Verificar el despliegue

Una vez desplegado, verifica que:

- ✅ La aplicación esté corriendo en el puerto 8080
- ✅ Las variables de entorno estén configuradas correctamente
- ✅ Los logs muestren que Dialogflow y Twilio se inicializaron correctamente

## 🔧 Variables de Entorno Configuradas

Todas las variables necesarias están configuradas en `.do/app.yaml`:

### Base de Datos
- `MONGO_URI_DB1`: MongoDB Atlas connection string

### JWT
- `JWT_SECRET`: Secret para firmar tokens JWT

### Twilio (Credenciales LIVE)
- `TWILIO_ACCOUNT_SID`: AC1be585d06467e3e11576154ba13889d7
- `TWILIO_AUTH_TOKEN`: 1751b5029f7c8b68e72a9b601696d658
- `TWILIO_WHATSAPP_NUMBER`: whatsapp:+14155238886

### Google Cloud / Dialogflow
- `GC_PROJECT_ID`: ekokai-chat-sxgd
- `GC_CLIENT_EMAIL`: ekokai-chat@ekokai-chat-sxgd.iam.gserviceaccount.com
- `GC_PRIVATE_KEY`: Clave privada completa de Google Cloud
- Y todas las demás variables de Google Cloud necesarias

## 🐳 Desarrollo Local con Docker

Para probar localmente antes del despliegue:

```bash
# Construir y ejecutar con Docker Compose
docker-compose up --build

# O construir manualmente
docker build -t ekokai-api .
docker run -p 8080:8080 ekokai-api
```

## 📊 Monitoreo

### Health Check
La aplicación incluye un endpoint de health check:
```
GET /health
```

### Logs
Los logs están configurados para mostrar:
- ✅ Inicialización de servicios
- ✅ Estado de credenciales
- ✅ Errores detallados
- ✅ Métricas de rendimiento

## 🔍 Troubleshooting

### Problemas comunes:

1. **Error de credenciales de Twilio**
   - Verificar que las credenciales LIVE estén configuradas
   - No usar credenciales de TEST en producción

2. **Error de Dialogflow**
   - Verificar que la clave privada esté correctamente formateada
   - Asegurar que el proyecto de Google Cloud esté activo

3. **Error de conexión a MongoDB**
   - Verificar que la URI de MongoDB sea correcta
   - Asegurar que la IP esté en la whitelist de MongoDB Atlas

### Comandos útiles:

```bash
# Ver logs en tiempo real
doctl apps logs <app-id> --follow

# Ver variables de entorno
doctl apps get <app-id>

# Reiniciar la aplicación
doctl apps create-deployment <app-id>
```

## 🚀 URLs de la aplicación

Una vez desplegada, tu aplicación estará disponible en:
- **Producción**: `https://tu-app.ondigitalocean.app`
- **Webhook de WhatsApp**: `https://tu-app.ondigitalocean.app/webhook/whatsapp`

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en Digital Ocean
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que las credenciales sean válidas 
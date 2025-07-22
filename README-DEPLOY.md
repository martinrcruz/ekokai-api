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

### 3. ⚠️ IMPORTANTE: Configurar Variables de Entorno

Si las variables de entorno no se cargan automáticamente (como se ve en los logs), sigue estos pasos:

#### Opción A: Usando la interfaz web de Digital Ocean

1. Ve a tu aplicación en [Digital Ocean App Platform](https://cloud.digitalocean.com/apps)
2. Selecciona tu aplicación
3. Ve a la pestaña "Settings"
4. En "Environment Variables", agrega las siguientes variables:

```
NODE_ENV=production
PORT=8080
MONGO_URI_DB1=mongodb+srv://kamilaopazo1:206000643@clustertrabajo.hyiima4.mongodb.net/ekokai?retryWrites=true&w=majority&appName=ClusterTrabajo
JWT_SECRET=supersecreto123
TWILIO_ACCOUNT_SID=AC1be585d06467e3e11576154ba13889d7
TWILIO_AUTH_TOKEN=1751b5029f7c8b68e72a9b601696d658
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
DIALOGFLOW_PROJECT_ID=ekokai-chat-sxgd
GC_TYPE=service_account
GC_PROJECT_ID=ekokai-chat-sxgd
GC_PRIVATE_KEY_ID=eb5ca2bd9e90972999c519573db1bc887ff79211
GC_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDv/0CyZV2ozz1e\nDc3THnJoOBIc4HVOFdaaT2MPGGOH3q+hNomJO7wdfoqBqNTw5WC9tAoug1FJ7WL0\n1bm88rmzq8ECBYw3T5YXxa5Ds16SLM1Jtw2Ne1BxPAEu5s7nBMczsRZtD4LTSYr/\n1xEdpLStsOWTeMspkxsZ5Ve1Etl46whUaltJ5uN+uCEXjqjziDRo8tRWD1vv02d/\n8+ztWqvhI2ZF4vLJY/0v8+DeWcCj0ld+HGwPVs1lhYCbSDTY65KyzXhRLdynAoIQ\nFX8z8/Ixe14B1dKpdAIlmIHKvBKkHlflsqC/9XPN9jRMQisIC2RB2oxL6/aBm/vb\n/P0QbVDfAgMBAAECggEATzUZp6cPxb57/PYmV4alcKMMy04DOR25AZ2wzlMYykdj\nBJxowQufdsaENO3BNa4mgwWQFLDPW8xGjBKbpfIf+t31KdMl5z1Tho3+CScCT9EM\ngccx6F9p+a05oL6ZS6KGkhdglOb5IP2VLAHRisyIuwh2hHjp6FM+LwpDq6XIc4DO\n1j1ajFgAYl8JCyOel7BB0bkxvpRnEf6yCgW/T0LV28+TuoCj1qdAqwBxZugNNAZV\nIyC9lcGJ7SEakxmLiuldnVxZ5dUrcvNEfbky3Gm/bOK41w2M59Y+e7OfZWiwwpVm\n6KkzzoCn3GOqkNzLmM50lvd96PfXmCIVJU0RqPSdYQKBgQD4hH2QUmm0yCzH1coh\nn9wTW3uDqtQUmAGE93lkA+itTeBk4GcxmFZccT/Cg2PxrkI5lepsC3sxNOyrLHDA\nYLPOMasKjS7qcibKNPQ9/EZdoeHQ20QZgjMNXB+2mk0gaU31enaa9gSsPESPAvgF\nJucSRQWd52yNYEY9uZWA5oh54QKBgQD3ORa2ILA9KntUfzRuq2Hs2HpAMLr+7XeX\nDGbZH0vDhPQB+DG5bIbHtf9DteTye68+JdxWNWB8uoSWHBE8L30WwoDeWzg7wggj\nYiAhHicxpIF8m2aNlmahnka4v7KLMmQYCu0Ywk6VvYbuYhZI0rgvSs9q0NIirbdG\n/egG5rqivwKBgCz+B6GOWhbhusG/IeYug/B5OoZe8iB8WKITD8Ycsw5VMA/zVJt1\nAgWgdzOnB/wkWVcFnjhLZ9VDyKlA1XTuzP7CnT2+y8SkQAORzLpAJxkiirh+Sfj4\nSnfbut4bV2VLy1JrBngNnFD2ZE8j8XU1UtZK6rZoxI1f5bedFsUMd57hAoGBAMMY\nFCop5ap/SdBGihQDv0VvGBpr2kWvFD7pFIinP9zNoNmlCWhwknQr1YOTmVcZ8BM1\nQYnumXQUpOjowVkjiK1bVOMkTV4rIsz5dK1t5DQyw9SXtfhqBhfolZrZ/IYIgCDR\nDoYJYIaeiEq6sSdK0vrPKJv8qrefKxEk8ePwVLx1AoGBAL8RLr8RZabC7FjiWoP1\nFA/g85vN7b7aXflAJ2PlUAXworYuhKEnTpwzzM/ME8tMtTULlzj5c9Hl0Djl09Df\nXW2Lky8+2IFO1AdfwppSctCXaPID30s8sr6PzlZXdats+LhIYEwXRdo1GrQRJ5p3\nLeW38n/JA+Zw/Dw3EiF8SITl\n-----END PRIVATE KEY-----\n
GC_CLIENT_EMAIL=ekokai-chat@ekokai-chat-sxgd.iam.gserviceaccount.com
GC_CLIENT_ID=110418399146269369162
GC_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GC_TOKEN_URI=https://oauth2.googleapis.com/token
GC_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GC_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/ekokai-chat%40ekokai-chat-sxgd.iam.gserviceaccount.com
GC_UNIVERSE_DOMAIN=googleapis.com
```

#### Opción B: Usando el script automático

```bash
# Obtener el ID de tu aplicación
doctl apps list

# Ejecutar el script de configuración
./deploy-env.sh <tu-app-id>
```

### 4. Verificar el despliegue

Una vez desplegado, verifica que:

- ✅ La aplicación esté corriendo en el puerto 8080
- ✅ Las variables de entorno estén configuradas correctamente
- ✅ Los logs muestren que Dialogflow y Twilio se inicializaron correctamente

## 🔧 Variables de Entorno Configuradas

Todas las variables necesarias están configuradas en `.do/app.yaml` y en el `Dockerfile`:

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

4. **Variables de entorno no se cargan**
   - Verificar que estén configuradas en Digital Ocean App Platform
   - Usar el script `deploy-env.sh` para configurarlas automáticamente

### Comandos útiles:

```bash
# Ver logs en tiempo real
doctl apps logs <app-id> --follow

# Ver variables de entorno
doctl apps get <app-id>

# Reiniciar la aplicación
doctl apps create-deployment <app-id>

# Configurar variables de entorno
./deploy-env.sh <app-id>
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
4. Usa el script `deploy-env.sh` para configurar las variables automáticamente 
# Ekokai Backend

Backend para la plataforma Ekokai, un sistema de gestión de reciclaje que permite a administradores, encargados y vecinos interactuar con ecopuntos, registrar entregas de residuos, acumular tokens y consultar estadísticas. Incluye integración con WhatsApp mediante Dialogflow y Twilio para interacción vía chatbot.

## Tabla de Contenidos

- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Variables de Entorno](#variables-de-entorno)
- [Scripts Útiles](#scripts-útiles)
- [Modelos Principales](#modelos-principales)
- [Rutas y Endpoints](#rutas-y-endpoints)
- [Colección Postman](#colección-postman)
- [Autenticación y Roles](#autenticación-y-roles)
- [Integración WhatsApp/Dialogflow/Twilio](#integración-whatsappdialogflowtwilio)
- [Uso de ngrok para Webhooks](#uso-de-ngrok-para-webhooks)
- [Ejemplos de Requests y Payloads](#ejemplos-de-requests-y-payloads)
- [Estadísticas y Métricas](#estadísticas-y-métricas)
- [Contribución](#contribución)

---

## Tecnologías

- Node.js + Express
- MongoDB (Mongoose)
- JWT para autenticación
- Twilio (WhatsApp)
- Dialogflow (Google Cloud)
- dotenv, bcrypt, axios, cors, morgan

## Estructura del Proyecto

```
ekokai-backend/
│
├── src/
│   ├── app.js                # Configuración de la app Express y middlewares
│   ├── index.js              # Entry point, arranque del servidor y conexión DB
│   ├── config/               # Configuración de base de datos
│   ├── controllers/          # Lógica de negocio por recurso
│   ├── middleware/           # Middlewares de autenticación y roles
│   ├── models/               # Modelos de datos (Mongoose)
│   ├── repositories/         # Acceso a datos y queries complejas
│   ├── routes/               # Definición de endpoints
│   ├── services/             # Lógica de negocio reutilizable e integraciones
│   ├── utils/                # Utilidades (JWT, Twilio, etc)
│   └── validators/           # Validaciones (en desarrollo)
│
├── scripts/                  # Scripts de administración (crear admin, tokens)
├── keys/                     # Credenciales de servicio (Dialogflow)
├── Ekokai.postman_collection.json # Colección de Postman para pruebas
├── package.json
└── .env                      # Variables de entorno (no versionado)
```

## Instalación

1. **Clona el repositorio**  
   `git clone <repo-url> && cd ekokai-backend`

2. **Instala dependencias**  
   `npm install`

3. **Configura las variables de entorno**  
   Crea un archivo `.env` en la raíz con al menos:
   ```
   PORT=3000
   MONGO_URI_DB1=mongodb://<usuario>:<password>@<host>:<puerto>/<db>
   JWT_SECRET=tu_clave_secreta
   TWILIO_ACCOUNT_SID=...
   TWILIO_AUTH_TOKEN=...
   TWILIO_WHATSAPP_NUMBER=whatsapp:+<número>
   ```

4. **Agrega las credenciales de Dialogflow**  
   Coloca el archivo de cuenta de servicio de Google en `keys/service-account.json`.

5. **Crea un usuario administrador**  
   Ejecuta:  
   `node scripts/crearAdmin.js`

6. **Inicia el servidor**  
   `npm start`

## Variables de Entorno

- `PORT`: Puerto donde corre el backend (por defecto 3000)
- `MONGO_URI_DB1`: URI de conexión a MongoDB
- `JWT_SECRET`: Secreto para firmar tokens JWT
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`: Credenciales de Twilio para WhatsApp

## Scripts Útiles

- `scripts/crearAdmin.js`: Crea un usuario administrador inicial.
- `scripts/get-access-token.js`: Obtiene un access token para Dialogflow (útil para pruebas de integración).

## Modelos Principales

- **Usuario**:  
  Roles: `vecino`, `encargado`, `administrador`.  
  Campos: nombre, email, password (hasheada), tokensAcumulados, ecopuntoId, etc.

- **Ecopunto**:  
  nombre, dirección, zona, encargado (usuario), vecinos (virtual).

- **EntregaResiduo**:  
  usuario, ecopunto, tipoResiduo, pesoKg, tokensOtorgados, fecha.

- **TipoResiduo**:  
  nombre, descripción, tokensPorKg.

## Rutas y Endpoints

- **/auth**:  
  - `POST /auth/login`: Login de usuario.

- **/usuarios**:  
  - `POST /usuarios/registrar`: Registrar vecino (encargado/admin).
  - `GET /usuarios/`: Listar usuarios (admin).
  - `GET /usuarios/:id`: Obtener perfil (todos).
  - `POST /usuarios/registrar-encargado`: Registrar encargado (admin).

- **/ecopuntos**:  
  - `POST /ecopuntos/`: Crear ecopunto (admin).
  - `PATCH /ecopuntos/:id/enrolar`: Asignar encargado (admin).
  - `GET /ecopuntos/`: Listar ecopuntos (admin).

- **/residuos**:  
  - `POST /residuos/`: Registrar entrega (encargado).
  - `GET /residuos/usuario/:usuarioId`: Historial de entregas (todos).

- **/tipos-residuo**:  
  - `POST /tipos-residuo/`: Crear tipo (admin/encargado).
  - `GET /tipos-residuo/`: Listar tipos (todos).
  - `DELETE /tipos-residuo/:id`: Eliminar tipo (admin).

- **/estadisticas**:  
  - `GET /estadisticas/total-kilos`: Total reciclado (admin).
  - `GET /estadisticas/sucursal-top`: Ecopunto top (admin).
  - `GET /estadisticas/kilos-por-mes`: Kilos por mes (admin).
  - `GET /estadisticas/meta-mensual`: Progreso meta mensual (admin).

- **/webhook/whatsapp**:  
  - `POST /webhook/whatsapp`: Webhook para integración con WhatsApp/Dialogflow.

## Colección Postman

Para facilitar las pruebas y el desarrollo, se incluye la colección `Ekokai.postman_collection.json` en la raíz del proyecto.  
**¿Cómo usarla?**

1. Abre Postman.
2. Haz clic en "Importar" y selecciona el archivo `Ekokai.postman_collection.json`.
3. Encontrarás carpetas organizadas por rol (Admin, Encargado, Vecino, Estadísticas).
4. Cada request incluye ejemplos de payload y headers (incluyendo tokens de ejemplo).
5. Modifica los tokens según los usuarios que crees en tu entorno local.

Esto te permitirá probar fácilmente todos los endpoints, flujos de autenticación y operaciones CRUD del sistema.

## Autenticación y Roles

- **JWT**: Todas las rutas (excepto login y webhook) requieren autenticación por token JWT.
- **Roles**:  
  - `administrador`: Control total, gestión de usuarios, ecopuntos, tipos, estadísticas.
  - `encargado`: Registrar vecinos, registrar entregas.
  - `vecino`: Consultar perfil, historial de entregas.

## Integración WhatsApp/Dialogflow/Twilio

- El endpoint `/webhook/whatsapp` recibe mensajes de WhatsApp enviados a tu número de Twilio.
- El backend utiliza la API de Twilio para recibir y enviar mensajes de WhatsApp.
- Los mensajes se procesan con Dialogflow (Google Cloud) para interpretar intenciones y responder automáticamente.
- Ejemplos de intenciones soportadas: consultar tokens acumulados, historial de entregas, etc.
- El helper `src/utils/twilio.helper.js` gestiona el envío de mensajes usando la API de Twilio.

**Variables de entorno necesarias para Twilio:**
```
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+<número>
```

**Configuración del Webhook en Twilio:**
1. Ve a la consola de [Twilio](https://console.twilio.com/).
2. Selecciona tu número de WhatsApp Sandbox o el número verificado.
3. En la sección "A MESSAGE COMES IN" coloca la URL pública de tu webhook, por ejemplo:
   ```
   https://xxxxxx.ngrok.io/webhook/whatsapp
   ```
4. Guarda los cambios.

## Uso de ngrok para Webhooks

Cuando desarrollas localmente, necesitas exponer tu servidor para que Twilio pueda enviar mensajes a tu webhook.  
Para esto, se recomienda usar [ngrok](https://ngrok.com/):

1. Instala ngrok si no lo tienes:  
   `npm install -g ngrok` o descarga desde su web.

2. Inicia tu servidor local (`npm start`).

3. En otra terminal, ejecuta:  
   `ngrok http 3000`

4. ngrok te dará una URL pública (por ejemplo, `https://xxxxxx.ngrok.io`).  
   Usa esta URL para configurar el webhook en la consola de Twilio, apuntando a:  
   `https://xxxxxx.ngrok.io/webhook/whatsapp`

5. Ahora Twilio podrá enviar mensajes a tu backend local y podrás probar la integración de WhatsApp en desarrollo.

## Ejemplos de Requests y Payloads

### Ejemplo: Login de usuario
```json
POST /auth/login
{
  "correo": "admin@correo.com",
  "contrasena": "admin123"
}
```

### Ejemplo: Registrar entrega de residuo
```json
POST /residuos/
{
  "usuarioId": "<id_vecino>",
  "ecopuntoId": "<id_ecopunto>",
  "tipoResiduoId": "<id_tipo>",
  "pesoKg": 2.4
}
```

### Ejemplo: Payload recibido desde Twilio (WhatsApp)
```json
{
  "From": "whatsapp:+56912345678",
  "Body": "¿Cuántos tokens tengo?"
}
```

### Ejemplo: Respuesta automática del bot
```
Tienes 10 tokens acumulados.
```

## Estadísticas y Métricas

- Total de kilos reciclados.
- Ecopunto con más kilos reciclados.
- Kilos reciclados por mes.
- Progreso hacia meta mensual.

## Contribución

1. Haz un fork y crea una rama para tu feature/fix.
2. Asegúrate de seguir la estructura y convenciones del proyecto.
3. Haz un PR describiendo claramente tu aporte.

---

**¡Gracias por contribuir a Ekokai!** 
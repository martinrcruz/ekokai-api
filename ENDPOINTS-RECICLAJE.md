# Endpoints del Sistema de Canje de Reciclaje - Ekokai API

## 🌿 Descripción General

Esta documentación describe todos los endpoints implementados en la API de Ekokai para el sistema de canje de basura por cupones a través de WhatsApp.

## 📋 Índice de Endpoints

### 🔍 Códigos QR
- [POST /api/qr/generar-reciclaje](#post-apiqrgenerar-reciclaje)
- [POST /api/qr/validar-reciclaje](#post-apiqrvalidar-reciclaje)
- [GET /api/qr/reciclaje/:id](#get-apiqrreciclajeid)
- [GET /api/qr/reciclaje](#get-apiqrreciclaje)
- [PUT /api/qr/reciclaje/:id/desactivar](#put-apiqrreciclajeiddesactivar)
- [GET /api/qr/estadisticas](#get-apiqrestadisticas)

### 🔄 Canjes de Reciclaje
- [POST /api/canjes/reciclaje](#post-apicanjesreciclaje)
- [GET /api/canjes/reciclaje/:id](#get-apicanjesreciclajeid)
- [GET /api/canjes/reciclaje](#get-apicanjesreciclaje)
- [GET /api/canjes/reciclaje/usuario/:userId](#get-apicanjesreciclajeusuariouserid)
- [GET /api/canjes/reciclaje/phone/:phoneNumber](#get-apicanjesreciclajephonephonenumber)
- [GET /api/canjes/reciclaje/estadisticas](#get-apicanjesreciclajeestadisticas)
- [PUT /api/canjes/reciclaje/:id/estado](#put-apicanjesreciclajeidestado)

### 📊 Trazabilidad
- [POST /api/trazabilidad/registro](#post-apitrazabilidadregistro)
- [GET /api/trazabilidad/usuario/:userId](#get-apitrazabilidadusuariouserid)
- [GET /api/trazabilidad/phone/:phoneNumber](#get-apitrazabilidadphonephonenumber)
- [GET /api/trazabilidad/qr/:qrCode](#get-apitrazabilidadqrqrcode)
- [GET /api/trazabilidad/canje/:canjeId](#get-apitrazabilidadcanjeid)
- [GET /api/trazabilidad/estadisticas](#get-apitrazabilidadestadisticas)
- [GET /api/trazabilidad/eventos](#get-apitrazabilidadeventos)
- [DELETE /api/trazabilidad/limpiar](#delete-apitrazabilidadlimpiar)

### 👤 Usuarios
- [GET /api/usuarios/buscar-telefono](#get-apiusuariosbuscar-telefono)
- [GET /api/usuarios/:id/estadisticas-reciclaje](#get-apiusuariosidestadisticas-reciclaje)

---

## 🔍 Endpoints de Códigos QR

### POST /api/qr/generar-reciclaje

Genera un nuevo código QR para reciclaje.

**Autenticación**: Requerida

**Request Body**:
```json
{
  "tipo": "reciclaje",
  "configuracion": {
    "tamano": "20x20cm",
    "descripcion": "Código QR para canje de basura por cupones",
    "instrucciones": "Pega este QR en una bolsa de basura y sigue las instrucciones en WhatsApp",
    "valorTokens": 10
  }
}
```

**Response**:
```json
{
  "success": true,
  "qr": {
    "id": "64f7b1a2c8d4e5f6a7b8c9d0",
    "codigo": "EKOKAI-RECYCLE-LX2M9P-ABC12",
    "imagen": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "estado": "activo",
    "fechaCreacion": "2024-01-15T10:30:00.000Z",
    "fechaExpiracion": "2024-02-14T10:30:00.000Z",
    "configuracion": {
      "tamano": "20x20cm",
      "descripcion": "Código QR para canje de basura por cupones",
      "valorTokens": 10
    }
  },
  "mensaje": "Código QR generado exitosamente"
}
```

---

### POST /api/qr/validar-reciclaje

Valida un código QR para reciclaje.

**Autenticación**: No requerida

**Request Body**:
```json
{
  "qrCode": "EKOKAI-RECYCLE-LX2M9P-ABC12",
  "phoneNumber": "+573001234567"
}
```

**Response Exitosa**:
```json
{
  "success": true,
  "valido": true,
  "mensaje": "Código QR válido para reciclaje",
  "qr": {
    "id": "64f7b1a2c8d4e5f6a7b8c9d0",
    "codigo": "EKOKAI-RECYCLE-LX2M9P-ABC12",
    "configuracion": {
      "valorTokens": 10,
      "descripcion": "Código QR para canje de basura por cupones"
    },
    "fechaCreacion": "2024-01-15T10:30:00.000Z",
    "fechaExpiracion": "2024-02-14T10:30:00.000Z"
  },
  "usuario": {
    "id": "64f7a1b2c3d4e5f6a7b8c9d1",
    "nombre": "Juan Pérez",
    "tokensAcumulados": 150
  }
}
```

**Response Error**:
```json
{
  "success": false,
  "valido": false,
  "mensaje": "Este código QR ya fue utilizado",
  "qr": {
    "codigo": "EKOKAI-RECYCLE-LX2M9P-ABC12",
    "estado": "usado",
    "fechaExpiracion": "2024-02-14T10:30:00.000Z",
    "fechaUso": "2024-01-16T08:45:00.000Z"
  }
}
```

---

### GET /api/qr/reciclaje/:id

Obtiene información de un código QR específico.

**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "qr": {
    "id": "64f7b1a2c8d4e5f6a7b8c9d0",
    "codigo": "EKOKAI-RECYCLE-LX2M9P-ABC12",
    "tipo": "reciclaje",
    "estado": "activo",
    "fechaCreacion": "2024-01-15T10:30:00.000Z",
    "fechaExpiracion": "2024-02-14T10:30:00.000Z",
    "usuarioCreador": {
      "nombre": "Admin",
      "apellido": "Sistema",
      "email": "admin@ekokai.com"
    },
    "configuracion": {
      "tamano": "20x20cm",
      "descripcion": "Código QR para canje de basura por cupones",
      "valorTokens": 10
    }
  }
}
```

---

## 🔄 Endpoints de Canjes de Reciclaje

### POST /api/canjes/reciclaje

Crea un nuevo canje de reciclaje (completado).

**Autenticación**: No requerida

**Request Body**:
```json
{
  "usuarioId": "64f7a1b2c3d4e5f6a7b8c9d1",
  "qrCode": "EKOKAI-RECYCLE-LX2M9P-ABC12",
  "phoneNumber": "+573001234567",
  "imagenes": {
    "primera": "/uploads/qr-images/573001234567_1642248600_stand.jpg",
    "segunda": "/uploads/qr-images/573001234567_1642248900_disposal.jpg"
  },
  "metadata": {
    "conversationId": "conv_123",
    "startTime": "2024-01-15T10:25:00.000Z",
    "completedTime": "2024-01-15T10:35:00.000Z"
  }
}
```

**Response**:
```json
{
  "success": true,
  "mensaje": "Canje de reciclaje creado exitosamente",
  "canje": {
    "id": "64f7c1d2e3f4a5b6c7d8e9f0",
    "estado": "completado",
    "fechaCompletado": "2024-01-15T10:35:00.000Z",
    "tokensGenerados": 10
  },
  "cupon": {
    "id": "64f7d1e2f3a4b5c6d7e8f9a0",
    "codigo": "64f7d1e2f3a4b5c6d7e8f9a0",
    "nombre": "Cupón de Reciclaje - EKOKAI-RECYCLE-LX2M9P-ABC12",
    "valor": 10,
    "fechaExpiracion": "2024-02-14T10:35:00.000Z",
    "descripcion": "Cupón generado por canje de basura reciclada"
  },
  "usuario": {
    "tokensAcumulados": 160
  }
}
```

---

### GET /api/canjes/reciclaje/usuario/:userId

Obtiene los canjes de reciclaje de un usuario específico.

**Autenticación**: No requerida

**Query Parameters**:
- `limite`: Número máximo de canjes a retornar (default: 20)

**Response**:
```json
{
  "success": true,
  "data": {
    "canjes": [
      {
        "id": "64f7c1d2e3f4a5b6c7d8e9f0",
        "qrCode": "EKOKAI-RECYCLE-LX2M9P-ABC12",
        "estado": "completado",
        "fechaInicio": "2024-01-15T10:25:00.000Z",
        "fechaCompletado": "2024-01-15T10:35:00.000Z",
        "tokensGenerados": 10,
        "qrReciclajeId": {
          "codigo": "EKOKAI-RECYCLE-LX2M9P-ABC12",
          "configuracion": {
            "descripcion": "Código QR para canje de basura por cupones",
            "valorTokens": 10
          }
        },
        "cuponGenerado": {
          "nombre": "Cupón de Reciclaje - EKOKAI-RECYCLE-LX2M9P-ABC12",
          "valor": 10,
          "fechaExpiracion": "2024-02-14T10:35:00.000Z"
        }
      }
    ],
    "estadisticas": {
      "totalCanjes": 5,
      "tokensGenerados": 50,
      "canjesCompletados": 5
    }
  }
}
```

---

## 📊 Endpoints de Trazabilidad

### POST /api/trazabilidad/registro

Registra un evento de trazabilidad.

**Autenticación**: No requerida

**Request Body**:
```json
{
  "phoneNumber": "+573001234567",
  "userId": "64f7a1b2c3d4e5f6a7b8c9d1",
  "step": "first_image_validated",
  "qr_code": "EKOKAI-RECYCLE-LX2M9P-ABC12",
  "canjeReciclajeId": "64f7c1d2e3f4a5b6c7d8e9f0",
  "image_path": "/uploads/qr-images/573001234567_1642248600_stand.jpg",
  "validation_result": {
    "success": true,
    "confidence": 0.95,
    "qr_detected": true,
    "context_valid": true,
    "elements_found": {
      "bolsa_basura": true,
      "qr_visible": true,
      "fondo_ekokai": true,
      "stand_reciclaje": true
    },
    "processing_time": 2500
  },
  "metadata": {
    "conversationId": "conv_123",
    "platform": "whatsapp",
    "validationType": "stand_validation"
  }
}
```

**Response**:
```json
{
  "success": true,
  "mensaje": "Evento de trazabilidad registrado exitosamente",
  "id": "64f7e1f2a3b4c5d6e7f8a9b0",
  "timestamp": "2024-01-15T10:30:15.000Z"
}
```

---

### GET /api/trazabilidad/usuario/:userId

Obtiene la trazabilidad de un usuario específico.

**Autenticación**: Requerida

**Query Parameters**:
- `limite`: Número máximo de eventos (default: 50)
- `step`: Filtrar por tipo de evento

**Response**:
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "64f7a1b2c3d4e5f6a7b8c9d1",
      "nombre": "Juan",
      "apellido": "Pérez",
      "telefono": "+573001234567"
    },
    "eventos": [
      {
        "id": "64f7e1f2a3b4c5d6e7f8a9b0",
        "step": "exchange_completed",
        "timestamp": "2024-01-15T10:35:00.000Z",
        "qr_code": "EKOKAI-RECYCLE-LX2M9P-ABC12",
        "coupon_id": {
          "nombre": "Cupón de Reciclaje",
          "valor": 10
        },
        "metadata": {
          "conversationId": "conv_123",
          "tokensGenerados": 10
        }
      },
      {
        "id": "64f7e0f1a2b3c4d5e6f7a8b9",
        "step": "second_image_validated",
        "timestamp": "2024-01-15T10:33:00.000Z",
        "qr_code": "EKOKAI-RECYCLE-LX2M9P-ABC12",
        "image_path": "/uploads/qr-images/573001234567_1642248900_disposal.jpg"
      }
    ],
    "estadisticas": [
      {
        "_id": "exchange_completed",
        "count": 3,
        "ultimoEvento": "2024-01-15T10:35:00.000Z"
      },
      {
        "_id": "first_image_validated",
        "count": 3,
        "ultimoEvento": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

## 👤 Endpoints de Usuarios

### GET /api/usuarios/buscar-telefono

Busca un usuario por número de teléfono.

**Autenticación**: Requerida

**Query Parameters**:
- `telefono`: Número de teléfono a buscar (requerido)

**Response Exitosa**:
```json
{
  "success": true,
  "usuario": {
    "_id": "64f7a1b2c3d4e5f6a7b8c9d1",
    "nombre": "Juan",
    "apellido": "Pérez",
    "telefono": "+573001234567",
    "tokensAcumulados": 160,
    "zona": "Zona Norte",
    "rol": "vecino",
    "activo": true,
    "fechaCreacion": "2024-01-10T08:00:00.000Z",
    "ultimaConexion": "2024-01-15T10:35:00.000Z"
  },
  "mensaje": "Usuario encontrado exitosamente"
}
```

**Response Error**:
```json
{
  "success": false,
  "mensaje": "Usuario no encontrado con ese número de teléfono"
}
```

---

### GET /api/usuarios/:id/estadisticas-reciclaje

Obtiene estadísticas de reciclaje de un usuario.

**Autenticación**: No requerida

**Response**:
```json
{
  "success": true,
  "estadisticas": {
    "usuario": {
      "id": "64f7a1b2c3d4e5f6a7b8c9d1",
      "nombre": "Juan",
      "apellido": "Pérez",
      "tokensAcumulados": 160
    },
    "reciclaje": {
      "totalCanjes": 8,
      "tokensGenerados": 80,
      "canjesCompletados": 8,
      "canjesFallidos": 0,
      "ultimoCanje": "2024-01-15T10:35:00.000Z",
      "tasaExito": "100.00"
    },
    "trazabilidad": [
      {
        "_id": "exchange_completed",
        "count": 8,
        "ultimoEvento": "2024-01-15T10:35:00.000Z"
      },
      {
        "_id": "first_image_validated",
        "count": 8,
        "ultimoEvento": "2024-01-15T10:30:00.000Z"
      }
    ],
    "historialMensual": [
      {
        "_id": {
          "año": 2024,
          "mes": 1
        },
        "canjes": 8,
        "tokens": 80
      }
    ]
  },
  "mensaje": "Estadísticas obtenidas exitosamente"
}
```

---

## 🔧 Configuración y Uso

### Variables de Entorno Requeridas

```bash
MONGODB_URI=mongodb://localhost:27017/ekokai
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key
```

### Scripts de Configuración

#### Configurar Sistema
```bash
node setup-recycling-system.js
```

#### Probar Endpoints
```bash
node test-recycling-endpoints.js
```

### Modelos de Base de Datos

#### QRReciclaje
- `codigo`: String único del QR
- `tipo`: Tipo de QR (reciclaje)
- `estado`: activo, usado, expirado, cancelado
- `configuracion`: Configuración del QR (tokens, descripción)
- `fechaCreacion`, `fechaExpiracion`

#### CanjeReciclaje
- `usuarioId`: ID del usuario
- `qrCode`: Código QR utilizado
- `phoneNumber`: Teléfono del usuario
- `estado`: iniciado, completado, fallido
- `imagenes`: Rutas de las imágenes validadas
- `tokensGenerados`: Tokens otorgados

#### Trazabilidad
- `phoneNumber`: Teléfono del usuario
- `userId`: ID del usuario
- `step`: Tipo de evento
- `qr_code`: Código QR relacionado
- `validation_result`: Resultado de validación
- `metadata`: Metadatos adicionales

---

## 🚀 Estados y Flujos

### Estados de QR
- `activo`: Disponible para uso
- `usado`: Ya fue utilizado
- `expirado`: Fuera de fecha de validez
- `cancelado`: Desactivado manualmente

### Estados de Canje
- `iniciado`: Proceso iniciado
- `primera_imagen_validada`: Primera imagen aprobada
- `completado`: Canje exitoso
- `fallido`: Proceso fallido

### Pasos de Trazabilidad
- `first_image_validated`: Primera imagen validada
- `second_image_validated`: Segunda imagen validada
- `exchange_completed`: Canje completado
- `qr_generated`: QR generado
- `coupon_created`: Cupón creado
- `error_occurred`: Error en el proceso

---

## 📈 Códigos de Error Comunes

- `400`: Datos inválidos o QR ya usado
- `401`: No autorizado (token inválido)
- `404`: Recurso no encontrado
- `500`: Error interno del servidor

---

**¡Los endpoints están listos para integración con el sistema de WhatsApp!** 🌿♻️📱

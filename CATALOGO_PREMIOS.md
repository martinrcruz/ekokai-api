# 🎁 Catálogo de Premios - Ekokai

## Descripción

El módulo de Catálogo de Premios es un **sitio web independiente** que permite a cualquier usuario visualizar y canjear premios utilizando los **cupones** obtenidos por reciclar residuos. 

### Terminología del Sistema
- **Cupones**: Moneda del sistema (1 kg reciclado = 1 cupón)
- **Premios**: Recompensas que se canjean con cupones
- **Canje**: Proceso de intercambiar cupones por premios

Este catálogo funciona como una aplicación de una sola página (SPA) sin sidebar, sin navegación hacia otras partes de la aplicación, y sin requerir autenticación para su uso.

## 🚀 Características

### Para Usuarios No Autenticados
- ✅ Visualizar todos los premios disponibles
- ✅ Buscar premios por nombre, descripción o categoría
- ✅ Filtrar premios por categoría
- ✅ Ver premios destacados
- ✅ Navegar por el catálogo completo

### Para Todos los Usuarios
- ✅ Visualizar todos los premios disponibles
- ✅ Buscar premios por nombre, descripción o categoría
- ✅ Filtrar premios por categorías
- ✅ Ver premios destacados
- ✅ Canjear premios por WhatsApp (sin autenticación requerida)
- ✅ Navegar por el catálogo completo

### Funcionalidades del Sistema
- 🔍 Búsqueda en tiempo real sin autenticación
- 🏷️ Filtrado por categorías
- ⭐ Premios destacados con grid responsivo
- 📱 Diseño responsivo para móviles
- 🎨 Interfaz moderna y limpia
- 📱 Canje directo por WhatsApp
- ⚙️ Sistema de configuración personalizable
- 🌐 Sitio web independiente (sin sidebar)
- 🚫 Navegación restringida (solo catálogo)
- 🎯 Experiencia de usuario enfocada

## 🏗️ Arquitectura

### Backend
- **Modelo**: `src/models/premio.model.js`
- **Controlador**: `src/controllers/premio.controller.js`
- **Servicio**: `src/services/premio.service.js`
- **Repositorio**: `src/repositories/premio.repository.js`
- **Rutas**: `src/routes/premio.routes.js`

### Frontend
- **Componente**: `ekokai-front/src/app/pages/catalogo-premios/`
- **Servicio**: `ekokai-front/src/app/services/premio.service.ts`
- **Módulo**: `ekokai-front/src/app/pages/catalogo-premios/catalogo-premios.module.ts`

## 📋 Estructura de Datos

### Modelo de Premio
```javascript
{
  nombre: String,              // Nombre del premio
  descripcion: String,         // Descripción detallada
  imagen: String,              // URL de la imagen (opcional)
  cuponesRequeridos: Number,   // Cupones necesarios para canjear
  stock: Number,               // Cantidad disponible
  categoria: String,           // Categoría del premio
  activo: Boolean,             // Si está disponible
  destacado: Boolean,          // Si aparece en destacados
  orden: Number,               // Orden de visualización
  timestamps: true             // Fechas de creación/actualización
}
```

## 🛠️ Instalación y Configuración

### 1. Backend
El módulo ya está integrado en el backend. Las rutas están disponibles en:
- **Públicas**: `/premios/catalogo/*`
- **Protegidas**: `/premios/*` (requieren rol admin)

### 2. Frontend
El módulo está configurado como lazy loading y se carga automáticamente.

### 3. Base de Datos
Para probar el catálogo, ejecuta el script de premios de ejemplo:

```bash
cd ekokai-api
node scripts/crear-premios-ejemplo.js
```

### 4. Configuración de WhatsApp
Configura el número del chatbot de WhatsApp:

```bash
# Usar número por defecto (+5491112345678)
node scripts/configurar-whatsapp.js

# O especificar un número personalizado
node scripts/configurar-whatsapp.js +5491112345678
```

## 🎯 Uso

### Acceso al Catálogo
1. **Desde el Dashboard**: Haz clic en "Ver Catálogo Completo" en la tarjeta del catálogo
2. **URL Directa**: Navega a `/catalogo`
3. **Sitio Independiente**: El catálogo funciona como un sitio web separado

### Comportamiento del Sitio
- **Sin Sidebar**: No se muestra el menú lateral de la aplicación
- **Sin Navegación**: No se puede navegar a otras secciones sin autenticación
- **Vista Focalizada**: Solo muestra el catálogo y sus funcionalidades
- **Footer Informativo**: Incluye información de la empresa y enlace al inicio

### Sistema de Canje
- **Sin Autenticación**: Cualquier usuario puede ver el catálogo y acceder al canje
- **Canje por WhatsApp**: Al hacer clic en "Canjear por WhatsApp" se abre WhatsApp con un mensaje predefinido
- **Mensaje Automático**: Se genera un mensaje con el nombre del premio, código único y cupones requeridos
- **Integración**: El chatbot de WhatsApp procesa la solicitud de canje
- **Moneda del Sistema**: Los cupones se obtienen reciclando (1 kg = 1 cupón)

### Navegación
- **Búsqueda**: Usa la barra de búsqueda para encontrar premios específicos
- **Filtros**: Haz clic en las categorías para filtrar premios
- **Destacados**: Los premios destacados aparecen en un grid responsivo superior
- **Canje**: Haz clic en "Canjear por WhatsApp" para abrir WhatsApp con el mensaje del premio

## 🔧 Personalización

### Agregar Nuevas Categorías
1. Modifica el array `categorias` en el componente
2. Agrega colores personalizados en `getColorCategoria()`
3. Actualiza los estilos CSS si es necesario

### Modificar Estilos
Los estilos están en `catalogo-premios.component.scss` y siguen el patrón de diseño de la aplicación.

### Agregar Funcionalidades
- **Sistema de Favoritos**: Implementar guardado de premios favoritos
- **Comparador**: Permitir comparar premios
- **Recomendaciones**: Basadas en historial de canjes
- **Notificaciones**: Alertas de nuevos premios o stock

## 🧪 Testing

### Endpoints del Backend
```bash
# Obtener premios activos (público)
GET /premios/catalogo

# Obtener premios destacados (público)
GET /premios/catalogo/destacados

# Buscar premios (público)
GET /premios/catalogo/buscar?q=auriculares

# Obtener premios por categoría (público)
GET /premios/catalogo/categoria/Electrónicos

# Obtener premio por ID (público)
GET /premios/catalogo/:id
```

### Pruebas del Frontend
1. Navega al catálogo
2. Prueba la búsqueda
3. Filtra por categorías
4. Verifica la responsividad en móviles
5. Prueba el canje por WhatsApp (no requiere autenticación)

## 🐛 Solución de Problemas

### Error de Carga
- Verifica que el backend esté funcionando
- Revisa la consola del navegador
- Confirma que las rutas estén registradas

### Premios No Aparecen
- Ejecuta el script de premios de ejemplo
- Verifica que los premios tengan `activo: true`
- Revisa la consola del backend

### Problemas de Autenticación
- El catálogo es accesible sin autenticación
- Solo se requiere autenticación para funcionalidades administrativas
- El canje por WhatsApp funciona para todos los usuarios

## 📱 Responsividad

El catálogo está optimizado para:
- **Móviles**: Diseño adaptativo con tarjetas apiladas
- **Tablets**: Grid de 2 columnas
- **Desktop**: Grid de 3 columnas con hover effects

## 🔒 Seguridad

- **Rutas Públicas**: Solo lectura de premios activos
- **Rutas Protegidas**: CRUD completo para administradores
- **Validación**: Verificación de stock antes del canje
- **Sanitización**: Limpieza de inputs de búsqueda
- **Canje Público**: Accesible para todos los usuarios sin autenticación

## 🚀 Futuras Mejoras

- [ ] Sistema de imágenes para premios
- [ ] Integración con sistema de cupones
- [ ] Notificaciones push para nuevos premios
- [ ] Sistema de reseñas y calificaciones
- [ ] Integración con redes sociales
- [ ] Sistema de recomendaciones IA
- [ ] Historial completo de canjes
- [ ] Exportación de catálogo en PDF

## 📞 Soporte

Para dudas o problemas:
1. Revisa este documento
2. Consulta los logs del backend
3. Verifica la consola del navegador
4. Contacta al equipo de desarrollo

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024  
**Desarrollado por**: Equipo Ekokai

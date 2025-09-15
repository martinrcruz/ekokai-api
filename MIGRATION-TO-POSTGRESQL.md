# Migración a PostgreSQL 15 - Ekokai API

Este documento describe la migración completa del proyecto Ekokai API de MongoDB/SQLite a PostgreSQL 15.

## Cambios Realizados

### 1. Dependencias Actualizadas

Se han actualizado las dependencias en `package.json`:

**Removidas:**
- `mongoose` - ORM para MongoDB
- `sqlite3` - Driver para SQLite

**Agregadas:**
- `pg` - Driver para PostgreSQL
- `pg-hstore` - Serializador para PostgreSQL
- `sequelize-cli` - CLI para migraciones y seeders

### 2. Configuración de Base de Datos

#### Archivo `.sequelizerc`
Configuración de rutas para Sequelize CLI.

#### Archivo `src/config/database.js`
Configuración de conexión para diferentes entornos (development, test, production).

#### Archivo `src/config/sequelize.js`
Configuración principal de Sequelize con PostgreSQL.

### 3. Modelos Migrados

Todos los modelos han sido migrados de Mongoose a Sequelize:

- **Usuario** - Gestión de usuarios con roles (vecino, encargado, administrador)
- **Ecopunto** - Puntos de reciclaje
- **TipoResiduo** - Tipos de residuos reciclables
- **EntregaResiduo** - Registro de entregas de residuos
- **Cupon** - Sistema de cupones
- **CuponUso** - Historial de uso de cupones
- **CuponMoneda** - Moneda virtual de cupones
- **CuponHistorialGanado** - Historial de cupones ganados
- **CuponHistorialGastado** - Historial de cupones gastados
- **Premio** - Catálogo de premios
- **Canje** - Registro de canjes
- **EcopuntoMeta** - Metas mensuales de ecopuntos
- **Recompensa** - Sistema de recompensas
- **CanjeRecompensa** - Canjes de recompensas
- **Trazabilidad** - Trazabilidad de procesos
- **CanjeReciclaje** - Canjes por reciclaje
- **QRReciclaje** - Códigos QR para reciclaje

### 4. Migraciones

Se han creado migraciones para todas las tablas con:
- Estructura de tablas con UUIDs como claves primarias
- Relaciones entre tablas (foreign keys)
- Índices para optimizar consultas
- Enums para valores predefinidos
- Campos JSONB para datos flexibles

### 5. Seeders

Se han creado seeders para datos iniciales:
- **Usuarios administradores** - admin@ekokai.com / superadmin@ekokai.com (password: admin123)
- **Tipos de residuo** - Papel, Plástico, Vidrio, Metal, Orgánico, Electrónicos
- **Premios iniciales** - Descuentos, café gratis, plantas, libros, bolsas reutilizables
- **Ecopuntos iniciales** - Centro, Palermo, Belgrano, Recoleta

## Instalación y Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crear archivo `.env` con:

```env
# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ekokai_db
DB_USER=postgres
DB_PASSWORD=postgres

# Entorno
NODE_ENV=development
```

### 3. Crear Base de Datos

```bash
# Crear la base de datos
npm run db:create

# Ejecutar migraciones
npm run db:migrate

# Cargar datos iniciales
npm run db:seed
```

### 4. Comandos Disponibles

```bash
# Migraciones
npm run db:migrate              # Ejecutar migraciones
npm run db:migrate:undo         # Deshacer última migración
npm run db:migrate:undo:all     # Deshacer todas las migraciones

# Seeders
npm run db:seed                 # Ejecutar todos los seeders
npm run db:seed:undo            # Deshacer todos los seeders

# Base de datos
npm run db:create               # Crear base de datos
npm run db:drop                 # Eliminar base de datos
npm run db:reset                # Reset completo (drop + create + migrate + seed)
```

## Estructura de Base de Datos

### Tablas Principales

1. **usuarios** - Usuarios del sistema
2. **ecopuntos** - Puntos de reciclaje
3. **tiporesiduos** - Tipos de residuos
4. **entregas** - Entregas de residuos
5. **cupones** - Sistema de cupones
6. **premios** - Catálogo de premios
7. **canjes** - Registro de canjes

### Relaciones Principales

- Usuario → Ecopunto (Many-to-One)
- Usuario → EntregaResiduo (One-to-Many)
- Ecopunto → EntregaResiduo (One-to-Many)
- TipoResiduo → EntregaResiduo (One-to-Many)
- Cupon → EntregaResiduo (One-to-Many)
- Usuario → Canje (One-to-Many)
- Cupon → Canje (One-to-Many)

## Credenciales de Acceso

### Usuarios Administradores

1. **Admin Principal**
   - Email: admin@ekokai.com
   - Password: admin123
   - Rol: administrador

2. **Super Admin**
   - Email: superadmin@ekokai.com
   - Password: admin123
   - Rol: administrador

## Notas Importantes

1. **UUIDs**: Todas las claves primarias son UUIDs para mejor escalabilidad
2. **Timestamps**: Todas las tablas incluyen campos de creación y actualización
3. **Índices**: Se han creado índices en campos frecuentemente consultados
4. **Enums**: Se utilizan ENUMs para valores predefinidos
5. **JSONB**: Se utiliza JSONB para campos flexibles como metadata y configuración
6. **Relaciones**: Todas las relaciones están correctamente definidas con foreign keys

## Migración desde MongoDB/SQLite

Si tienes datos existentes en MongoDB o SQLite, necesitarás:

1. Exportar los datos existentes
2. Transformar el formato de datos (IDs de ObjectId a UUID)
3. Crear scripts de migración personalizados
4. Importar los datos transformados

## Soporte

Para cualquier problema o consulta sobre la migración, contactar al equipo de desarrollo.

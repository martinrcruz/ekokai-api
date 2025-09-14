# Guía de Despliegue - EKOKAI API

## Problema Resuelto: Error SQLite3 en Digital Ocean

### Error Original
```
Error: Error loading shared library /app/node_modules/sqlite3/build/Release/node_sqlite3.node: Exec format error
```

### Solución Implementada

1. **Dockerfile actualizado** con dependencias del sistema para SQLite3
2. **Rebuild automático** de SQLite3 para la arquitectura correcta
3. **Scripts de verificación** para validar la instalación

### Pasos para Desplegar

#### 1. Construir la imagen Docker
```bash
docker build -t ekokai-api .
```

#### 2. Verificar SQLite3 localmente (opcional)
```bash
npm run verify-sqlite
```

#### 3. Ejecutar en Digital Ocean
```bash
docker run -p 8080:8080 ekokai-api
```

### Cambios Realizados

#### Dockerfile
- ✅ Instalación de dependencias del sistema (python3, make, g++, sqlite-dev)
- ✅ Rebuild automático de SQLite3 después de npm install
- ✅ Optimización con .dockerignore

#### package.json
- ✅ Script postinstall para rebuild automático
- ✅ Script verify-sqlite para validación

#### Scripts
- ✅ `scripts/verify-sqlite.js` - Verificación de SQLite3
- ✅ `.dockerignore` - Optimización del build

### Variables de Entorno Requeridas

Asegúrate de tener configuradas estas variables en Digital Ocean:

```env
PORT=8080
NODE_ENV=production
MONGO_URI_DB1=tu_mongo_uri
SQLITE_PATH=/app/data/database.sqlite
```

### Verificación Post-Despliegue

1. El servidor debe iniciar sin errores de SQLite3
2. Los logs deben mostrar: "✅ Conexión a Sequelize establecida correctamente"
3. La API debe responder en el puerto configurado

### Troubleshooting

Si aún tienes problemas:

1. **Limpiar cache de Docker:**
   ```bash
   docker system prune -a
   ```

2. **Rebuild completo:**
   ```bash
   docker build --no-cache -t ekokai-api .
   ```

3. **Verificar arquitectura:**
   ```bash
   docker run --rm ekokai-api uname -m
   ```

### Notas Importantes

- El rebuild de SQLite3 puede tomar algunos minutos
- Asegúrate de que el volumen para la base de datos SQLite esté montado correctamente
- Para producción, considera migrar a PostgreSQL para mejor rendimiento

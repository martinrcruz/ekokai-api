#!/bin/sh

echo "🚀 Iniciando Ekokai API..."

# Esperar un momento para que la base de datos esté lista
echo "⏳ Esperando que la base de datos esté lista..."
sleep 5

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones de base de datos..."
npm run db:migrate:prod

# Verificar si las migraciones fueron exitosas
if [ $? -eq 0 ]; then
    echo "✅ Migraciones completadas exitosamente"
else
    echo "❌ Error en las migraciones, pero continuando..."
fi

# Iniciar la aplicación
echo "🚀 Iniciando servidor..."
npm start

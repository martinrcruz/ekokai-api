#!/bin/sh

echo "🚀 Iniciando Ekokai API..."

# Esperar un momento para que la base de datos esté lista
echo "⏳ Esperando que la base de datos esté lista..."
sleep 3

# Verificar si las migraciones ya se ejecutaron durante el build
echo "🔍 Verificando si las migraciones ya se ejecutaron..."

# Intentar ejecutar migraciones solo si es necesario
echo "🔄 Ejecutando migraciones si es necesario..."
npx sequelize-cli db:migrate || echo "⚠️ Las migraciones ya están ejecutadas o hubo un error"

# Iniciar la aplicación
echo "🚀 Iniciando servidor..."
npm start

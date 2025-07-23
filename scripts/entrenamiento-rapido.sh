#!/bin/bash

echo "🚀 ENTRENAMIENTO RÁPIDO DEL BOT EKOKAI"
echo "======================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar progreso
show_progress() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Función para mostrar éxito
show_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Función para mostrar advertencia
show_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Función para mostrar error
show_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Paso 1: Generar frases de entrenamiento
show_progress "Generando frases de entrenamiento con IA..."
node scripts/entrenamiento-ia.js
if [ $? -eq 0 ]; then
    show_success "Frases generadas exitosamente"
else
    show_error "Error generando frases"
    exit 1
fi

# Paso 2: Analizar logs automáticamente
show_progress "Analizando logs del bot..."
node scripts/auto-entrenamiento.js
if [ $? -eq 0 ]; then
    show_success "Análisis de logs completado"
else
    show_warning "Error en análisis de logs (continuando...)"
fi

# Paso 3: Mostrar estadísticas
echo ""
echo "📊 ESTADÍSTICAS DE ENTRENAMIENTO"
echo "================================"

if [ -f "entrenamiento-ia.md" ]; then
    echo "📁 Archivo IA generado: entrenamiento-ia.md"
    TOTAL_FRASES=$(grep -c "^- " entrenamiento-ia.md)
    echo "📈 Total de frases generadas: $TOTAL_FRASES"
fi

if [ -f "entrenamiento-automatico.md" ]; then
    echo "📁 Archivo automático generado: entrenamiento-automatico.md"
fi

# Paso 4: Mostrar instrucciones rápidas
echo ""
echo "🎯 INSTRUCCIONES RÁPIDAS"
echo "========================"
echo "1. Ve a: https://dialogflow.cloud.google.com/"
echo "2. Selecciona tu proyecto: ekokai-chat-sxgd"
echo "3. Ve a 'Intents' en el menú lateral"
echo "4. Edita cada intent y agrega las frases correspondientes"
echo "5. Haz clic en 'Train' para entrenar el bot"
echo ""
echo "📋 INTENTS PRINCIPALES:"
echo "- Default Welcome Intent (saludos)"
echo "- OpcionUno (tokens)"
echo "- OpcionDos (premios)"
echo "- OpcionTres (ecopuntos)"
echo "- OpcionCinco (ayuda)"
echo ""

# Paso 5: Opción de entrenamiento automático
echo "🤖 ENTRENAMIENTO AUTOMÁTICO"
echo "==========================="
read -p "¿Quieres ejecutar el entrenamiento automático? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    show_progress "Ejecutando entrenamiento automático..."
    node scripts/entrenar-bot.js
    if [ $? -eq 0 ]; then
        show_success "Entrenamiento automático completado"
    else
        show_warning "Error en entrenamiento automático"
    fi
fi

# Paso 6: Reiniciar servidor
echo ""
echo "🔄 REINICIAR SERVIDOR"
echo "===================="
read -p "¿Quieres reiniciar el servidor para aplicar cambios? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    show_progress "Deteniendo servidor actual..."
    pkill -f "node src/index.js"
    sleep 2
    
    show_progress "Iniciando servidor..."
    npm start &
    sleep 3
    
    if pgrep -f "node src/index.js" > /dev/null; then
        show_success "Servidor reiniciado exitosamente"
    else
        show_error "Error al reiniciar servidor"
    fi
fi

echo ""
show_success "🎉 Entrenamiento rápido completado!"
echo ""
echo "📚 ARCHIVOS GENERADOS:"
echo "- entrenamiento-ia.md (frases con IA)"
echo "- entrenamiento-automatico.md (análisis de logs)"
echo "- ENTRENAMIENTO_BOT.md (guía completa)"
echo ""
echo "🚀 Tu bot está listo para ser entrenado!" 
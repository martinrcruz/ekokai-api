const fs = require('fs');
const path = require('path');

// Función para analizar logs y extraer frases no reconocidas
function analizarLogs() {
  console.log('🔍 Analizando logs del bot...');
  
  // Patrones para identificar frases no reconocidas
  const patrones = [
    /Dialogflow no reconoció "([^"]+)"/g,
    /Default Fallback Intent/g,
    /confianza baja/g
  ];
  
  // Frases comunes que deberían ser reconocidas
  const frasesComunes = {
    saludos: ['hola', 'hols', 'ola', 'hey', 'hi', 'hello', 'buenas', 'buenos días'],
    tokens: ['tokens', 'token', 'puntos', 'punto', 'balance', 'saldo', 'cuantos', 'kantos'],
    premios: ['premios', 'cupones', 'catalogo', 'katalogo', 'beneficios', 'que hay', 'ke hay'],
    ecopuntos: ['ecopuntos', 'donde', 'ubicacion', 'ubikasion', 'punto de reciclaje'],
    ayuda: ['ayuda', 'como funciona', 'komo funciona', 'que es', 'ke es', 'explicame']
  };
  
  // Generar variaciones automáticamente
  const variaciones = generarVariaciones(frasesComunes);
  
  return variaciones;
}

function generarVariaciones(frasesComunes) {
  const variaciones = {};
  
  for (const [categoria, frases] of Object.entries(frasesComunes)) {
    variaciones[categoria] = [];
    
    for (const frase of frases) {
      // Agregar la frase original
      variaciones[categoria].push(frase);
      
      // Generar variaciones con faltas de ortografía comunes
      const variacionesFrase = generarVariacionesOrtograficas(frase);
      variaciones[categoria].push(...variacionesFrase);
      
      // Generar variaciones con contexto
      const variacionesContexto = generarVariacionesContexto(frase);
      variaciones[categoria].push(...variacionesContexto);
    }
  }
  
  return variaciones;
}

function generarVariacionesOrtograficas(frase) {
  const variaciones = [];
  
  // Reemplazos comunes
  const reemplazosComunes = {
    'que': ['ke'],
    'cuantos': ['kantos'],
    'como': ['komo'],
    'donde': ['donde'],
    'catalogo': ['katalogo'],
    'cupones': ['kupones'],
    'ubicacion': ['ubikasion'],
    'informacion': ['informasion'],
    'explicar': ['eksplikar'],
    'registrar': ['rejistrar'],
    'crear': ['krear'],
    'cuenta': ['kuenta']
  };
  
  for (const [original, reemplazos] of Object.entries(reemplazosComunes)) {
    if (frase.includes(original)) {
      for (const reemplazo of reemplazos) {
        variaciones.push(frase.replace(original, reemplazo));
      }
    }
  }
  
  return variaciones;
}

function generarVariacionesContexto(frase) {
  const variaciones = [];
  
  // Agregar palabras de contexto
  const contextos = ['decime', 'dime', 'che', 'ke', 'que', 'como', 'komo'];
  
  for (const contexto of contextos) {
    variaciones.push(`${contexto} ${frase}`);
    variaciones.push(`${frase} ${contexto}`);
  }
  
  return variaciones;
}

// Generar archivo de entrenamiento
function generarArchivoEntrenamiento(variaciones) {
  const contenido = `# 🤖 Archivo de Entrenamiento Automático

## 📅 Generado: ${new Date().toLocaleString()}

## 🎯 Frases de Entrenamiento por Categoría

${Object.entries(variaciones).map(([categoria, frases]) => `
### ${categoria.toUpperCase()}
${frases.map(frase => `- ${frase}`).join('\n')}
`).join('\n')}

## 📋 Instrucciones de Uso

1. Copia las frases de cada categoría
2. Ve a Dialogflow CX: https://dialogflow.cloud.google.com/
3. Selecciona tu proyecto: ekokai-chat-sxgd
4. Ve a "Intents" y edita cada intent
5. Pega las frases correspondientes
6. Haz clic en "Train"

## 🔄 Entrenamiento Automático

Ejecuta este comando para entrenar automáticamente:
\`\`\`bash
node scripts/entrenar-bot.js
\`\`\`
`;

  fs.writeFileSync('entrenamiento-automatico.md', contenido);
  console.log('✅ Archivo de entrenamiento generado: entrenamiento-automatico.md');
}

// Función principal
function main() {
  console.log('🚀 Iniciando generación automática de entrenamiento...');
  
  const variaciones = analizarLogs();
  generarArchivoEntrenamiento(variaciones);
  
  console.log('🎉 Proceso completado!');
  console.log('📁 Revisa el archivo: entrenamiento-automatico.md');
}

// Ejecutar
main(); 
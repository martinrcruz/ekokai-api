const fs = require('fs');

// Patrones de IA para generar frases de entrenamiento
class EntrenamientoIA {
  constructor() {
    this.patrones = {
      saludos: {
        base: ['hola', 'ola', 'hey', 'hi', 'hello', 'buenas', 'buenos días'],
        variaciones: ['hols', 'holaa', 'olaa', 'heyy', 'hii', 'helloo'],
        contexto: ['que tal', 'ke tal', 'como estas', 'komo estas', 'todo bien'],
        formalidad: ['saludos', 'saludo', 'buen día', 'buen dia']
      },
      tokens: {
        base: ['tokens', 'token', 'puntos', 'punto', 'balance', 'saldo'],
        variaciones: ['tokenes', 'puntitos', 'balanse', 'akumulados'],
        contexto: ['mis', 'mi', 'tengo', 'cuantos', 'kantos', 'ver', 'mostrar'],
        accion: ['decime', 'dime', 'che', 'ke', 'que', 'como', 'komo']
      },
      premios: {
        base: ['premios', 'cupones', 'catalogo', 'catálogo', 'beneficios'],
        variaciones: ['kupones', 'katalogo', 'katálogo', 'beneficios'],
        contexto: ['hay', 'ai', 'disponible', 'disponibles', 'que', 'ke'],
        accion: ['ver', 'mostrar', 'que hay', 'ke hay', 'que ai', 'ke ai']
      },
      ecopuntos: {
        base: ['ecopuntos', 'punto', 'puntos', 'donde', 'ubicacion', 'ubicación'],
        variaciones: ['ekopuntos', 'ubikasion', 'ubikación', 'donde ai'],
        contexto: ['hay', 'ai', 'estan', 'están', 'cerca', 'cercano'],
        accion: ['decime', 'dime', 'donde', 'donde', 'como', 'komo']
      },
      ayuda: {
        base: ['ayuda', 'como funciona', 'que es', 'qué es', 'explicar'],
        variaciones: ['komo funciona', 'ke es', 'eksplikar', 'informasion'],
        contexto: ['ekokai', 'sistema', 'esto', 'eso', 'todo'],
        accion: ['decime', 'dime', 'explicame', 'ayudame', 'ayúdame']
      }
    };
  }

  // Generar combinaciones inteligentes
  generarCombinaciones(categoria) {
    const patron = this.patrones[categoria];
    const combinaciones = [];

    // Combinar base + contexto + acción
    for (const base of patron.base) {
      for (const contexto of patron.contexto || []) {
        for (const accion of patron.accion || []) {
          combinaciones.push(`${accion} ${contexto} ${base}`);
          combinaciones.push(`${contexto} ${base} ${accion}`);
        }
      }
    }

    // Combinar base + variaciones
    for (const base of patron.base) {
      combinaciones.push(base);
      for (const variacion of patron.variaciones) {
        if (this.esVariacionDe(base, variacion)) {
          combinaciones.push(variacion);
        }
      }
    }

    // Combinar con formalidad
    for (const formal of patron.formalidad || []) {
      combinaciones.push(formal);
    }

    return [...new Set(combinaciones)]; // Eliminar duplicados
  }

  esVariacionDe(original, variacion) {
    const reemplazos = {
      'que': 'ke',
      'cuantos': 'kantos',
      'como': 'komo',
      'catalogo': 'katalogo',
      'cupones': 'kupones',
      'ubicacion': 'ubikasion',
      'hola': 'hols',
      'ola': 'olaa'
    };

    return Object.entries(reemplazos).some(([orig, repl]) => 
      original.includes(orig) && variacion.includes(repl)
    );
  }

  // Generar frases con patrones de lenguaje natural
  generarFrasesNaturales() {
    const frases = {};

    for (const categoria of Object.keys(this.patrones)) {
      frases[categoria] = this.generarCombinaciones(categoria);
    }

    return frases;
  }

  // Analizar logs y generar frases específicas
  analizarLogsYGenerar(logs) {
    const frasesNoReconocidas = this.extraerFrasesNoReconocidas(logs);
    const frasesGeneradas = this.generarFrasesNaturales();

    // Agregar frases específicas de los logs
    for (const frase of frasesNoReconocidas) {
      const categoria = this.clasificarFrase(frase);
      if (categoria && frasesGeneradas[categoria]) {
        frasesGeneradas[categoria].push(frase);
      }
    }

    return frasesGeneradas;
  }

  extraerFrasesNoReconocidas(logs) {
    const frases = [];
    const patron = /Dialogflow no reconoció "([^"]+)"/g;
    let match;

    while ((match = patron.exec(logs)) !== null) {
      frases.push(match[1]);
    }

    return [...new Set(frases)];
  }

  clasificarFrase(frase) {
    const clasificacion = {
      saludos: ['hola', 'ola', 'hey', 'hi', 'hello', 'buenas', 'saludos'],
      tokens: ['token', 'punto', 'balance', 'saldo', 'cuantos', 'kantos'],
      premios: ['premio', 'cupon', 'catalogo', 'beneficio', 'que hay', 'ke hay'],
      ecopuntos: ['ecopunto', 'donde', 'ubicacion', 'ubikasion'],
      ayuda: ['ayuda', 'como', 'komo', 'que es', 'ke es', 'explicar']
    };

    for (const [categoria, palabras] of Object.entries(clasificacion)) {
      if (palabras.some(palabra => frase.toLowerCase().includes(palabra))) {
        return categoria;
      }
    }

    return null;
  }
}

// Función principal
async function main() {
  console.log('🤖 Iniciando entrenamiento con IA...');

  const ia = new EntrenamientoIA();
  
  // Generar frases automáticamente
  const frasesGeneradas = ia.generarFrasesNaturales();
  
  // Crear archivo de entrenamiento
  const contenido = `# 🤖 Entrenamiento Inteligente del Bot

## 📅 Generado automáticamente: ${new Date().toLocaleString()}

## 🎯 Frases de Entrenamiento por Categoría

${Object.entries(frasesGeneradas).map(([categoria, frases]) => `
### ${categoria.toUpperCase()} (${frases.length} frases)
${frases.map(frase => `- ${frase}`).join('\n')}
`).join('\n')}

## 📊 Estadísticas
- Total de frases generadas: ${Object.values(frasesGeneradas).flat().length}
- Categorías: ${Object.keys(frasesGeneradas).length}

## 🚀 Uso Rápido

1. **Entrenamiento Manual:**
   - Ve a Dialogflow CX
   - Copia y pega las frases por categoría

2. **Entrenamiento Automático:**
   \`\`\`bash
   node scripts/entrenar-bot.js
   \`\`\`

3. **Análisis de Logs:**
   \`\`\`bash
   node scripts/auto-entrenamiento.js
   \`\`\`
`;

  fs.writeFileSync('entrenamiento-ia.md', contenido);
  console.log('✅ Archivo de entrenamiento IA generado: entrenamiento-ia.md');
  console.log(`📊 Total de frases generadas: ${Object.values(frasesGeneradas).flat().length}`);
}

// Ejecutar
main().catch(console.error); 
#!/usr/bin/env node

/**
 * Script para configurar el número de WhatsApp del chatbot
 * Este script actualiza los archivos de environment con el número correcto
 */

const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Función para colorear texto
function colorize(text, color) {
  return colors[color] + text + colors.reset;
}

// Función para leer archivo
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(colorize(`❌ Error al leer ${filePath}:`, 'red'), error.message);
    return null;
  }
}

// Función para escribir archivo
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(colorize(`❌ Error al escribir ${filePath}:`, 'red'), error.message);
    return false;
  }
}

// Función para actualizar environment
function updateEnvironment(filePath, newNumber) {
  console.log(colorize(`📝 Actualizando ${path.basename(filePath)}...`, 'blue'));
  
  const content = readFile(filePath);
  if (!content) return false;
  
  // Buscar y reemplazar el número de WhatsApp
  const regex = /whatsappNumber:\s*'[^']*'/;
  const replacement = `whatsappNumber: '${newNumber}'`;
  
  if (regex.test(content)) {
    const newContent = content.replace(regex, replacement);
    return writeFile(filePath, newContent);
  } else {
    // Si no existe, agregarlo después de version
    const versionRegex = /version:\s*'[^']*'/;
    if (versionRegex.test(content)) {
      const newContent = content.replace(versionRegex, `$&\n  whatsappNumber: '${newNumber}'`);
      return writeFile(filePath, newContent);
    }
  }
  
  return false;
}

// Función principal
function main() {
  console.log(colorize('🚀 Configurador de WhatsApp para Ekokai', 'bright'));
  console.log(colorize('=====================================', 'cyan'));
  
  // Obtener número de WhatsApp del usuario
  const args = process.argv.slice(2);
  let whatsappNumber;
  
  if (args.length > 0) {
    whatsappNumber = args[0];
  } else {
    console.log(colorize('\n📱 Por favor, ingresa el número de WhatsApp del chatbot:', 'yellow'));
    console.log(colorize('   Formato: +5491112345678 (con código de país)', 'cyan'));
    console.log(colorize('   Ejemplo: +5491112345678', 'cyan'));
    
    // En un entorno real, usarías readline para input interactivo
    // Por ahora, usamos un valor por defecto
    whatsappNumber = '+5491112345678';
    console.log(colorize(`\n🔧 Usando número por defecto: ${whatsappNumber}`, 'yellow'));
    console.log(colorize('   Para usar un número personalizado, ejecuta:', 'cyan'));
    console.log(colorize(`   node scripts/configurar-whatsapp.js +5491112345678`, 'green'));
  }
  
  // Validar formato del número
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(whatsappNumber)) {
    console.error(colorize('❌ Formato de número inválido', 'red'));
    console.error(colorize('   Debe incluir código de país (+54 para Argentina)', 'red'));
    console.error(colorize('   Ejemplo: +5491112345678', 'red'));
    process.exit(1);
  }
  
  console.log(colorize(`\n✅ Número validado: ${whatsappNumber}`, 'green'));
  
  // Rutas de los archivos a actualizar
  const files = [
    '../ekokai-front/src/environments/environment.ts',
    '../ekokai-front/src/environments/environment.prod.ts'
  ];
  
  let successCount = 0;
  
  // Actualizar cada archivo
  files.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      if (updateEnvironment(fullPath, whatsappNumber)) {
        console.log(colorize(`✅ ${path.basename(filePath)} actualizado`, 'green'));
        successCount++;
      } else {
        console.log(colorize(`❌ Error al actualizar ${path.basename(filePath)}`, 'red'));
      }
    } else {
      console.log(colorize(`⚠️  Archivo no encontrado: ${path.basename(filePath)}`, 'yellow'));
    }
  });
  
  // Resumen
  console.log(colorize('\n📊 Resumen de la configuración:', 'bright'));
  console.log(colorize(`   Archivos actualizados: ${successCount}/${files.length}`, successCount === files.length ? 'green' : 'yellow'));
  console.log(colorize(`   Número configurado: ${whatsappNumber}`, 'green'));
  
  if (successCount === files.length) {
    console.log(colorize('\n🎉 ¡Configuración completada exitosamente!', 'green'));
    console.log(colorize('   El catálogo de premios ahora usará este número para WhatsApp', 'cyan'));
  } else {
    console.log(colorize('\n⚠️  Algunos archivos no pudieron ser actualizados', 'yellow'));
    console.log(colorize('   Revisa los errores anteriores', 'red'));
  }
  
  console.log(colorize('\n💡 Para probar la configuración:', 'cyan'));
  console.log(colorize('   1. Reinicia el servidor de desarrollo', 'cyan'));
  console.log(colorize('   2. Navega al catálogo de premios', 'cyan'));
  console.log(colorize('   3. Haz clic en "Canjear por WhatsApp"', 'cyan'));
  console.log(colorize('   4. Verifica que se abra WhatsApp con el número correcto', 'cyan'));
}

// Ejecutar script
if (require.main === module) {
  main();
}

module.exports = { updateEnvironment };




const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Configuración
const URL_BASE = 'http://localhost:8080'; // Cambiar por tu URL de producción
const URL_REGISTRO = `${URL_BASE}/registro-qr.html`;
const OUTPUT_DIR = './public/qr-codes';

// Crear directorio si no existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Función para generar QR
async function generarQR(data, filename) {
  try {
    const qrPath = path.join(OUTPUT_DIR, filename);
    
    await QRCode.toFile(qrPath, data, {
      color: {
        dark: '#2c3e50',  // Color oscuro
        light: '#ffffff'  // Color claro
      },
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'H'
    });
    
    console.log(`✅ QR generado: ${filename}`);
    return qrPath;
  } catch (error) {
    console.error(`❌ Error generando QR ${filename}:`, error);
    throw error;
  }
}

// Función para generar QR con logo personalizado
async function generarQRConLogo(data, filename, logoPath = null) {
  try {
    const qrPath = path.join(OUTPUT_DIR, filename);
    
    const options = {
      color: {
        dark: '#2c3e50',
        light: '#ffffff'
      },
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'H'
    };
    
    // Si hay logo, agregarlo
    if (logoPath && fs.existsSync(logoPath)) {
      options.logo = logoPath;
      options.logoWidth = 80;
      options.logoHeight = 80;
    }
    
    await QRCode.toFile(qrPath, data, options);
    
    console.log(`✅ QR con logo generado: ${filename}`);
    return qrPath;
  } catch (error) {
    console.error(`❌ Error generando QR con logo ${filename}:`, error);
    throw error;
  }
}

// Función para generar múltiples QRs
async function generarQRsMultiples() {
  console.log('🚀 Generando códigos QR para EKOKAI...');
  console.log('='.repeat(50));
  
  const qrs = [
    {
      data: URL_REGISTRO,
      filename: 'registro-ekokai.png',
      descripcion: 'Registro general'
    },
    {
      data: `${URL_REGISTRO}?source=ecopunto`,
      filename: 'registro-ecopunto.png',
      descripcion: 'Registro desde ecopunto'
    },
    {
      data: `${URL_REGISTRO}?source=comercio`,
      filename: 'registro-comercio.png',
      descripcion: 'Registro desde comercio aliado'
    },
    {
      data: `${URL_REGISTRO}?source=evento`,
      filename: 'registro-evento.png',
      descripcion: 'Registro desde evento'
    }
  ];
  
  for (const qr of qrs) {
    try {
      await generarQR(qr.data, qr.filename);
      console.log(`   📱 ${qr.descripcion}: ${qr.data}`);
    } catch (error) {
      console.error(`   ❌ Error en ${qr.descripcion}`);
    }
  }
  
  console.log('\n📊 Resumen de QRs generados:');
  console.log(`   📁 Directorio: ${OUTPUT_DIR}`);
  console.log(`   🔗 URL base: ${URL_BASE}`);
  console.log(`   📱 Total generados: ${qrs.length}`);
  
  // Generar archivo de información
  const infoContent = `# 📱 Códigos QR EKOKAI

## 📅 Generado: ${new Date().toLocaleString()}

## 🔗 URLs de Registro

${qrs.map(qr => `### ${qr.descripcion}
- **Archivo**: ${qr.filename}
- **URL**: ${qr.data}
- **Descripción**: ${qr.descripcion}

`).join('\n')}

## 📋 Instrucciones de Uso

1. **Imprimir los QRs** en alta calidad
2. **Colocarlos estratégicamente** en:
   - Ecopuntos
   - Comercios aliados
   - Eventos
   - Folletos publicitarios

3. **Los usuarios escanean** el QR con su cámara
4. **Se abre la página** de registro automáticamente
5. **Completan sus datos** y se registran
6. **Reciben mensaje** de WhatsApp confirmando

## 🎯 Flujo Completo

1. Usuario escanea QR → 2. Abre página web → 3. Completa formulario → 4. Se registra → 5. Recibe WhatsApp

## 📱 Prueba

Escanea cualquiera de los QRs generados para probar el flujo completo.
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), infoContent);
  console.log(`   📄 Información guardada: ${OUTPUT_DIR}/README.md`);
  
  console.log('\n🎉 ¡QRs generados exitosamente!');
  console.log('📱 Ya puedes imprimirlos y distribuirlos.');
}

// Función para generar QR personalizado
async function generarQRPersonalizado(url, nombre, descripcion) {
  console.log(`🎨 Generando QR personalizado: ${nombre}`);
  
  try {
    const filename = `qr-${nombre.toLowerCase().replace(/\s+/g, '-')}.png`;
    await generarQR(url, filename);
    
    console.log(`   ✅ QR personalizado creado: ${filename}`);
    console.log(`   📝 Descripción: ${descripcion}`);
    console.log(`   🔗 URL: ${url}`);
    
    return filename;
  } catch (error) {
    console.error(`   ❌ Error generando QR personalizado:`, error);
    throw error;
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Generar QRs por defecto
    await generarQRsMultiples();
  } else if (args[0] === 'personalizado') {
    // Generar QR personalizado
    if (args.length < 4) {
      console.log('❌ Uso: node scripts/generar-qr.js personalizado <url> <nombre> <descripcion>');
      return;
    }
    
    const [, , url, nombre, ...descripcionParts] = args;
    const descripcion = descripcionParts.join(' ');
    
    await generarQRPersonalizado(url, nombre, descripcion);
  } else {
    console.log('❌ Comando no reconocido');
    console.log('📋 Uso:');
    console.log('   node scripts/generar-qr.js                    # Generar QRs por defecto');
    console.log('   node scripts/generar-qr.js personalizado <url> <nombre> <descripcion>');
  }
}

// Ejecutar
main().catch(console.error); 
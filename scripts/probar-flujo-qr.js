const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración
const BASE_URL = 'http://localhost:8080';
const QR_DIR = './public/qr-codes';

// Función para verificar que la página web funciona
async function verificarPaginaWeb() {
  console.log('🌐 Verificando página web de registro...');
  console.log('─'.repeat(50));
  
  try {
    const response = await axios.get(`${BASE_URL}/registro-qr.html`);
    
    if (response.status === 200) {
      console.log('✅ Página web funcionando correctamente');
      console.log(`   📄 Status: ${response.status}`);
      console.log(`   📏 Tamaño: ${response.data.length} caracteres`);
      return true;
    } else {
      console.log('❌ Página web no responde correctamente');
      return false;
    }
  } catch (error) {
    console.log('❌ Error accediendo a la página web:', error.message);
    return false;
  }
}

// Función para verificar que los QRs existen
function verificarQRs() {
  console.log('\n📱 Verificando códigos QR generados...');
  console.log('─'.repeat(50));
  
  const qrsEsperados = [
    'registro-ekokai.png',
    'registro-ecopunto.png', 
    'registro-comercio.png',
    'registro-evento.png'
  ];
  
  let qrsEncontrados = 0;
  
  for (const qr of qrsEsperados) {
    const qrPath = path.join(QR_DIR, qr);
    if (fs.existsSync(qrPath)) {
      const stats = fs.statSync(qrPath);
      console.log(`✅ ${qr} (${(stats.size / 1024).toFixed(1)} KB)`);
      qrsEncontrados++;
    } else {
      console.log(`❌ ${qr} - No encontrado`);
    }
  }
  
  console.log(`\n📊 QRs encontrados: ${qrsEncontrados}/${qrsEsperados.length}`);
  return qrsEncontrados === qrsEsperados.length;
}

// Función para probar registro desde la API
async function probarRegistroAPI() {
  console.log('\n🧪 Probando registro desde API...');
  console.log('─'.repeat(50));
  
  const datosPrueba = {
    nombre: 'María',
    apellido: 'González',
    dni: '87654321',
    telefono: '+56987654321',
    email: 'maria.gonzalez@email.com'
  };
  
  try {
    const response = await axios.post(`${BASE_URL}/api/ecopunto/registrar`, datosPrueba);
    
    console.log('✅ Registro API funcionando correctamente');
    console.log(`   👤 Usuario: ${response.data.data.nombre}`);
    console.log(`   📞 Teléfono: ${response.data.data.telefono}`);
    console.log(`   🪙 Tokens: ${response.data.data.tokens}`);
    
    return true;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('⚠️ Usuario ya existe (esperado para pruebas)');
      return true;
    }
    console.log('❌ Error en registro API:', error.response?.data || error.message);
    return false;
  }
}

// Función para generar URLs de prueba
function generarURLsPrueba() {
  console.log('\n🔗 URLs de prueba generadas:');
  console.log('─'.repeat(50));
  
  const urls = [
    { nombre: 'Registro General', url: `${BASE_URL}/registro-qr.html` },
    { nombre: 'Desde Ecopunto', url: `${BASE_URL}/registro-qr.html?source=ecopunto` },
    { nombre: 'Desde Comercio', url: `${BASE_URL}/registro-qr.html?source=comercio` },
    { nombre: 'Desde Evento', url: `${BASE_URL}/registro-qr.html?source=evento` }
  ];
  
  urls.forEach(({ nombre, url }) => {
    console.log(`📱 ${nombre}:`);
    console.log(`   ${url}`);
  });
  
  return urls;
}

// Función para mostrar instrucciones de uso
function mostrarInstrucciones() {
  console.log('\n📋 INSTRUCCIONES DE USO:');
  console.log('='.repeat(50));
  
  console.log('1️⃣ **Imprimir QRs:**');
  console.log('   - Los QRs están en: ./public/qr-codes/');
  console.log('   - Imprimir en alta calidad (mínimo 300 DPI)');
  console.log('   - Tamaño recomendado: 5x5 cm');
  
  console.log('\n2️⃣ **Colocar estratégicamente:**');
  console.log('   - Ecopuntos (registro-ecopunto.png)');
  console.log('   - Comercios aliados (registro-comercio.png)');
  console.log('   - Eventos (registro-evento.png)');
  console.log('   - Folletos publicitarios (registro-ekokai.png)');
  
  console.log('\n3️⃣ **Flujo del usuario:**');
  console.log('   📱 Escanea QR → 🌐 Abre página → ✍️ Completa datos → ✅ Se registra → 📲 Recibe WhatsApp');
  
  console.log('\n4️⃣ **Prueba manual:**');
  console.log('   - Abre la cámara del teléfono');
  console.log('   - Escanea cualquiera de los QRs generados');
  console.log('   - Completa el formulario de registro');
  console.log('   - Verifica que llegue el mensaje de WhatsApp');
}

// Función principal
async function probarFlujoCompleto() {
  console.log('🚀 PROBANDO FLUJO COMPLETO DE REGISTRO POR QR');
  console.log('='.repeat(60));
  console.log(`📱 Base URL: ${BASE_URL}`);
  console.log(`📁 Directorio QR: ${QR_DIR}`);
  console.log('');

  let todoOk = true;

  // Verificar página web
  const paginaOk = await verificarPaginaWeb();
  if (!paginaOk) todoOk = false;

  // Verificar QRs
  const qrsOk = verificarQRs();
  if (!qrsOk) todoOk = false;

  // Verificar API
  const apiOk = await probarRegistroAPI();
  if (!apiOk) todoOk = false;

  // Generar URLs de prueba
  generarURLsPrueba();

  // Mostrar instrucciones
  mostrarInstrucciones();

  // Resumen final
  console.log('\n🎯 RESUMEN FINAL:');
  console.log('='.repeat(50));
  
  if (todoOk) {
    console.log('✅ ¡Flujo completo funcionando correctamente!');
    console.log('📱 Ya puedes distribuir los QRs para registro');
  } else {
    console.log('❌ Hay problemas que necesitan ser solucionados');
    console.log('🔧 Revisa los errores anteriores');
  }

  console.log('\n📱 Para probar manualmente:');
  console.log('   1. Abre tu cámara del teléfono');
  console.log('   2. Escanea uno de los QRs en ./public/qr-codes/');
  console.log('   3. Completa el formulario');
  console.log('   4. Verifica el mensaje de WhatsApp');
}

// Ejecutar pruebas
probarFlujoCompleto().catch(console.error); 
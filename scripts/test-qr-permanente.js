const axios = require('axios');

// Configuración
const BASE_URL = process.env.API_URL || 'http://localhost:8080';

async function testQrPermanente() {
  console.log('🧪 Testing QR Permanente EKOKAI...\n');

  try {
    // 1. Probar endpoint de información del QR
    console.log('1️⃣ Probando /api/qr/info...');
    const infoResponse = await axios.get(`${BASE_URL}/api/qr/info`);
    console.log('✅ Info del QR:', infoResponse.data);
    console.log('📱 URL del formulario:', infoResponse.data.data.qrUrl);
    console.log('🌐 Página del QR:', infoResponse.data.data.qrPageUrl);
    console.log('');

    // 2. Probar endpoint de validación
    console.log('2️⃣ Probando /api/qr/validate...');
    const validateResponse = await axios.get(`${BASE_URL}/api/qr/validate`);
    console.log('✅ Validación del QR:', validateResponse.data);
    console.log('📋 Estado del formulario:', validateResponse.data.data.formStatus);
    console.log('');

    // 3. Probar endpoint de data URL
    console.log('3️⃣ Probando /api/qr/data-url...');
    const dataUrlResponse = await axios.get(`${BASE_URL}/api/qr/data-url`);
    console.log('✅ Data URL generada correctamente');
    console.log('📏 Longitud del data URL:', dataUrlResponse.data.data.qrDataURL.length);
    console.log('');

    // 4. Probar acceso directo al formulario
    console.log('4️⃣ Probando acceso directo al formulario...');
    const formResponse = await axios.get(`${BASE_URL}/registro`);
    console.log('✅ Formulario accesible (status:', formResponse.status, ')');
    console.log('📄 Tipo de contenido:', formResponse.headers['content-type']);
    console.log('');

    // 5. Probar página del QR
    console.log('5️⃣ Probando página del QR...');
    const qrPageResponse = await axios.get(`${BASE_URL}/qr-permanente`);
    console.log('✅ Página del QR accesible (status:', qrPageResponse.status, ')');
    console.log('📄 Tipo de contenido:', qrPageResponse.headers['content-type']);
    console.log('');

    // 6. Probar descarga del QR
    console.log('6️⃣ Probando descarga del QR...');
    const qrDownloadResponse = await axios.get(`${BASE_URL}/api/qr/generate`, {
      responseType: 'arraybuffer'
    });
    console.log('✅ QR descargable (status:', qrDownloadResponse.status, ')');
    console.log('📏 Tamaño del archivo:', qrDownloadResponse.data.length, 'bytes');
    console.log('📄 Tipo de contenido:', qrDownloadResponse.headers['content-type']);
    console.log('');

    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('');
    console.log('📋 Resumen:');
    console.log('   • QR permanente configurado correctamente');
    console.log('   • Formulario de registro accesible');
    console.log('   • Página del QR funcionando');
    console.log('   • Endpoints de API operativos');
    console.log('   • Descarga de QR disponible');
    console.log('');
    console.log('🌐 URLs importantes:');
    console.log(`   • Formulario: ${BASE_URL}/registro`);
    console.log(`   • Página QR: ${BASE_URL}/qr-permanente`);
    console.log(`   • API Info: ${BASE_URL}/api/qr/info`);
    console.log(`   • API Download: ${BASE_URL}/api/qr/generate`);

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Headers:', error.response.headers);
      console.error('📝 Data:', error.response.data);
    }
    
    process.exit(1);
  }
}

// Ejecutar pruebas
testQrPermanente(); 
require('dotenv').config();
const qrWhatsappService = require('./src/services/qrWhatsapp.service');

async function testQRWhatsapp() {
  try {
    console.log('🔄 Iniciando pruebas de QR WhatsApp...');
    
    // Test 1: Crear un código QR
    console.log('\n📝 Test 1: Creando código QR...');
    const qrData = {
      nombre: 'Test QR EKOKAI',
      mensaje: '¡Hola! Este es un mensaje de prueba desde EKOKAI. 🌱',
      descripcion: 'Código QR de prueba para verificar la funcionalidad',
      numeroWhatsapp: '+573001234567',
      fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
    };
    
    const qrCreado = await qrWhatsappService.crearQRWhatsapp(qrData);
    console.log('✅ Código QR creado:', {
      id: qrCreado.id,
      nombre: qrCreado.nombre,
      mensaje: qrCreado.mensaje.substring(0, 50) + '...',
      fechaExpiracion: qrCreado.fechaExpiracion
    });
    
    // Test 2: Obtener códigos QR
    console.log('\n📋 Test 2: Obteniendo códigos QR...');
    const qrs = await qrWhatsappService.obtenerQRs({ limit: 10 });
    console.log(`✅ Se encontraron ${qrs.length} códigos QR`);
    
    // Test 3: Obtener por ID
    console.log('\n🔍 Test 3: Obteniendo QR por ID...');
    const qrPorId = await qrWhatsappService.obtenerQRPorId(qrCreado.id);
    console.log('✅ QR obtenido por ID:', qrPorId.nombre);
    
    // Test 4: Generar enlace WhatsApp
    console.log('\n📱 Test 4: Generando enlace WhatsApp...');
    const enlace = qrPorId.generarEnlaceWhatsapp();
    console.log('✅ Enlace WhatsApp generado:', enlace);
    
    // Test 5: Verificar expiración
    console.log('\n⏰ Test 5: Verificando expiración...');
    const isExpirado = qrPorId.isExpirado();
    console.log(`✅ QR ${isExpirado ? 'está expirado' : 'no está expirado'}`);
    
    // Test 6: Actualizar QR
    console.log('\n✏️ Test 6: Actualizando QR...');
    const datosActualizacion = {
      nombre: 'Test QR EKOKAI - Actualizado',
      mensaje: '¡Mensaje actualizado desde EKOKAI! 🌱♻️'
    };
    
    const qrActualizado = await qrWhatsappService.actualizarQR(qrCreado.id, datosActualizacion);
    console.log('✅ QR actualizado:', qrActualizado.nombre);
    
    // Test 7: Limpiar expirados (no debería limpiar nada)
    console.log('\n🧹 Test 7: Limpiando QRs expirados...');
    const cantidadLimpiados = await qrWhatsappService.limpiarQRsExpirados();
    console.log(`✅ Se desactivaron ${cantidadLimpiados} QRs expirados`);
    
    console.log('\n🎉 Todas las pruebas completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  testQRWhatsapp();
}

module.exports = testQRWhatsapp;

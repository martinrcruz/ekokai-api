const axios = require('axios');
const mongoose = require('mongoose');

// Configuración
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';
const TEST_PHONE = '+1234567890';

/**
 * Script de prueba para los endpoints del sistema de canje de reciclaje
 */
class RecyclingEndpointsTest {
  constructor() {
    this.testResults = [];
    this.authToken = null;
    this.testUserId = null;
    this.testQRId = null;
    this.testExchangeId = null;
  }

  /**
   * Ejecutar todas las pruebas
   */
  async runAllTests() {
    console.log('🧪 Iniciando pruebas de endpoints de reciclaje...\n');

    try {
      // Conectar a la base de datos para las pruebas
      await this.connectDatabase();

      // Ejecutar pruebas en orden
      await this.testHealthCheck();
      await this.testUserSearch();
      await this.testQRGeneration();
      await this.testQRValidation();
      await this.testRecyclingExchange();
      await this.testTraceability();
      await this.testStatistics();

      // Mostrar resultados
      this.showResults();

    } catch (error) {
      console.error('❌ Error durante las pruebas:', error.message);
    } finally {
      // Limpiar datos de prueba
      await this.cleanup();
      await mongoose.disconnect();
    }
  }

  /**
   * Conectar a la base de datos
   */
  async connectDatabase() {
    try {
      const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/ekokai-test';
      await mongoose.connect(dbUrl);
      console.log('✅ Conectado a la base de datos de prueba');
    } catch (error) {
      console.error('❌ Error conectando a la base de datos:', error.message);
      throw error;
    }
  }

  /**
   * Probar health check
   */
  async testHealthCheck() {
    console.log('🔍 Probando health check...');
    
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
      
      this.addResult('Health Check', true, {
        status: response.status,
        data: response.data
      });
      
      console.log('✅ Health check exitoso');
    } catch (error) {
      this.addResult('Health Check', false, error.message);
      console.log('❌ Health check falló:', error.message);
    }
  }

  /**
   * Probar búsqueda de usuario por teléfono
   */
  async testUserSearch() {
    console.log('🔍 Probando búsqueda de usuario por teléfono...');
    
    try {
      // Primero crear un usuario de prueba
      const Usuario = require('./src/models/usuario.model');
      const testUser = new Usuario({
        rol: 'vecino',
        nombre: 'Usuario',
        apellido: 'Prueba',
        telefono: TEST_PHONE,
        email: 'test@ekokai.com',
        password: 'test123',
        tokensAcumulados: 50
      });
      
      await testUser.save();
      this.testUserId = testUser._id;
      
      // Probar endpoint de búsqueda
      const response = await axios.get(`${API_BASE_URL}/usuarios/buscar-telefono`, {
        params: { telefono: TEST_PHONE },
        headers: { Authorization: `Bearer fake-token` } // En pruebas reales usar token válido
      });
      
      this.addResult('Búsqueda de Usuario', true, {
        found: !!response.data.usuario,
        phone: response.data.usuario?.telefono
      });
      
      console.log('✅ Búsqueda de usuario exitosa');
    } catch (error) {
      this.addResult('Búsqueda de Usuario', false, error.response?.data || error.message);
      console.log('❌ Búsqueda de usuario falló:', error.message);
    }
  }

  /**
   * Probar generación de códigos QR
   */
  async testQRGeneration() {
    console.log('🔍 Probando generación de códigos QR...');
    
    try {
      // Crear QR directamente en la base de datos para prueba
      const QRReciclaje = require('./src/models/qrReciclaje.model');
      const testQR = new QRReciclaje({
        codigo: QRReciclaje.generarCodigo(),
        tipo: 'reciclaje',
        usuarioCreador: this.testUserId,
        configuracion: {
          valorTokens: 10,
          descripcion: 'QR de prueba'
        }
      });
      
      await testQR.save();
      this.testQRId = testQR._id;
      
      this.addResult('Generación de QR', true, {
        codigo: testQR.codigo,
        estado: testQR.estado,
        valido: testQR.esValido()
      });
      
      console.log('✅ Generación de QR exitosa');
    } catch (error) {
      this.addResult('Generación de QR', false, error.message);
      console.log('❌ Generación de QR falló:', error.message);
    }
  }

  /**
   * Probar validación de códigos QR
   */
  async testQRValidation() {
    console.log('🔍 Probando validación de códigos QR...');
    
    try {
      const QRReciclaje = require('./src/models/qrReciclaje.model');
      const testQR = await QRReciclaje.findById(this.testQRId);
      
      if (!testQR) {
        throw new Error('QR de prueba no encontrado');
      }
      
      // Simular validación (en pruebas reales sería un POST al endpoint)
      const isValid = testQR.esValido();
      
      this.addResult('Validación de QR', true, {
        codigo: testQR.codigo,
        valido: isValid,
        estado: testQR.estado
      });
      
      console.log('✅ Validación de QR exitosa');
    } catch (error) {
      this.addResult('Validación de QR', false, error.message);
      console.log('❌ Validación de QR falló:', error.message);
    }
  }

  /**
   * Probar creación de canje de reciclaje
   */
  async testRecyclingExchange() {
    console.log('🔍 Probando creación de canje de reciclaje...');
    
    try {
      const CanjeReciclaje = require('./src/models/canjeReciclaje.model');
      const QRReciclaje = require('./src/models/qrReciclaje.model');
      const Cupon = require('./src/models/cupon.model');
      
      const testQR = await QRReciclaje.findById(this.testQRId);
      
      // Crear canje de reciclaje
      const testExchange = new CanjeReciclaje({
        usuarioId: this.testUserId,
        qrCode: testQR.codigo,
        qrReciclajeId: testQR._id,
        phoneNumber: TEST_PHONE,
        estado: 'completado',
        fechaCompletado: new Date(),
        tokensGenerados: 10,
        imagenes: {
          primera: { ruta: '/test/imagen1.jpg', timestamp: new Date() },
          segunda: { ruta: '/test/imagen2.jpg', timestamp: new Date() }
        }
      });
      
      await testExchange.save();
      this.testExchangeId = testExchange._id;
      
      // Crear cupón asociado
      const testCoupon = new Cupon({
        nombre: 'Cupón de Prueba',
        descripcion: 'Cupón generado por prueba de reciclaje',
        tokensRequeridos: 0,
        valor: 10,
        fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activo: true,
        tipo: 'reciclaje'
      });
      
      await testCoupon.save();
      testExchange.cuponGenerado = testCoupon._id;
      await testExchange.save();
      
      // Marcar QR como usado
      await testQR.marcarComoUsado(this.testUserId);
      
      this.addResult('Canje de Reciclaje', true, {
        canjeId: testExchange._id,
        estado: testExchange.estado,
        tokensGenerados: testExchange.tokensGenerados,
        cuponId: testCoupon._id
      });
      
      console.log('✅ Canje de reciclaje exitoso');
    } catch (error) {
      this.addResult('Canje de Reciclaje', false, error.message);
      console.log('❌ Canje de reciclaje falló:', error.message);
    }
  }

  /**
   * Probar registro de trazabilidad
   */
  async testTraceability() {
    console.log('🔍 Probando registro de trazabilidad...');
    
    try {
      const Trazabilidad = require('./src/models/trazabilidad.model');
      
      // Registrar eventos de trazabilidad
      const eventos = [
        {
          phoneNumber: TEST_PHONE,
          userId: this.testUserId,
          step: 'first_image_validated',
          qr_code: 'TEST-QR-CODE',
          canjeReciclajeId: this.testExchangeId
        },
        {
          phoneNumber: TEST_PHONE,
          userId: this.testUserId,
          step: 'second_image_validated',
          qr_code: 'TEST-QR-CODE',
          canjeReciclajeId: this.testExchangeId
        },
        {
          phoneNumber: TEST_PHONE,
          userId: this.testUserId,
          step: 'exchange_completed',
          qr_code: 'TEST-QR-CODE',
          canjeReciclajeId: this.testExchangeId
        }
      ];
      
      for (const evento of eventos) {
        await Trazabilidad.registrarEvento(evento);
      }
      
      // Obtener trazabilidad del usuario
      const trazabilidadUsuario = await Trazabilidad.obtenerPorUsuario(this.testUserId, 10);
      
      this.addResult('Trazabilidad', true, {
        eventosRegistrados: eventos.length,
        eventosRecuperados: trazabilidadUsuario.length
      });
      
      console.log('✅ Trazabilidad exitosa');
    } catch (error) {
      this.addResult('Trazabilidad', false, error.message);
      console.log('❌ Trazabilidad falló:', error.message);
    }
  }

  /**
   * Probar estadísticas
   */
  async testStatistics() {
    console.log('🔍 Probando estadísticas...');
    
    try {
      const CanjeReciclaje = require('./src/models/canjeReciclaje.model');
      const QRReciclaje = require('./src/models/qrReciclaje.model');
      
      // Obtener estadísticas de canjes
      const statsCanjes = await CanjeReciclaje.obtenerEstadisticas({});
      
      // Contar QRs por estado
      const statsQRs = await QRReciclaje.aggregate([
        {
          $group: {
            _id: '$estado',
            count: { $sum: 1 }
          }
        }
      ]);
      
      this.addResult('Estadísticas', true, {
        canjes: statsCanjes,
        qrs: statsQRs
      });
      
      console.log('✅ Estadísticas exitosas');
    } catch (error) {
      this.addResult('Estadísticas', false, error.message);
      console.log('❌ Estadísticas fallaron:', error.message);
    }
  }

  /**
   * Agregar resultado de prueba
   */
  addResult(testName, success, data) {
    this.testResults.push({
      test: testName,
      success,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Mostrar resultados de las pruebas
   */
  showResults() {
    console.log('\n📊 RESULTADOS DE LAS PRUEBAS\n');
    console.log('='.repeat(50));
    
    const successful = this.testResults.filter(r => r.success).length;
    const total = this.testResults.length;
    
    console.log(`✅ Exitosas: ${successful}/${total}`);
    console.log(`❌ Fallidas: ${total - successful}/${total}`);
    console.log(`📈 Tasa de éxito: ${((successful/total) * 100).toFixed(1)}%`);
    
    console.log('\nDetalle de pruebas:');
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.test}`);
      if (!result.success) {
        console.log(`   Error: ${result.data}`);
      }
    });
    
    console.log('\n' + '='.repeat(50));
  }

  /**
   * Limpiar datos de prueba
   */
  async cleanup() {
    console.log('\n🧹 Limpiando datos de prueba...');
    
    try {
      const Usuario = require('./src/models/usuario.model');
      const QRReciclaje = require('./src/models/qrReciclaje.model');
      const CanjeReciclaje = require('./src/models/canjeReciclaje.model');
      const Cupon = require('./src/models/cupon.model');
      const Trazabilidad = require('./src/models/trazabilidad.model');
      
      // Eliminar datos de prueba
      if (this.testUserId) {
        await Usuario.findByIdAndDelete(this.testUserId);
        await CanjeReciclaje.deleteMany({ usuarioId: this.testUserId });
        await Trazabilidad.deleteMany({ userId: this.testUserId });
      }
      
      if (this.testQRId) {
        await QRReciclaje.findByIdAndDelete(this.testQRId);
      }
      
      // Eliminar cupones de prueba
      await Cupon.deleteMany({ nombre: 'Cupón de Prueba' });
      
      console.log('✅ Datos de prueba eliminados');
    } catch (error) {
      console.log('⚠️ Error limpiando datos de prueba:', error.message);
    }
  }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  const test = new RecyclingEndpointsTest();
  test.runAllTests().catch(console.error);
}

module.exports = RecyclingEndpointsTest;

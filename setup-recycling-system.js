const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Script de configuración inicial para el sistema de canje de reciclaje
 */
class RecyclingSystemSetup {
  constructor() {
    this.dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/ekokai';
  }

  /**
   * Ejecutar configuración completa
   */
  async setup() {
    console.log('🚀 Configurando sistema de canje de reciclaje...\n');

    try {
      // Conectar a la base de datos
      await this.connectDatabase();

      // Crear índices
      await this.createIndexes();

      // Crear datos iniciales
      await this.createInitialData();

      // Verificar configuración
      await this.verifySetup();

      console.log('\n✅ Sistema de canje de reciclaje configurado exitosamente!');

    } catch (error) {
      console.error('❌ Error configurando sistema:', error.message);
      throw error;
    } finally {
      await mongoose.disconnect();
    }
  }

  /**
   * Conectar a la base de datos
   */
  async connectDatabase() {
    try {
      await mongoose.connect(this.dbUrl);
      console.log('✅ Conectado a la base de datos');
    } catch (error) {
      console.error('❌ Error conectando a la base de datos:', error.message);
      throw error;
    }
  }

  /**
   * Crear índices para optimizar consultas
   */
  async createIndexes() {
    console.log('📊 Creando índices...');

    try {
      const QRReciclaje = require('./src/models/qrReciclaje.model');
      const CanjeReciclaje = require('./src/models/canjeReciclaje.model');
      const Trazabilidad = require('./src/models/trazabilidad.model');

      // Crear índices para QRReciclaje
      await QRReciclaje.createIndexes();
      console.log('  ✅ Índices de QRReciclaje creados');

      // Crear índices para CanjeReciclaje
      await CanjeReciclaje.createIndexes();
      console.log('  ✅ Índices de CanjeReciclaje creados');

      // Crear índices para Trazabilidad
      await Trazabilidad.createIndexes();
      console.log('  ✅ Índices de Trazabilidad creados');

    } catch (error) {
      console.error('❌ Error creando índices:', error.message);
      throw error;
    }
  }

  /**
   * Crear datos iniciales del sistema
   */
  async createInitialData() {
    console.log('📝 Creando datos iniciales...');

    try {
      // Crear usuario administrador para generar QRs si no existe
      await this.createAdminUser();

      // Crear algunos códigos QR iniciales
      await this.createInitialQRs();

      // Crear cupones de ejemplo
      await this.createInitialCoupons();

    } catch (error) {
      console.error('❌ Error creando datos iniciales:', error.message);
      throw error;
    }
  }

  /**
   * Crear usuario administrador
   */
  async createAdminUser() {
    try {
      const Usuario = require('./src/models/usuario.model');
      
      const adminExists = await Usuario.findOne({ 
        email: 'admin@ekokai.com',
        rol: 'administrador' 
      });

      if (!adminExists) {
        const admin = new Usuario({
          rol: 'administrador',
          nombre: 'Admin',
          apellido: 'Sistema',
          email: 'admin@ekokai.com',
          password: 'admin123', // Se hasheará automáticamente
          telefono: '+1000000000',
          pais: 'Colombia',
          zona: 'Sistema',
          tokensAcumulados: 1000,
          activo: true
        });

        await admin.save();
        console.log('  ✅ Usuario administrador creado');
        return admin;
      } else {
        console.log('  ℹ️ Usuario administrador ya existe');
        return adminExists;
      }
    } catch (error) {
      console.error('❌ Error creando usuario administrador:', error.message);
      throw error;
    }
  }

  /**
   * Crear códigos QR iniciales
   */
  async createInitialQRs() {
    try {
      const QRReciclaje = require('./src/models/qrReciclaje.model');
      const Usuario = require('./src/models/usuario.model');

      const admin = await Usuario.findOne({ rol: 'administrador' });
      const existingQRs = await QRReciclaje.countDocuments();

      if (existingQRs === 0) {
        const qrsToCreate = [
          {
            configuracion: {
              descripcion: 'QR para bolsas de residuos orgánicos',
              valorTokens: 10,
              tamano: '20x20cm'
            }
          },
          {
            configuracion: {
              descripcion: 'QR para bolsas de residuos reciclables',
              valorTokens: 15,
              tamano: '20x20cm'
            }
          },
          {
            configuracion: {
              descripcion: 'QR para bolsas de residuos mixtos',
              valorTokens: 8,
              tamano: '20x20cm'
            }
          }
        ];

        for (const qrData of qrsToCreate) {
          const qr = new QRReciclaje({
            codigo: QRReciclaje.generarCodigo(),
            tipo: 'reciclaje',
            usuarioCreador: admin._id,
            configuracion: qrData.configuracion,
            metadatos: {
              ubicacionCreacion: 'Sistema',
              dispositivoCreacion: 'Setup Script',
              lote: 'INICIAL'
            }
          });

          await qr.save();
        }

        console.log(`  ✅ ${qrsToCreate.length} códigos QR iniciales creados`);
      } else {
        console.log(`  ℹ️ Ya existen ${existingQRs} códigos QR`);
      }
    } catch (error) {
      console.error('❌ Error creando códigos QR iniciales:', error.message);
      throw error;
    }
  }

  /**
   * Crear cupones iniciales
   */
  async createInitialCoupons() {
    try {
      const Cupon = require('./src/models/cupon.model');
      const existingCoupons = await Cupon.countDocuments({ tipo: 'reciclaje' });

      if (existingCoupons === 0) {
        const couponsToCreate = [
          {
            nombre: 'Descuento 10% Supermercado',
            descripcion: 'Descuento del 10% en compras mayores a $50.000',
            tokensRequeridos: 100,
            valor: 10,
            tipo: 'descuento',
            fechaExpiracion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 días
          },
          {
            nombre: 'Cupón $5.000 Farmacia',
            descripcion: 'Cupón de $5.000 para productos de farmacia',
            tokensRequeridos: 150,
            valor: 5000,
            tipo: 'efectivo',
            fechaExpiracion: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 días
          },
          {
            nombre: 'Entrada Cine Gratis',
            descripcion: 'Entrada gratuita para función de cine',
            tokensRequeridos: 200,
            valor: 15000,
            tipo: 'servicio',
            fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
          }
        ];

        for (const cuponData of couponsToCreate) {
          const cupon = new Cupon({
            ...cuponData,
            activo: true,
            fechaCreacion: new Date()
          });

          await cupon.save();
        }

        console.log(`  ✅ ${couponsToCreate.length} cupones iniciales creados`);
      } else {
        console.log(`  ℹ️ Ya existen ${existingCoupons} cupones de reciclaje`);
      }
    } catch (error) {
      console.error('❌ Error creando cupones iniciales:', error.message);
      throw error;
    }
  }

  /**
   * Verificar que la configuración es correcta
   */
  async verifySetup() {
    console.log('🔍 Verificando configuración...');

    try {
      const QRReciclaje = require('./src/models/qrReciclaje.model');
      const CanjeReciclaje = require('./src/models/canjeReciclaje.model');
      const Trazabilidad = require('./src/models/trazabilidad.model');
      const Usuario = require('./src/models/usuario.model');
      const Cupon = require('./src/models/cupon.model');

      // Verificar colecciones
      const counts = {
        usuarios: await Usuario.countDocuments(),
        qrs: await QRReciclaje.countDocuments(),
        canjes: await CanjeReciclaje.countDocuments(),
        trazabilidad: await Trazabilidad.countDocuments(),
        cupones: await Cupon.countDocuments()
      };

      console.log('  📊 Conteo de documentos:');
      Object.entries(counts).forEach(([collection, count]) => {
        console.log(`    ${collection}: ${count}`);
      });

      // Verificar que al menos hay un admin
      const adminCount = await Usuario.countDocuments({ rol: 'administrador' });
      if (adminCount === 0) {
        throw new Error('No hay usuarios administradores en el sistema');
      }

      // Verificar índices
      const collections = [
        { model: QRReciclaje, name: 'QRReciclaje' },
        { model: CanjeReciclaje, name: 'CanjeReciclaje' },
        { model: Trazabilidad, name: 'Trazabilidad' }
      ];

      for (const { model, name } of collections) {
        const indexes = await model.collection.getIndexes();
        console.log(`  📋 ${name}: ${Object.keys(indexes).length} índices`);
      }

      console.log('  ✅ Configuración verificada exitosamente');

    } catch (error) {
      console.error('❌ Error verificando configuración:', error.message);
      throw error;
    }
  }

  /**
   * Mostrar información de configuración
   */
  async showSetupInfo() {
    console.log('\n📋 INFORMACIÓN DEL SISTEMA DE RECICLAJE');
    console.log('='.repeat(50));
    console.log(`Base de datos: ${this.dbUrl}`);
    console.log(`Fecha de configuración: ${new Date().toLocaleString()}`);
    
    const QRReciclaje = require('./src/models/qrReciclaje.model');
    const qrs = await QRReciclaje.find().limit(3);
    
    if (qrs.length > 0) {
      console.log('\nCódigos QR de ejemplo:');
      qrs.forEach((qr, index) => {
        console.log(`${index + 1}. ${qr.codigo} - ${qr.configuracion.descripcion}`);
      });
    }
    
    console.log('\nEndpoints disponibles:');
    console.log('- POST /api/qr/generar-reciclaje');
    console.log('- POST /api/qr/validar-reciclaje');
    console.log('- POST /api/canjes/reciclaje');
    console.log('- POST /api/trazabilidad/registro');
    console.log('- GET  /api/usuarios/buscar-telefono');
    console.log('- GET  /api/usuarios/:id/estadisticas-reciclaje');
    
    console.log('\n🚀 ¡Sistema listo para usar!');
    console.log('='.repeat(50));
  }
}

// Ejecutar configuración si se llama directamente
if (require.main === module) {
  const setup = new RecyclingSystemSetup();
  setup.setup()
    .then(() => setup.showSetupInfo())
    .catch(console.error);
}

module.exports = RecyclingSystemSetup;

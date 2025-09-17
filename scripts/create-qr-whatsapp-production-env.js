#!/usr/bin/env node

/**
 * Script para crear la tabla QR WhatsApp en producción
 * Este script debe ejecutarse con las variables de entorno de producción configuradas
 * 
 * Uso:
 * NODE_ENV=production DB_HOST=tu_host DB_NAME=tu_db DB_USER=tu_user DB_PASSWORD=tu_password DB_SSL=true node scripts/create-qr-whatsapp-production-env.js
 */

require('dotenv').config();
const { sequelize, QRWhatsapp } = require('../src/models');

async function createQRWhatsappTableProduction() {
  try {
    console.log('🚀 Iniciando creación de tabla QR WhatsApp en PRODUCCIÓN...');
    
    // Verificar que estamos en modo producción
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  ADVERTENCIA: NODE_ENV no está configurado como "production"');
      console.log('   Para producción, ejecuta: NODE_ENV=production node scripts/create-qr-whatsapp-production-env.js');
    }
    
    // Mostrar información de conexión (sin credenciales sensibles)
    console.log('📡 Configuración de conexión:');
    console.log(`   - Entorno: ${process.env.NODE_ENV || 'no definido'}`);
    console.log(`   - Host: ${process.env.DB_HOST || 'no definido'}`);
    console.log(`   - Puerto: ${process.env.DB_PORT || '5432'}`);
    console.log(`   - Base de datos: ${process.env.DB_NAME || 'no definido'}`);
    console.log(`   - Usuario: ${process.env.DB_USERNAME || process.env.DB_USER || 'no definido'}`);
    console.log(`   - SSL: ${process.env.DB_SSL || 'false'}`);
    
    // Verificar que las variables críticas estén configuradas
    const requiredVars = ['DB_HOST', 'DB_NAME', 'DB_USERNAME', 'DB_PASSWORD'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Variables de entorno requeridas faltantes:', missingVars.join(', '));
      console.log('\n📋 Variables requeridas:');
      console.log('   - DB_HOST: Host de la base de datos');
      console.log('   - DB_NAME: Nombre de la base de datos');
      console.log('   - DB_USERNAME: Usuario de la base de datos');
      console.log('   - DB_PASSWORD: Contraseña de la base de datos');
      console.log('   - DB_SSL: true/false (opcional, para conexiones SSL)');
      process.exit(1);
    }
    
    // Conectar a la base de datos
    console.log('\n🔄 Conectando a la base de datos de producción...');
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL de producción establecida correctamente');
    
    // Crear la tabla
    console.log('🔄 Creando tabla qr_whatsapp...');
    await QRWhatsapp.sync({ force: false });
    console.log('✅ Tabla qr_whatsapp creada/verificada exitosamente en producción');
    
    // Verificar estructura de la tabla
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'qr_whatsapp' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Estructura de la tabla qr_whatsapp:');
    results.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });
    
    // Verificar índices
    const [indexResults] = await sequelize.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'qr_whatsapp';
    `);
    
    console.log('\n🔍 Índices creados:');
    indexResults.forEach(idx => {
      console.log(`   - ${idx.indexname}`);
    });
    
    // Contar registros existentes
    const count = await QRWhatsapp.count();
    console.log(`\n📊 Registros existentes en la tabla: ${count}`);
    
    console.log('\n🎉 ¡Proceso completado exitosamente en producción!');
    console.log('✅ Tabla qr_whatsapp lista para usar en producción');
    console.log('✅ La funcionalidad de códigos QR WhatsApp está disponible');
    
  } catch (error) {
    console.error('\n❌ Error creando tabla QR WhatsApp en producción:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔍 Posibles causas:');
      console.log('   - El host de la base de datos no es accesible');
      console.log('   - El puerto está bloqueado por firewall');
      console.log('   - Las credenciales son incorrectas');
    } else if (error.message.includes('authentication failed')) {
      console.log('\n🔍 Posibles causas:');
      console.log('   - Usuario o contraseña incorrectos');
      console.log('   - El usuario no tiene permisos para crear tablas');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('\n🔍 Posibles causas:');
      console.log('   - La base de datos especificada no existe');
      console.log('   - El nombre de la base de datos es incorrecto');
    }
    
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  createQRWhatsappTableProduction();
}

module.exports = createQRWhatsappTableProduction;

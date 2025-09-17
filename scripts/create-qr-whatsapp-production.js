#!/usr/bin/env node

/**
 * Script para crear la tabla QR WhatsApp en producción (Digital Ocean)
 * Este script se ejecuta para crear la tabla qr_whatsapp en la base de datos de producción
 */

require('dotenv').config();
const { sequelize, QRWhatsapp } = require('../src/models');

async function createQRWhatsappTableProduction() {
  try {
    console.log('🚀 Iniciando creación de tabla QR WhatsApp en PRODUCCIÓN...');
    console.log('📡 Conectando a la base de datos de producción...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL de producción establecida correctamente');
    
    // Mostrar información de conexión (sin credenciales sensibles)
    console.log(`📊 Base de datos: ${process.env.DB_NAME || 'ekokai_db'}`);
    console.log(`🌐 Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`🔌 Puerto: ${process.env.DB_PORT || 5432}`);
    
    // Sincronizar el modelo con la base de datos
    console.log('🔄 Creando tabla qr_whatsapp...');
    await QRWhatsapp.sync({ force: false });
    console.log('✅ Tabla qr_whatsapp creada/verificada exitosamente en producción');
    
    // Verificar que la tabla existe
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'qr_whatsapp' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Estructura de la tabla qr_whatsapp en producción:');
    results.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });
    
    // Verificar índices
    const [indexResults] = await sequelize.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'qr_whatsapp';
    `);
    
    console.log('🔍 Índices creados:');
    indexResults.forEach(idx => {
      console.log(`  - ${idx.indexname}`);
    });
    
    // Contar registros existentes
    const count = await QRWhatsapp.count();
    console.log(`📊 Registros existentes en la tabla: ${count}`);
    
    console.log('🎉 ¡Proceso completado exitosamente en producción!');
    console.log('✅ Tabla qr_whatsapp lista para usar en producción');
    
  } catch (error) {
    console.error('❌ Error creando tabla QR WhatsApp en producción:', error);
    
    // Mostrar información de debug si hay error
    console.log('\n🔍 Información de debug:');
    console.log(`- DB_HOST: ${process.env.DB_HOST || 'no definido'}`);
    console.log(`- DB_NAME: ${process.env.DB_NAME || 'no definido'}`);
    console.log(`- DB_PORT: ${process.env.DB_PORT || 'no definido'}`);
    console.log(`- DB_SSL: ${process.env.DB_SSL || 'no definido'}`);
    console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'no definido'}`);
    
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  createQRWhatsappTableProduction();
}

module.exports = createQRWhatsappTableProduction;

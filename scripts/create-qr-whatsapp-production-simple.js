#!/usr/bin/env node

/**
 * Script SIMPLE para crear la tabla QR WhatsApp en producción
 * 
 * INSTRUCCIONES DE USO:
 * 
 * 1. Configura las variables de entorno de producción:
 *    export NODE_ENV=production
 *    export DB_HOST=tu-host-de-produccion
 *    export DB_NAME=tu-base-de-datos
 *    export DB_USERNAME=tu-usuario
 *    export DB_PASSWORD=tu-password
 *    export DB_SSL=true
 * 
 * 2. Ejecuta el script:
 *    node scripts/create-qr-whatsapp-production-simple.js
 * 
 * O ejecuta directamente con las variables:
 *    NODE_ENV=production DB_HOST=host DB_NAME=db DB_USERNAME=user DB_PASSWORD=pass DB_SSL=true node scripts/create-qr-whatsapp-production-simple.js
 */

require('dotenv').config();

// Configurar Sequelize directamente para producción
const { Sequelize } = require('sequelize');

// Crear conexión directa a PostgreSQL
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME || process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: false,
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

async function createQRWhatsappTable() {
  try {
    console.log('🚀 Creando tabla QR WhatsApp en PRODUCCIÓN...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL de producción');
    
    // Crear la tabla directamente con SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS "qr_whatsapp" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "mensaje" TEXT NOT NULL CHECK (length(mensaje) > 0 AND length(mensaje) <= 1000),
        "fechaCreacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "fechaExpiracion" TIMESTAMP WITH TIME ZONE NOT NULL,
        "activo" BOOLEAN DEFAULT true,
        "numeroWhatsapp" VARCHAR(20),
        "qrDataUrl" TEXT,
        "nombre" VARCHAR(100) NOT NULL CHECK (length(nombre) > 0 AND length(nombre) <= 100),
        "descripcion" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;
    
    await sequelize.query(createTableSQL);
    console.log('✅ Tabla qr_whatsapp creada exitosamente');
    
    // Crear índices
    const createIndexesSQL = [
      'CREATE INDEX IF NOT EXISTS "qr_whatsapp_activo" ON "qr_whatsapp" ("activo");',
      'CREATE INDEX IF NOT EXISTS "qr_whatsapp_fecha_expiracion" ON "qr_whatsapp" ("fechaExpiracion");',
      'CREATE INDEX IF NOT EXISTS "qr_whatsapp_fecha_creacion" ON "qr_whatsapp" ("fechaCreacion");'
    ];
    
    for (const sql of createIndexesSQL) {
      await sequelize.query(sql);
    }
    console.log('✅ Índices creados exitosamente');
    
    // Agregar comentarios a las columnas
    const addCommentsSQL = [
      'COMMENT ON COLUMN "qr_whatsapp"."numeroWhatsapp" IS \'Número de WhatsApp al que redirige el QR (opcional)\';',
      'COMMENT ON COLUMN "qr_whatsapp"."qrDataUrl" IS \'Data URL del código QR generado\';',
      'COMMENT ON COLUMN "qr_whatsapp"."nombre" IS \'Nombre descriptivo del código QR\';',
      'COMMENT ON COLUMN "qr_whatsapp"."descripcion" IS \'Descripción opcional del código QR\';'
    ];
    
    for (const sql of addCommentsSQL) {
      try {
        await sequelize.query(sql);
      } catch (error) {
        // Los comentarios pueden fallar si ya existen, no es crítico
        console.log('⚠️  Comentario ya existe o no se pudo agregar');
      }
    }
    
    // Verificar que la tabla existe
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
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'qr_whatsapp';
    `);
    
    console.log('\n🔍 Índices creados:');
    indexResults.forEach(idx => {
      console.log(`   - ${idx.indexname}`);
    });
    
    console.log('\n🎉 ¡TABLA QR WHATSAPP CREADA EXITOSAMENTE EN PRODUCCIÓN!');
    console.log('✅ La funcionalidad de códigos QR WhatsApp está lista para usar');
    
  } catch (error) {
    console.error('\n❌ Error creando tabla QR WhatsApp:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔍 Error de conexión. Verifica:');
      console.log('   - DB_HOST: ¿Es correcto el host?');
      console.log('   - DB_PORT: ¿Está abierto el puerto 5432?');
      console.log('   - Firewall: ¿Permite conexiones desde tu IP?');
    } else if (error.message.includes('authentication failed')) {
      console.log('\n🔍 Error de autenticación. Verifica:');
      console.log('   - DB_USERNAME: ¿Es correcto el usuario?');
      console.log('   - DB_PASSWORD: ¿Es correcta la contraseña?');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('\n🔍 Error de base de datos. Verifica:');
      console.log('   - DB_NAME: ¿Existe la base de datos?');
    }
    
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  createQRWhatsappTable();
}

module.exports = createQRWhatsappTable;

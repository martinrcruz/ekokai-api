#!/usr/bin/env node

/**
 * Script simple para ejecutar migraciones básicas en producción
 */

const { sequelize } = require('../src/config/sequelize');
require('dotenv').config();

console.log('🚀 Ejecutando migraciones básicas...\n');

async function createEntregasTable() {
  try {
    console.log('🔄 Creando tabla entregas...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS entregas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "usuarioId" UUID NOT NULL,
        "ecopuntoId" UUID NOT NULL,
        "tipoResiduoId" UUID NOT NULL,
        "pesoKg" DECIMAL(10,2) NOT NULL,
        "cuponesGenerados" INTEGER NOT NULL,
        "cuponGeneradoId" UUID,
        descripcion TEXT DEFAULT '',
        fecha TIMESTAMP DEFAULT NOW(),
        "encargadoId" UUID,
        estado VARCHAR(20) DEFAULT 'completado' CHECK (estado IN ('completado', 'pendiente', 'rechazado')),
        observaciones TEXT DEFAULT '',
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('✅ Tabla entregas creada');
    
    // Crear índices
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_entregas_usuarioId ON entregas("usuarioId");');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_entregas_ecopuntoId ON entregas("ecopuntoId");');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_entregas_fecha ON entregas(fecha);');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_entregas_tipoResiduoId ON entregas("tipoResiduoId");');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_entregas_estado ON entregas(estado);');
    
    console.log('✅ Índices creados');
    
    return true;
  } catch (error) {
    console.log('❌ Error creando tabla entregas:', error.message);
    return false;
  }
}

async function verifyTables() {
  try {
    console.log('🔍 Verificando tablas...');
    
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    const tables = results.map(row => row.table_name);
    console.log('📋 Tablas encontradas:', tables.join(', '));
    
    if (tables.includes('entregas')) {
      console.log('✅ Tabla entregas existe');
      return true;
    } else {
      console.log('❌ Tabla entregas no encontrada');
      return false;
    }
  } catch (error) {
    console.log('❌ Error verificando tablas:', error.message);
    return false;
  }
}

async function main() {
  try {
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    // Crear tabla entregas
    if (!(await createEntregasTable())) {
      process.exit(1);
    }
    
    // Verificar
    if (!(await verifyTables())) {
      process.exit(1);
    }
    
    console.log('\n🎉 ¡Tabla entregas creada exitosamente!');
    console.log('✅ El error de "relation entregas does not exist" debería estar resuelto');
    
    await sequelize.close();
    
  } catch (error) {
    console.log('\n❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };

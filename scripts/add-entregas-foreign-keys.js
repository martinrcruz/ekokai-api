#!/usr/bin/env node

/**
 * Script para agregar foreign keys a la tabla entregas
 */

const { sequelize } = require('../src/config/sequelize');
require('dotenv').config();

console.log('🚀 Agregando foreign keys a la tabla entregas...\n');

async function addForeignKeys() {
  try {
    console.log('🔄 Agregando foreign keys...');
    
    // Foreign key para usuarioId
    try {
      await sequelize.query(`
        ALTER TABLE entregas 
        ADD CONSTRAINT entregas_usuarioId_fkey 
        FOREIGN KEY ("usuarioId") REFERENCES usuarios(id) 
        ON UPDATE CASCADE ON DELETE RESTRICT;
      `);
      console.log('✅ Foreign key usuarioId agregada');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Foreign key usuarioId ya existe');
      } else {
        throw error;
      }
    }
    
    // Foreign key para ecopuntoId
    try {
      await sequelize.query(`
        ALTER TABLE entregas 
        ADD CONSTRAINT entregas_ecopuntoId_fkey 
        FOREIGN KEY ("ecopuntoId") REFERENCES ecopuntos(id) 
        ON UPDATE CASCADE ON DELETE RESTRICT;
      `);
      console.log('✅ Foreign key ecopuntoId agregada');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Foreign key ecopuntoId ya existe');
      } else {
        throw error;
      }
    }
    
    // Foreign key para encargadoId
    try {
      await sequelize.query(`
        ALTER TABLE entregas 
        ADD CONSTRAINT entregas_encargadoId_fkey 
        FOREIGN KEY ("encargadoId") REFERENCES usuarios(id) 
        ON UPDATE CASCADE ON DELETE SET NULL;
      `);
      console.log('✅ Foreign key encargadoId agregada');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Foreign key encargadoId ya existe');
      } else {
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error agregando foreign keys:', error.message);
    return false;
  }
}

async function verifyConstraints() {
  try {
    console.log('🔍 Verificando constraints...');
    
    const [results] = await sequelize.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'entregas' 
      AND constraint_type = 'FOREIGN KEY'
      ORDER BY constraint_name;
    `);
    
    console.log('📋 Foreign keys encontradas:');
    results.forEach(row => {
      console.log(`  - ${row.constraint_name}`);
    });
    
    return true;
  } catch (error) {
    console.log('❌ Error verificando constraints:', error.message);
    return false;
  }
}

async function main() {
  try {
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    // Agregar foreign keys
    if (!(await addForeignKeys())) {
      process.exit(1);
    }
    
    // Verificar constraints
    await verifyConstraints();
    
    console.log('\n🎉 ¡Foreign keys agregadas exitosamente!');
    console.log('✅ La tabla entregas está completamente configurada');
    
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

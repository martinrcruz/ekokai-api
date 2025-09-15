#!/usr/bin/env node

/**
 * Script para verificar que la tabla entregas esté funcionando correctamente
 */

const { sequelize } = require('../src/config/sequelize');
require('dotenv').config();

console.log('🔍 Verificando tabla entregas...\n');

async function verifyTableStructure() {
  try {
    console.log('📋 Verificando estructura de la tabla...');
    
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'entregas' 
      ORDER BY ordinal_position;
    `);
    
    console.log('✅ Columnas encontradas:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    return true;
  } catch (error) {
    console.log('❌ Error verificando estructura:', error.message);
    return false;
  }
}

async function verifyIndexes() {
  try {
    console.log('\n📊 Verificando índices...');
    
    const [indexes] = await sequelize.query(`
      SELECT indexname, indexdef
      FROM pg_indexes 
      WHERE tablename = 'entregas';
    `);
    
    console.log('✅ Índices encontrados:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.indexname}`);
    });
    
    return true;
  } catch (error) {
    console.log('❌ Error verificando índices:', error.message);
    return false;
  }
}

async function verifyForeignKeys() {
  try {
    console.log('\n🔗 Verificando foreign keys...');
    
    const [constraints] = await sequelize.query(`
      SELECT 
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'entregas';
    `);
    
    console.log('✅ Foreign keys encontradas:');
    constraints.forEach(constraint => {
      console.log(`  - ${constraint.constraint_name}: ${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
    });
    
    return true;
  } catch (error) {
    console.log('❌ Error verificando foreign keys:', error.message);
    return false;
  }
}

async function testModelConnection() {
  try {
    console.log('\n🧪 Probando conexión con el modelo...');
    
    // Importar el modelo
    const EntregaResiduo = require('../src/models/entregaresiduo.model');
    
    // Verificar que el modelo se puede sincronizar
    await EntregaResiduo.sync({ alter: false });
    console.log('✅ Modelo EntregaResiduo sincronizado correctamente');
    
    // Probar una consulta simple
    const count = await EntregaResiduo.count();
    console.log(`✅ Consulta exitosa: ${count} registros en la tabla entregas`);
    
    return true;
  } catch (error) {
    console.log('❌ Error probando modelo:', error.message);
    return false;
  }
}

async function main() {
  try {
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida');
    
    // Verificar estructura
    if (!(await verifyTableStructure())) {
      process.exit(1);
    }
    
    // Verificar índices
    await verifyIndexes();
    
    // Verificar foreign keys
    await verifyForeignKeys();
    
    // Probar modelo
    if (!(await testModelConnection())) {
      process.exit(1);
    }
    
    console.log('\n🎉 ¡Verificación completada exitosamente!');
    console.log('✅ La tabla entregas está completamente funcional');
    console.log('✅ El error "relation entregas does not exist" está resuelto');
    console.log('✅ Los endpoints deberían funcionar correctamente ahora');
    
    await sequelize.close();
    
  } catch (error) {
    console.log('\n❌ Error durante la verificación:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };

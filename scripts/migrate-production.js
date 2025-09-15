#!/usr/bin/env node

/**
 * Script para ejecutar migraciones en producción (Digital Ocean)
 * Este script se ejecuta durante el despliegue para crear las tablas necesarias
 */

const { execSync } = require('child_process');
const { sequelize } = require('../src/config/sequelize');
require('dotenv').config();

console.log('🚀 Ejecutando migraciones en producción...\n');

// Verificar conexión a la base de datos
async function checkDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    return true;
  } catch (error) {
    console.log('❌ Error al conectar con PostgreSQL:', error.message);
    return false;
  }
}

// Ejecutar migraciones
async function runMigrations() {
  try {
    console.log('🔄 Ejecutando migraciones...');
    
    // Ejecutar migraciones usando Sequelize CLI
    execSync('npx sequelize-cli db:migrate', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'production'
      }
    });
    
    console.log('✅ Migraciones ejecutadas correctamente');
    return true;
  } catch (error) {
    console.log('❌ Error ejecutando migraciones:', error.message);
    return false;
  }
}

// Verificar que las tablas se crearon correctamente
async function verifyTables() {
  try {
    console.log('🔍 Verificando tablas creadas...');
    
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    const tables = results.map(row => row.table_name);
    console.log('📋 Tablas encontradas:', tables.join(', '));
    
    // Verificar que la tabla usuarios existe
    if (tables.includes('usuarios')) {
      console.log('✅ Tabla usuarios creada correctamente');
      return true;
    } else {
      console.log('❌ Tabla usuarios no encontrada');
      return false;
    }
  } catch (error) {
    console.log('❌ Error verificando tablas:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  try {
    // Verificar conexión
    if (!(await checkDatabaseConnection())) {
      console.log('\n❌ No se pudo establecer conexión con la base de datos');
      process.exit(1);
    }

    // Ejecutar migraciones
    if (!(await runMigrations())) {
      console.log('\n❌ Error en las migraciones');
      process.exit(1);
    }

    // Verificar tablas
    if (!(await verifyTables())) {
      console.log('\n❌ Error verificando tablas');
      process.exit(1);
    }

    console.log('\n🎉 ¡Migraciones completadas exitosamente!');
    console.log('✅ Base de datos configurada correctamente');
    console.log('✅ Todas las tablas creadas');
    
    // Cerrar conexión
    await sequelize.close();
    
  } catch (error) {
    console.log('\n❌ Error durante las migraciones:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main };

#!/usr/bin/env node

/**
 * Script para crear la base de datos en Digital Ocean
 * Este script se ejecuta antes de las migraciones
 */

const { Client } = require('pg');
require('dotenv').config();

console.log('🚀 Creando base de datos en Digital Ocean...\n');

// Configuración de conexión para crear la base de datos
const dbConfig = {
  user: process.env.DB_USERNAME || process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? {
    require: true,
    rejectUnauthorized: false
  } : false
};

// Nombre de la base de datos a crear
const databaseName = process.env.DB_NAME || 'ekokai_db';

async function createDatabase() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔌 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conexión establecida');
    
    // Verificar si la base de datos ya existe
    console.log(`🔍 Verificando si la base de datos '${databaseName}' existe...`);
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName]
    );
    
    if (result.rows.length > 0) {
      console.log(`✅ La base de datos '${databaseName}' ya existe`);
      return true;
    }
    
    // Crear la base de datos
    console.log(`🔄 Creando base de datos '${databaseName}'...`);
    await client.query(`CREATE DATABASE "${databaseName}"`);
    console.log(`✅ Base de datos '${databaseName}' creada exitosamente`);
    
    return true;
    
  } catch (error) {
    console.log('❌ Error creando base de datos:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

// Función principal
async function main() {
  try {
    if (!(await createDatabase())) {
      console.log('\n❌ Error creando la base de datos');
      process.exit(1);
    }
    
    console.log('\n🎉 ¡Base de datos creada exitosamente!');
    console.log('✅ Ahora puedes ejecutar las migraciones');
    
  } catch (error) {
    console.log('\n❌ Error durante la creación de la base de datos:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main };

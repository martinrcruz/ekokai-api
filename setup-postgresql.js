#!/usr/bin/env node

/**
 * Script de configuración inicial para PostgreSQL
 * Este script ayuda a configurar la base de datos PostgreSQL para Ekokai API
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Configurando Ekokai API con PostgreSQL 15...\n');

// Verificar que PostgreSQL esté instalado
function checkPostgreSQL() {
  try {
    execSync('psql --version', { stdio: 'pipe' });
    console.log('✅ PostgreSQL está instalado');
    return true;
  } catch (error) {
    console.log('❌ PostgreSQL no está instalado o no está en el PATH');
    console.log('Por favor instala PostgreSQL 15 desde: https://www.postgresql.org/download/');
    return false;
  }
}

// Verificar conexión a la base de datos
async function checkDatabaseConnection() {
  try {
    const { sequelize } = require('./src/config/sequelize');
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    return true;
  } catch (error) {
    console.log('❌ Error al conectar con PostgreSQL:', error.message);
    console.log('Verifica que:');
    console.log('1. PostgreSQL esté ejecutándose');
    console.log('2. Las credenciales en .env sean correctas');
    console.log('3. La base de datos exista');
    return false;
  }
}

// Crear base de datos si no existe
async function createDatabase() {
  try {
    console.log('📦 Creando base de datos...');
    execSync('npm run db:create', { stdio: 'inherit' });
    console.log('✅ Base de datos creada correctamente');
    return true;
  } catch (error) {
    console.log('⚠️  La base de datos ya existe o hubo un error:', error.message);
    return false;
  }
}

// Ejecutar migraciones
async function runMigrations() {
  try {
    console.log('🔄 Ejecutando migraciones...');
    execSync('npm run db:migrate', { stdio: 'inherit' });
    console.log('✅ Migraciones ejecutadas correctamente');
    return true;
  } catch (error) {
    console.log('❌ Error ejecutando migraciones:', error.message);
    return false;
  }
}

// Ejecutar seeders
async function runSeeders() {
  try {
    console.log('🌱 Cargando datos iniciales...');
    execSync('npm run db:seed', { stdio: 'inherit' });
    console.log('✅ Datos iniciales cargados correctamente');
    return true;
  } catch (error) {
    console.log('❌ Error cargando datos iniciales:', error.message);
    return false;
  }
}

// Verificar archivo .env
function checkEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('📝 Creando archivo .env...');
    const envContent = `# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ekokai_db
DB_USER=postgres
DB_PASSWORD=postgres

# Entorno
NODE_ENV=development

# JWT Secret (cambiar en producción)
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# Puerto del servidor
PORT=3000
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env creado');
    console.log('⚠️  Recuerda cambiar las credenciales de base de datos si es necesario');
  } else {
    console.log('✅ Archivo .env existe');
  }
}

// Función principal
async function main() {
  try {
    // Verificar PostgreSQL
    if (!checkPostgreSQL()) {
      process.exit(1);
    }

    // Verificar archivo .env
    checkEnvFile();

    // Crear base de datos
    await createDatabase();

    // Verificar conexión
    if (!(await checkDatabaseConnection())) {
      console.log('\n❌ No se pudo establecer conexión con la base de datos');
      console.log('Verifica tu configuración y vuelve a intentar');
      process.exit(1);
    }

    // Ejecutar migraciones
    if (!(await runMigrations())) {
      console.log('\n❌ Error en las migraciones');
      process.exit(1);
    }

    // Ejecutar seeders
    if (!(await runSeeders())) {
      console.log('\n❌ Error cargando datos iniciales');
      process.exit(1);
    }

    console.log('\n🎉 ¡Configuración completada exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('✅ PostgreSQL configurado');
    console.log('✅ Base de datos creada');
    console.log('✅ Tablas creadas');
    console.log('✅ Datos iniciales cargados');
    
    console.log('\n👤 Usuarios administradores creados:');
    console.log('📧 admin@ekokai.com (password: admin123)');
    console.log('📧 superadmin@ekokai.com (password: admin123)');
    
    console.log('\n🚀 Para iniciar el servidor:');
    console.log('npm run dev');
    
    console.log('\n📚 Para más información, consulta MIGRATION-TO-POSTGRESQL.md');

  } catch (error) {
    console.log('\n❌ Error durante la configuración:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main };

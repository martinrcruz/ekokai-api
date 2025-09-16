// config/sequelize.js
const { Sequelize } = require('sequelize');

// Configuración de Sequelize para PostgreSQL
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ekokai_db',
  username: process.env.DB_USERNAME || process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
  },
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

// Función para probar la conexión
async function testSequelizeConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a Sequelize establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con Sequelize:', error.message);
    return false;
  }
}

// Función para ejecutar migraciones usando Sequelize directamente
async function runMigrations() {
  try {
    console.log('🔄 Ejecutando migraciones de base de datos...');
    
    // Verificar si la tabla SequelizeMeta existe
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'SequelizeMeta'
      );
    `);
    
    const metaTableExists = results[0].exists;
    
    if (!metaTableExists) {
      console.log('📋 Creando tabla de metadatos de migraciones...');
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
          name VARCHAR(255) NOT NULL PRIMARY KEY
        );
      `);
    }
    
    // Ejecutar migraciones manualmente
    const migrationFiles = [
      '20250914191308-create-ecopuntos-table.js',
      '20250914191309-create-usuarios-table.js',
      '20250914191940-add-foreign-keys.js',
      '20250914192209-create-tiporesiduos-table.js',
      '20250914192230-create-premios-table.js',
      '20250914192231-create-recompensas-table.js',
      '20250914192232-create-ecopuntos-table.js',
      '20250914192233-create-usuarios-table.js',
      '20250914192247-create-cupones-table.js',
      '20250914192256-add-foreign-keys.js'
    ];
    
    for (const migrationFile of migrationFiles) {
      // Verificar si la migración ya se ejecutó
      const [migrationResults] = await sequelize.query(`
        SELECT name FROM "SequelizeMeta" WHERE name = '${migrationFile}';
      `);
      
      if (migrationResults.length === 0) {
        console.log(`🔄 Ejecutando migración: ${migrationFile}`);
        
        try {
          const migration = require(`../migrations/${migrationFile}`);
          await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
          
          // Registrar la migración como ejecutada
          await sequelize.query(`
            INSERT INTO "SequelizeMeta" (name) VALUES ('${migrationFile}');
          `);
          
          console.log(`✅ Migración ${migrationFile} ejecutada correctamente`);
        } catch (migrationError) {
          console.log(`⚠️ Error en migración ${migrationFile}:`, migrationError.message);
          // Continuar con las siguientes migraciones
        }
      } else {
        console.log(`⏭️ Migración ${migrationFile} ya ejecutada`);
      }
    }
    
    console.log('✅ Migraciones ejecutadas correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al ejecutar migraciones:', error.message);
    return false;
  }
}

// Función para ejecutar seeders
async function runSeeders() {
  try {
    console.log('🌱 Ejecutando seeders...');
    
    // Verificar si ya existen usuarios administradores
    const [existingUsers] = await sequelize.query(`
      SELECT COUNT(*) as count FROM usuarios WHERE email IN ('admin@ekokai.com', 'superadmin@ekokai.com');
    `);
    
    if (existingUsers[0].count > 0) {
      console.log('⏭️ Usuarios administradores ya existen, saltando seeders');
      return true;
    }
    
    // Ejecutar seeder de usuarios administradores
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await sequelize.query(`
      INSERT INTO usuarios (
        id, rol, nombre, apellido, email, password, telefono, pais, zona, 
        direccion, "tokensAcumulados", activo, "requiereCambioPassword", 
        "createdAt", "updatedAt"
      ) VALUES 
      (
        '00000000-0000-0000-0000-000000000001',
        'administrador',
        'Admin',
        'Ekokai',
        'admin@ekokai.com',
        '${hashedPassword}',
        '+5491123456789',
        'Argentina',
        'CABA',
        'Av. Corrientes 1234',
        0,
        true,
        false,
        NOW(),
        NOW(),
        NOW(),
        NOW()
      ),
      (
        '00000000-0000-0000-0000-000000000002',
        'administrador',
        'Super',
        'Admin',
        'superadmin@ekokai.com',
        '${hashedPassword}',
        '+5491123456790',
        'Argentina',
        'CABA',
        'Av. Santa Fe 5678',
        0,
        true,
        false,
        NOW(),
        NOW(),
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO NOTHING;
    `);
    
    console.log('✅ Usuarios administradores creados correctamente');
    console.log('👤 admin@ekokai.com (password: admin123)');
    console.log('👤 superadmin@ekokai.com (password: admin123)');
    
    return true;
  } catch (error) {
    console.error('❌ Error al ejecutar seeders:', error.message);
    return false;
  }
}

// Función para sincronizar modelos (fallback)
async function syncSequelizeModels() {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos de Sequelize sincronizados correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al sincronizar modelos de Sequelize:', error.message);
    return false;
  }
}

module.exports = {
  sequelize,
  testSequelizeConnection,
  runMigrations,
  runSeeders,
  syncSequelizeModels
};

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

// Función para ejecutar migraciones
async function runMigrations() {
  try {
    const { execSync } = require('child_process');
    
    console.log('🔄 Ejecutando migraciones de base de datos...');
    execSync('npx sequelize-cli db:migrate', { 
      stdio: 'inherit',
      env: process.env
    });
    
    console.log('✅ Migraciones ejecutadas correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al ejecutar migraciones:', error.message);
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
  syncSequelizeModels
};

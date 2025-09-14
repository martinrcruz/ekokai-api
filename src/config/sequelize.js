// config/sequelize.js
const { Sequelize } = require('sequelize');

// Configuración de Sequelize para SQLite (puedes cambiar a otro DB si es necesario)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.SQLITE_PATH || './database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
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

// Función para sincronizar modelos
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
  syncSequelizeModels
};

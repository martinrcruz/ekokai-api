// config/database.js
const mongoose = require('mongoose');

async function connectDB1() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI_DB1, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado a DB1 correctamente (conexión global)');
  }
  return mongoose;
}

module.exports = {
  connectDB1,
  getDB1: () => mongoose.connection
};

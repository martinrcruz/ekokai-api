const mongoose = require('mongoose');

let DB1;

async function connectDB1() {
  if (!DB1) {
    DB1 = await mongoose.createConnection(process.env.MONGO_URI_DB1, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`✅ Conectado a DB1 correctamente`);
  }
  return DB1;
}

module.exports = {
  connectDB1,
  getDB1: () => DB1
};

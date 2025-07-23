const { connectDB1 } = require('../config/database');
const mongoose = require('mongoose');

const CuponSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: String,
    tokensRequeridos: { type: Number, required: true },
    fechaExpiracion: Date,
    activo: { type: Boolean, default: true },
    fechaCreacion: { type: Date, default: Date.now }
  });

module.exports = async () => {
  const db = await connectDB1();
  return db.model('Cupon', CuponSchema);
};
  
const mongoose = require('mongoose');

const CuponSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: String,
    tokensRequeridos: { type: Number, required: true },
    fechaExpiracion: Date,
    activo: { type: Boolean, default: true },
    fechaCreacion: { type: Date, default: Date.now }
  });
  module.exports = mongoose.models.Cupon || mongoose.model('Cupon', CuponSchema, 'cupones');
  
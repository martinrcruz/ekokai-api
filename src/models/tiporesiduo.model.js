const mongoose = require('mongoose');

const TipoResiduoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: String,
  categoria: { type: String, default: 'general' },
  unidad: { type: String, enum: ['kilos', 'gramos', 'litros'], default: 'kilos' },
  tokensPorKg: { type: Number, required: true, min: 0 },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = (connection) => {
  return connection.models.TipoResiduo || connection.model('TipoResiduo', TipoResiduoSchema, 'tiporesiduos');
};
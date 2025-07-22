const mongoose = require('mongoose');

const TipoResiduoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: String,
  tokensPorKg: { type: Number, required: true, min: 0 }
}, { timestamps: true });

module.exports = (connection) => {
  return connection.models.TipoResiduo || connection.model('TipoResiduo', TipoResiduoSchema, 'tiporesiduos');
};
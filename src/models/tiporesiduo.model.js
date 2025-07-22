const mongoose = require('mongoose');

const TipoResiduoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: String,
  tokensPorKg: { type: Number, required: true, min: 0 }
}, { timestamps: true });

// ⚠️ IMPORTANTE: usar getDB1().model para evitar usar la conexión global
module.exports = mongoose.models.TipoResiduo || mongoose.model('TipoResiduo', TipoResiduoSchema, 'tiporesiduos');

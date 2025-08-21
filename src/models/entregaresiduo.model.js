const { connectDB1 } = require('../config/database');
const mongoose = require('mongoose');

const EntregaResiduoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  ecopunto: { type: mongoose.Schema.Types.ObjectId, required: true },
  tipoResiduo: { type: mongoose.Schema.Types.ObjectId, ref: 'TipoResiduo', required: true },
  pesoKg: { type: Number, required: true },
  tokensOtorgados: { type: Number, required: true },
  cuponGenerado: { type: mongoose.Schema.Types.ObjectId, ref: 'Cupon' },
  descripcion: { type: String, default: '' },
  fecha: { type: Date, default: Date.now }
});

module.exports = async () => {
  const db = await connectDB1();
  return db.model('EntregaResiduo', EntregaResiduoSchema, 'entregas');
};
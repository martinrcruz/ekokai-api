const mongoose = require('mongoose');
const { getDB1 } = require('../config/database');

const EntregaResiduoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  ecopunto: { type: mongoose.Schema.Types.ObjectId, ref: 'Ecopunto', required: true },
  tipoResiduo: { type: mongoose.Schema.Types.ObjectId, ref: 'TipoResiduo', required: true },
  pesoKg: { type: Number, required: true },
  tokensOtorgados: { type: Number, required: true },
  fecha: { type: Date, default: Date.now }
});

module.exports = getDB1().model('EntregaResiduo', EntregaResiduoSchema, 'entregas');

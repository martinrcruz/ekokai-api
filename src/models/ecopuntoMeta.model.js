const mongoose = require('mongoose');

const EcopuntoMetaSchema = new mongoose.Schema({
  ecopunto: { type: mongoose.Schema.Types.ObjectId, required: true },
  year: { type: Number, required: true },
  month: { type: Number, min: 1, max: 12, required: true },
  objetivoKg: { type: Number, required: true },
  creadoEn: { type: Date, default: Date.now },
  actualizadoEn: { type: Date, default: Date.now }
});

EcopuntoMetaSchema.index({ ecopunto: 1, year: 1, month: 1 }, { unique: true });

EcopuntoMetaSchema.pre('save', function (next) {
  this.actualizadoEn = new Date();
  next();
});

module.exports = mongoose.model('EcopuntoMeta', EcopuntoMetaSchema, 'ecopunto_metas');



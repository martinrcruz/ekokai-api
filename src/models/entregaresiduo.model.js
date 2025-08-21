const mongoose = require('mongoose');

const EntregaResiduoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  ecopunto: { type: mongoose.Schema.Types.ObjectId, ref: 'Ecopunto', required: true },
  tipoResiduo: { type: mongoose.Schema.Types.ObjectId, ref: 'TipoResiduo', required: true },
  pesoKg: { type: Number, required: true },
  cuponesGenerados: { type: Number, required: true },
  cuponGenerado: { type: mongoose.Schema.Types.ObjectId, ref: 'Cupon' },
  descripcion: { type: String, default: '' },
  fecha: { type: Date, default: Date.now },
  // Campos adicionales para el historial
  encargado: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, // Encargado que procesó la entrega
  estado: { type: String, enum: ['completado', 'pendiente', 'rechazado'], default: 'completado' },
  observaciones: { type: String, default: '' }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
EntregaResiduoSchema.index({ usuario: 1 });
EntregaResiduoSchema.index({ ecopunto: 1 });
EntregaResiduoSchema.index({ fecha: -1 });
EntregaResiduoSchema.index({ tipoResiduo: 1 });
EntregaResiduoSchema.index({ estado: 1 });

module.exports = mongoose.model('EntregaResiduo', EntregaResiduoSchema, 'entregas');
const mongoose = require('mongoose');

const EcopuntoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  direccion: String,
  zona: String,
  encargado: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  fechaCreacion: { type: Date, default: Date.now },
  activo: { type: Boolean, default: true }
});
// models/ecopunto.model.js
EcopuntoSchema.virtual('vecinos', {
    ref: 'Usuario',
    localField: '_id',
    foreignField: 'ecopuntoId',
  });
  
  EcopuntoSchema.set('toObject', { virtuals: true });
  EcopuntoSchema.set('toJSON', { virtuals: true });

  
module.exports = mongoose.models.Ecopunto || mongoose.model('Ecopunto', EcopuntoSchema, 'ecopuntos');

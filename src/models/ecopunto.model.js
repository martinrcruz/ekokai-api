const mongoose = require('mongoose');

const EcopuntoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  direccion: { type: String, required: true },
  zona: { type: String, required: true },
  descripcion: { type: String, default: '' },
  horarioApertura: { type: String, default: '08:00' },
  horarioCierre: { type: String, default: '20:00' },
  capacidadMaxima: { type: Number, default: 1000 },
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

module.exports = (connection) => {
  return connection.models.Ecopunto || connection.model('Ecopunto', EcopuntoSchema, 'ecopuntos');
};
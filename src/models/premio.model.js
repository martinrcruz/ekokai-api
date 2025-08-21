const mongoose = require('mongoose');

const premioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  imagen: {
    type: String,
    default: null
  },
  cuponesRequeridos: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  categoria: {
    type: String,
    required: true,
    trim: true
  },
  activo: {
    type: Boolean,
    default: true
  },
  destacado: {
    type: Boolean,
    default: false
  },
  orden: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
premioSchema.index({ activo: 1 });
premioSchema.index({ categoria: 1 });
premioSchema.index({ destacado: 1 });
premioSchema.index({ orden: 1 });

module.exports = mongoose.model('Premio', premioSchema);


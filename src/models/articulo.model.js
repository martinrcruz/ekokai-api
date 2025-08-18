const mongoose = require('mongoose');

const articuloSchema = new mongoose.Schema({
  cantidad: {
    type: Number,
    required: true,
    default: 0
  },
  codigo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true  // Índice definido aquí
  },
  grupo: {
    type: String,
    required: true,
    trim: true
  },
  familia: {
    type: String,
    required: true,
    trim: true
  },
  descripcionArticulo: {
    type: String,
    required: true,
    trim: true
  },
  precioVenta: {
    type: Number,
    required: true,
    min: 0
  },
  eliminado: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento de las consultas
// articuloSchema.index({ codigo: 1 }); // ← ELIMINADO: duplicado con index: true arriba
articuloSchema.index({ grupo: 1 });
articuloSchema.index({ familia: 1 });
articuloSchema.index({ eliminado: 1 });

module.exports = mongoose.model('Articulo', articuloSchema); 
const mongoose = require('mongoose');

const cuponMonedaSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  // Historial de cupones ganados
  historialGanados: [{
    fecha: {
      type: Date,
      default: Date.now
    },
    cantidad: {
      type: Number,
      required: true
    },
    tipoResiduo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TipoResiduo'
    },
    pesoReciclado: {
      type: Number,
      required: true
    },
    ecopuntoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ecopunto'
    },
    descripcion: String
  }],
  // Historial de cupones gastados
  historialGastados: [{
    fecha: {
      type: Date,
      default: Date.now
    },
    cantidad: {
      type: Number,
      required: true
    },
    premioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Premio'
    },
    premioNombre: String,
    descripcion: String
  }],
  // Configuración
  activo: {
    type: Boolean,
    default: true
  },
  fechaUltimaActualizacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
cuponMonedaSchema.index({ usuarioId: 1 });
cuponMonedaSchema.index({ activo: 1 });
cuponMonedaSchema.index({ 'historialGanados.fecha': -1 });
cuponMonedaSchema.index({ 'historialGastados.fecha': -1 });

// Método para agregar cupones (reciclar)
cuponMonedaSchema.methods.agregarCupones = function(cantidad, tipoResiduo, pesoReciclado, ecopuntoId, descripcion) {
  this.cantidad += cantidad;
  
  this.historialGanados.push({
    cantidad,
    tipoResiduo,
    pesoReciclado,
    ecopuntoId,
    descripcion: descripcion || `Ganaste ${cantidad} cupón(es) por reciclar ${pesoReciclado}kg`
  });
  
  this.fechaUltimaActualizacion = new Date();
  return this.save();
};

// Método para gastar cupones (canjear premio)
cuponMonedaSchema.methods.gastarCupones = function(cantidad, premioId, premioNombre, descripcion) {
  if (this.cantidad < cantidad) {
    throw new Error('Cupones insuficientes');
  }
  
  this.cantidad -= cantidad;
  
  this.historialGastados.push({
    cantidad,
    premioId,
    premioNombre,
    descripcion: descripcion || `Canjeaste ${cantidad} cupón(es) por ${premioNombre}`
  });
  
  this.fechaUltimaActualizacion = new Date();
  return this.save();
};

// Método para obtener balance actual
cuponMonedaSchema.methods.obtenerBalance = function() {
  return this.cantidad;
};

// Método para obtener historial resumido
cuponMonedaSchema.methods.obtenerHistorialResumido = function() {
  return {
    cuponesDisponibles: this.cantidad,
    totalGanados: this.historialGanados.reduce((sum, h) => sum + h.cantidad, 0),
    totalGastados: this.historialGastados.reduce((sum, h) => sum + h.cantidad, 0),
    ultimaGanancia: this.historialGanados[this.historialGanados.length - 1],
    ultimoGasto: this.historialGastados[this.historialGastados.length - 1]
  };
};

module.exports = mongoose.model('CuponMoneda', cuponMonedaSchema);

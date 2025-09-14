const mongoose = require('mongoose');

const QRReciclajeSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  tipo: {
    type: String,
    enum: ['reciclaje'],
    default: 'reciclaje',
    required: true
  },
  estado: {
    type: String,
    enum: ['activo', 'usado', 'expirado', 'cancelado'],
    default: 'activo',
    required: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaExpiracion: {
    type: Date,
    default: function() {
      // Por defecto expira en 30 días
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  fechaUso: Date,
  usuarioCreador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  usuarioUso: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  ecopuntoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ecopunto'
  },
  configuracion: {
    tamano: {
      type: String,
      default: '20x20cm'
    },
    descripcion: String,
    instrucciones: String,
    valorTokens: {
      type: Number,
      default: 10
    }
  },
  metadatos: {
    ubicacionCreacion: String,
    dispositivoCreacion: String,
    versionApp: String,
    lote: String
  },
  activo: {
    type: Boolean,
    default: true
  }
});

// Índices para optimizar consultas
QRReciclajeSchema.index({ codigo: 1 });
QRReciclajeSchema.index({ estado: 1, fechaCreacion: -1 });
QRReciclajeSchema.index({ usuarioUso: 1, fechaUso: -1 });
QRReciclajeSchema.index({ ecopuntoId: 1 });
QRReciclajeSchema.index({ fechaExpiracion: 1 });

// Método para verificar si el QR está activo y válido
QRReciclajeSchema.methods.esValido = function() {
  return this.estado === 'activo' && 
         this.activo === true && 
         this.fechaExpiracion > new Date();
};

// Método para marcar como usado
QRReciclajeSchema.methods.marcarComoUsado = function(usuarioId) {
  this.estado = 'usado';
  this.fechaUso = new Date();
  this.usuarioUso = usuarioId;
  return this.save();
};

// Método estático para generar código único
QRReciclajeSchema.statics.generarCodigo = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `EKOKAI-RECYCLE-${timestamp}-${random}`.toUpperCase();
};

const QRReciclaje = mongoose.model('QRReciclaje', QRReciclajeSchema);
module.exports = QRReciclaje;

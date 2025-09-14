const mongoose = require('mongoose');

const CanjeReciclajeSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  qrCode: {
    type: String,
    required: true,
    index: true
  },
  qrReciclajeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRReciclaje',
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['iniciado', 'primera_imagen_validada', 'completado', 'fallido'],
    default: 'iniciado',
    required: true
  },
  fechaInicio: {
    type: Date,
    default: Date.now
  },
  fechaCompletado: Date,
  imagenes: {
    primera: {
      ruta: String,
      timestamp: Date,
      validacion: {
        exitosa: Boolean,
        confianza: Number,
        elementos_encontrados: {
          bolsa_basura: Boolean,
          qr_visible: Boolean,
          fondo_ekokai: Boolean,
          stand_reciclaje: Boolean
        },
        issues: [String]
      }
    },
    segunda: {
      ruta: String,
      timestamp: Date,
      validacion: {
        exitosa: Boolean,
        confianza: Number,
        elementos_encontrados: {
          bolsa_basura: Boolean,
          qr_visible: Boolean,
          basurero: Boolean,
          fondo_diferente: Boolean
        },
        issues: [String]
      }
    }
  },
  tokensGenerados: {
    type: Number,
    default: 0
  },
  cuponGenerado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cupon'
  },
  ubicacion: {
    stand: {
      latitud: Number,
      longitud: Number,
      direccion: String
    },
    disposicion: {
      latitud: Number,
      longitud: Number,
      direccion: String
    }
  },
  metadata: {
    conversationId: String,
    startTime: Date,
    completedTime: Date,
    intentos: {
      type: Number,
      default: 1
    },
    dispositivo: String,
    appVersion: String,
    processingTime: Number // en milisegundos
  },
  observaciones: String,
  activo: {
    type: Boolean,
    default: true
  }
});

// Índices para optimizar consultas
CanjeReciclajeSchema.index({ usuarioId: 1, fechaInicio: -1 });
CanjeReciclajeSchema.index({ qrCode: 1 });
CanjeReciclajeSchema.index({ phoneNumber: 1, fechaInicio: -1 });
CanjeReciclajeSchema.index({ estado: 1, fechaInicio: -1 });
CanjeReciclajeSchema.index({ fechaCompletado: -1 });

// Método para completar el canje
CanjeReciclajeSchema.methods.completar = function(cuponId, tokensGenerados) {
  this.estado = 'completado';
  this.fechaCompletado = new Date();
  this.cuponGenerado = cuponId;
  this.tokensGenerados = tokensGenerados;
  this.metadata.completedTime = new Date();
  this.metadata.processingTime = this.metadata.completedTime - this.metadata.startTime;
  return this.save();
};

// Método para marcar como fallido
CanjeReciclajeSchema.methods.marcarComoFallido = function(razon) {
  this.estado = 'fallido';
  this.observaciones = razon;
  return this.save();
};

// Método estático para obtener estadísticas
CanjeReciclajeSchema.statics.obtenerEstadisticas = async function(filtros = {}) {
  const pipeline = [
    { $match: filtros },
    {
      $group: {
        _id: '$estado',
        count: { $sum: 1 },
        tokensTotal: { $sum: '$tokensGenerados' }
      }
    }
  ];
  
  return await this.aggregate(pipeline);
};

const CanjeReciclaje = mongoose.model('CanjeReciclaje', CanjeReciclajeSchema);
module.exports = CanjeReciclaje;

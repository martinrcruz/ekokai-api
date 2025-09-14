const mongoose = require('mongoose');

const TrazabilidadSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  step: {
    type: String,
    enum: [
      'first_image_validated',
      'second_image_validated', 
      'exchange_completed',
      'qr_generated',
      'coupon_created',
      'error_occurred'
    ],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  qr_code: {
    type: String,
    index: true
  },
  canjeReciclajeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CanjeReciclaje'
  },
  coupon_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cupon'
  },
  exchange_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CanjeReciclaje'
  },
  image_path: String,
  validation_result: {
    success: Boolean,
    confidence: Number,
    qr_detected: Boolean,
    context_valid: Boolean,
    elements_found: mongoose.Schema.Types.Mixed,
    issues: [String],
    processing_time: Number
  },
  ubicacion: {
    latitud: Number,
    longitud: Number,
    direccion: String,
    tipo: {
      type: String,
      enum: ['stand', 'disposicion', 'unknown']
    }
  },
  metadata: {
    conversationId: String,
    platform: {
      type: String,
      default: 'whatsapp'
    },
    messageId: String,
    deviceInfo: String,
    appVersion: String,
    processingDuration: Number,
    imageSize: Number,
    imageDimensions: {
      width: Number,
      height: Number
    },
    validationType: String,
    attemptNumber: Number
  },
  error_info: {
    error_code: String,
    error_message: String,
    stack_trace: String
  },
  activo: {
    type: Boolean,
    default: true
  }
});

// Índices para optimizar consultas
TrazabilidadSchema.index({ phoneNumber: 1, timestamp: -1 });
TrazabilidadSchema.index({ userId: 1, timestamp: -1 });
TrazabilidadSchema.index({ qr_code: 1, timestamp: -1 });
TrazabilidadSchema.index({ step: 1, timestamp: -1 });
TrazabilidadSchema.index({ canjeReciclajeId: 1 });
TrazabilidadSchema.index({ timestamp: -1 });

// Método estático para obtener trazabilidad de un usuario
TrazabilidadSchema.statics.obtenerPorUsuario = async function(userId, limite = 50) {
  return await this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limite)
    .populate('coupon_id', 'nombre valor')
    .populate('exchange_id', 'estado tokensGenerados')
    .lean();
};

// Método estático para obtener trazabilidad de un QR
TrazabilidadSchema.statics.obtenerPorQR = async function(qrCode) {
  return await this.find({ qr_code: qrCode })
    .sort({ timestamp: -1 })
    .populate('userId', 'nombre apellido telefono')
    .populate('coupon_id', 'nombre valor')
    .lean();
};

// Método estático para obtener estadísticas de trazabilidad
TrazabilidadSchema.statics.obtenerEstadisticas = async function(fechaInicio, fechaFin) {
  const filtros = {
    timestamp: {
      $gte: fechaInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días por defecto
      $lte: fechaFin || new Date()
    }
  };

  const pipeline = [
    { $match: filtros },
    {
      $group: {
        _id: {
          step: '$step',
          fecha: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.step',
        total: { $sum: '$count' },
        porFecha: {
          $push: {
            fecha: '$_id.fecha',
            count: '$count'
          }
        }
      }
    }
  ];

  return await this.aggregate(pipeline);
};

// Método estático para registrar evento de trazabilidad
TrazabilidadSchema.statics.registrarEvento = async function(datos) {
  try {
    const evento = new this(datos);
    return await evento.save();
  } catch (error) {
    console.error('Error registrando evento de trazabilidad:', error);
    throw error;
  }
};

const Trazabilidad = mongoose.model('Trazabilidad', TrazabilidadSchema);
module.exports = Trazabilidad;

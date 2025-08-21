const mongoose = require('mongoose');

const CanjeSchema = new mongoose.Schema({
    cuponId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Cupon', 
        required: true 
    },
    usuarioId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    comercioId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario' 
    },
    tokensGastados: { 
        type: Number, 
        required: true 
    },
    fechaCanje: { 
        type: Date, 
        default: Date.now 
    },
    estado: { 
        type: String, 
        enum: ['pendiente', 'aprobado', 'rechazado', 'completado'], 
        default: 'pendiente' 
    },
    observaciones: String,
    aprobadoPor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario' 
    },
    fechaAprobacion: Date
});

// Índices para mejorar el rendimiento de las consultas
CanjeSchema.index({ cuponId: 1, fechaCanje: -1 });
CanjeSchema.index({ usuarioId: 1, fechaCanje: -1 });
CanjeSchema.index({ comercioId: 1, fechaCanje: -1 });
CanjeSchema.index({ estado: 1 });

module.exports = mongoose.model('Canje', CanjeSchema);
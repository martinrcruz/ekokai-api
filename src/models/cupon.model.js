const mongoose = require('mongoose');

const CuponSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: String,
    tokensRequeridos: { type: Number, required: true },
    fechaExpiracion: Date,
    activo: { type: Boolean, default: true },
    fechaCreacion: { type: Date, default: Date.now },
    // Nuevos campos para funcionalidades avanzadas
    codigo: { type: String, unique: true, required: true }, // Código único del cupón
    tipo: { type: String, enum: ['general', 'personalizado', 'masivo', 'reciclaje'], default: 'general' },
    cantidadDisponible: { type: Number, default: 1 }, // Para cupones masivos
    cantidadUtilizada: { type: Number, default: 0 },
    // Campos específicos para cupones de reciclaje
    pesoGenerador: { type: Number }, // Peso que generó el cupón
    tipoResiduoGenerador: { type: mongoose.Schema.Types.ObjectId, ref: 'TipoResiduo' }, // Tipo de residuo que generó el cupón
    fechaVencimiento: { type: Date }, // Fecha de vencimiento del cupón
    usuariosAsociados: [{ // Usuarios específicos que pueden usar el cupón
        usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
        fechaAsociacion: { type: Date, default: Date.now },
        utilizado: { type: Boolean, default: false },
        fechaUso: Date
    }],
    comerciosAsociados: [{ // Comercios específicos donde se puede usar
        comercioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
        fechaAsociacion: { type: Date, default: Date.now }
    }],
    // Configuración de uso
    maxUsosPorUsuario: { type: Number, default: 1 },
    requiereAprobacion: { type: Boolean, default: false },
    // Historial de uso
    historialUso: [{
        usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
        fechaUso: { type: Date, default: Date.now },
        tokensGastados: Number,
        comercioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
    }]
});

// Middleware para generar código único automáticamente
CuponSchema.pre('save', async function(next) {
    if (!this.codigo) {
        this.codigo = await this.constructor.generarCodigoUnico();
    }
    next();
});

// Método estático para generar código único
CuponSchema.statics.generarCodigoUnico = async function() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo;
    let esUnico = false;
    
    while (!esUnico) {
        codigo = '';
        for (let i = 0; i < 8; i++) {
            codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        
        const cuponExistente = await this.findOne({ codigo });
        if (!cuponExistente) {
            esUnico = true;
        }
    }
    
    return codigo;
};

// Método para verificar si un usuario puede usar el cupón
CuponSchema.methods.puedeUsarUsuario = function(usuarioId) {
    if (!this.activo) return false;
    if (this.fechaExpiracion && new Date() > this.fechaExpiracion) return false;
    if (this.cantidadDisponible <= this.cantidadUtilizada) return false;
    
    // Verificar si es cupón personalizado y el usuario está asociado
    if (this.tipo === 'personalizado') {
        const asociacion = this.usuariosAsociados.find(u => u.usuarioId.toString() === usuarioId.toString());
        if (!asociacion) return false;
        if (asociacion.utilizado) return false;
    }
    
    // Verificar límite de usos por usuario
    const usosDelUsuario = this.historialUso.filter(h => h.usuarioId.toString() === usuarioId.toString()).length;
    if (usosDelUsuario >= this.maxUsosPorUsuario) return false;
    
    return true;
};

// Método para usar el cupón
CuponSchema.methods.usarCupon = function(usuarioId, comercioId, tokensGastados) {
    if (!this.puedeUsarUsuario(usuarioId)) {
        throw new Error('El usuario no puede usar este cupón');
    }
    
    this.cantidadUtilizada += 1;
    
    // Marcar como utilizado si es personalizado
    if (this.tipo === 'personalizado') {
        const asociacion = this.usuariosAsociados.find(u => u.usuarioId.toString() === usuarioId.toString());
        if (asociacion) {
            asociacion.utilizado = true;
            asociacion.fechaUso = new Date();
        }
    }
    
    // Agregar al historial
    this.historialUso.push({
        usuarioId,
        comercioId,
        tokensGastados,
        fechaUso: new Date()
    });
    
    return this.save();
};

module.exports = mongoose.model('Cupon', CuponSchema);
  
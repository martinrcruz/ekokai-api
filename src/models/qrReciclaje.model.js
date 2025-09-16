const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const QRReciclaje = sequelize.define('QRReciclaje', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  tipo: {
    type: DataTypes.ENUM('reciclaje'),
    defaultValue: 'reciclaje',
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('activo', 'usado', 'expirado', 'cancelado'),
    defaultValue: 'activo',
    allowNull: false
  },
  fechaExpiracion: {
    type: DataTypes.DATE,
    defaultValue: () => {
      // Por defecto expira en 30 días
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + 30);
      return fecha;
    }
  },
  fechaUso: {
    type: DataTypes.DATE,
    allowNull: true
  },
  usuarioCreadorId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  usuarioUsoId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  ecopuntoId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'ecopuntos',
      key: 'id'
    }
  },
  configuracion: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  metadatos: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'qr_reciclajes',
  timestamps: true,
  indexes: [
    {
      fields: ['codigo']
    },
    {
      fields: ['estado', 'createdAt']
    },
    {
      fields: ['usuarioUsoId', 'fechaUso']
    },
    {
      fields: ['ecopuntoId']
    },
    {
      fields: ['fechaExpiracion']
    }
  ]
});

// Método para verificar si el QR está activo y válido
QRReciclaje.prototype.esValido = function() {
  return this.estado === 'activo' && 
         this.activo === true && 
         this.fechaExpiracion > new Date();
};

// Método para marcar como usado
QRReciclaje.prototype.marcarComoUsado = function(usuarioId) {
  this.estado = 'usado';
  this.fechaUso = new Date();
  this.usuarioUsoId = usuarioId;
  return this.save();
};

// Método estático para generar código único
QRReciclaje.generarCodigo = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `EKOKAI-RECYCLE-${timestamp}-${random}`.toUpperCase();
};

module.exports = QRReciclaje;

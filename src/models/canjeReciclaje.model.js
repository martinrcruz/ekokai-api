const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const CanjeReciclaje = sequelize.define('CanjeReciclaje', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  usuarioId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  qrCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  qrReciclajeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'qr_reciclajes',
      key: 'id'
    }
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('iniciado', 'primera_imagen_validada', 'completado', 'fallido'),
    defaultValue: 'iniciado',
    allowNull: false
  },
  fechaInicio: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fechaCompletado: {
    type: DataTypes.DATE,
    allowNull: true
  },
  imagenes: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  tokensGenerados: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  cuponGeneradoId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'cupones',
      key: 'id'
    }
  },
  ubicacion: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'canjes_reciclaje',
  timestamps: false,
  indexes: [
    {
      fields: ['usuarioId', 'fechaInicio']
    },
    {
      fields: ['qrCode']
    },
    {
      fields: ['phoneNumber', 'fechaInicio']
    },
    {
      fields: ['estado', 'fechaInicio']
    },
    {
      fields: ['fechaCompletado']
    }
  ]
});

// Método para completar el canje
CanjeReciclaje.prototype.completar = function(cuponId, tokensGenerados) {
  this.estado = 'completado';
  this.fechaCompletado = new Date();
  this.cuponGeneradoId = cuponId;
  this.tokensGenerados = tokensGenerados;
  
  if (this.metadata) {
    this.metadata.completedTime = new Date();
    this.metadata.processingTime = this.metadata.completedTime - this.metadata.startTime;
  }
  
  return this.save();
};

// Método para marcar como fallido
CanjeReciclaje.prototype.marcarComoFallido = function(razon) {
  this.estado = 'fallido';
  this.observaciones = razon;
  return this.save();
};

module.exports = CanjeReciclaje;

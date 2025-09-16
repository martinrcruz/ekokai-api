const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Trazabilidad = sequelize.define('Trazabilidad', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  step: {
    type: DataTypes.ENUM(
      'first_image_validated',
      'second_image_validated', 
      'exchange_completed',
      'qr_generated',
      'coupon_created',
      'error_occurred'
    ),
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  qr_code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  canjeReciclajeId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'canjes',
      key: 'id'
    }
  },
  coupon_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'cupones',
      key: 'id'
    }
  },
  exchange_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'canjes',
      key: 'id'
    }
  },
  image_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  validation_result: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  ubicacion: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  error_info: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'trazabilidad',
  timestamps: true,
  indexes: [
    {
      fields: ['phoneNumber', 'timestamp']
    },
    {
      fields: ['userId', 'timestamp']
    },
    {
      fields: ['qr_code', 'timestamp']
    },
    {
      fields: ['step', 'timestamp']
    },
    {
      fields: ['canjeReciclajeId']
    },
    {
      fields: ['timestamp']
    }
  ]
});

// Método estático para obtener trazabilidad de un usuario
Trazabilidad.obtenerPorUsuario = async function(userId, limite = 50) {
  return await this.findAll({
    where: { userId },
    order: [['timestamp', 'DESC']],
    limit: limite,
    include: [
      {
        model: require('./cupon.model'),
        as: 'coupon',
        attributes: ['nombre', 'tokensRequeridos']
      }
    ]
  });
};

// Método estático para obtener trazabilidad de un QR
Trazabilidad.obtenerPorQR = async function(qrCode) {
  return await this.findAll({
    where: { qr_code: qrCode },
    order: [['timestamp', 'DESC']],
    include: [
      {
        model: require('./usuario.model'),
        as: 'user',
        attributes: ['nombre', 'apellido', 'telefono']
      },
      {
        model: require('./cupon.model'),
        as: 'coupon',
        attributes: ['nombre', 'tokensRequeridos']
      }
    ]
  });
};

// Método estático para registrar evento de trazabilidad
Trazabilidad.registrarEvento = async function(datos) {
  try {
    return await this.create(datos);
  } catch (error) {
    console.error('Error registrando evento de trazabilidad:', error);
    throw error;
  }
};

module.exports = Trazabilidad;

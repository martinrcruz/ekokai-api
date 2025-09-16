const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const CanjeRecompensa = sequelize.define('CanjeRecompensa', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuarioId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    comment: 'ID del usuario que realiza el canje'
  },
  recompensaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'recompensas',
      key: 'id'
    },
    comment: 'ID de la recompensa canjeada'
  },
  codigoRecompensa: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Código de la recompensa al momento del canje'
  },
  cuponesUsados: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Array de IDs de cupones utilizados'
  },
  codigoCanje: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Código único para presentar en el establecimiento'
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'completado', 'usado', 'expirado', 'cancelado'),
    allowNull: false,
    defaultValue: 'completado',
    comment: 'Estado del canje'
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha del canje'
  },
  fechaUso: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha en que se utilizó la recompensa'
  },
  fechaExpiracion: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de expiración del código de canje'
  },
  establecimiento: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Establecimiento donde se puede usar'
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales del canje'
  }
}, {
  tableName: 'canjes_recompensa',
  timestamps: true,
  indexes: [
    {
      fields: ['usuarioId']
    },
    {
      fields: ['recompensaId']
    },
    {
      unique: true,
      fields: ['codigoCanje']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['fecha']
    }
  ]
});

// Definir asociaciones
CanjeRecompensa.associate = (models) => {
  CanjeRecompensa.belongsTo(models.Usuario, {
    foreignKey: 'usuarioId',
    as: 'usuario'
  });
  
  CanjeRecompensa.belongsTo(models.Recompensa, {
    foreignKey: 'recompensaId',
    as: 'recompensa'
  });
};

module.exports = CanjeRecompensa;

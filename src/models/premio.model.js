const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Premio = sequelize.define('Premio', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  imagen: {
    type: DataTypes.TEXT, // Cambiado a TEXT para soportar imágenes base64 largas
    allowNull: true
  },
  cuponesRequeridos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1, // Valor por defecto de 1 cupón
    validate: {
      min: 1 // Mínimo 1 cupón
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  destacado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
}, {
  tableName: 'premios',
  timestamps: true,
  indexes: [
    {
      fields: ['activo']
    },
    {
      fields: ['categoria']
    },
    {
      fields: ['destacado']
    },
  ]
});

module.exports = Premio;


const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const TipoResiduo = sequelize.define('TipoResiduo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoria: { 
    type: DataTypes.STRING, 
    defaultValue: 'general' 
  },
  unidad: { 
    type: DataTypes.ENUM('kilos', 'gramos', 'litros'), 
    defaultValue: 'kilos' 
  },
  tokensPorKg: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    validate: {
      min: 0
    }
  },
  activo: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  }
}, {
  tableName: 'tiporesiduos',
  timestamps: true
});

module.exports = TipoResiduo;
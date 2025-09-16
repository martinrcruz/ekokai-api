const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Ecopunto = sequelize.define('Ecopunto', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  direccion: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  zona: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  descripcion: { 
    type: DataTypes.TEXT, 
    defaultValue: '' 
  },
  horarioApertura: { 
    type: DataTypes.STRING, 
    defaultValue: '08:00' 
  },
  horarioCierre: { 
    type: DataTypes.STRING, 
    defaultValue: '20:00' 
  },
  capacidadMaxima: { 
    type: DataTypes.INTEGER, 
    defaultValue: 1000 
  },
  encargadoId: { 
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  activo: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  }
}, {
  tableName: 'ecopuntos',
  timestamps: true
});

module.exports = Ecopunto;
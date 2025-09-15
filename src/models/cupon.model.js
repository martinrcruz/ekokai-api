const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Cupon = sequelize.define('Cupon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tokensRequeridos: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  fechaExpiracion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  activo: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  },
  codigo: { 
    type: DataTypes.STRING, 
    unique: true, 
    allowNull: false 
  },
  tipo: { 
    type: DataTypes.ENUM('general', 'personalizado', 'masivo', 'reciclaje'), 
    defaultValue: 'general' 
  },
  cantidadDisponible: { 
    type: DataTypes.INTEGER, 
    defaultValue: 1 
  },
  cantidadUtilizada: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  pesoGenerador: { 
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true 
  },
  tipoResiduoGeneradorId: { 
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'tiporesiduos',
      key: 'id'
    }
  },
  fechaVencimiento: { 
    type: DataTypes.DATE,
    allowNull: true 
  },
  maxUsosPorUsuario: { 
    type: DataTypes.INTEGER, 
    defaultValue: 1 
  },
  requiereAprobacion: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  }
}, {
  tableName: 'cupones',
  timestamps: true,
  createdAt: 'fechaCreacion',
  updatedAt: 'updatedAt',
  hooks: {
    beforeCreate: async (cupon) => {
      if (!cupon.codigo) {
        cupon.codigo = await Cupon.generarCodigoUnico();
      }
    }
  }
});

// Método estático para generar código único
Cupon.generarCodigoUnico = async function() {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo;
  let esUnico = false;
  
  while (!esUnico) {
    codigo = '';
    for (let i = 0; i < 8; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    
    const cuponExistente = await this.findOne({ where: { codigo } });
    if (!cuponExistente) {
      esUnico = true;
    }
  }
  
  return codigo;
};

// Método para verificar si un usuario puede usar el cupón
Cupon.prototype.puedeUsarUsuario = async function(usuarioId) {
  if (!this.activo) return false;
  if (this.fechaExpiracion && new Date() > this.fechaExpiracion) return false;
  if (this.cantidadDisponible <= this.cantidadUtilizada) return false;
  
  // Verificar límite de usos por usuario
  const { CuponUso } = require('./cuponUso.model');
  const usosDelUsuario = await CuponUso.count({
    where: { 
      cuponId: this.id,
      usuarioId: usuarioId
    }
  });
  
  if (usosDelUsuario >= this.maxUsosPorUsuario) return false;
  
  return true;
};

module.exports = Cupon;
  
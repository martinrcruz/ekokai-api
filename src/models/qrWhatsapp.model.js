const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const QRWhatsapp = sequelize.define('QRWhatsapp', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 1000]
    }
  },
  fechaCreacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fechaExpiracion: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfter: function(value) {
        if (value <= this.fechaCreacion) {
          throw new Error('La fecha de expiración debe ser posterior a la fecha de creación');
        }
      }
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  numeroWhatsapp: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Número de WhatsApp al que redirige el QR (opcional)'
  },
  qrDataUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Data URL del código QR generado'
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    },
    comment: 'Nombre descriptivo del código QR'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción opcional del código QR'
  }
}, {
  tableName: 'qr_whatsapp',
  timestamps: true,
  paranoid: false,
  indexes: [
    {
      fields: ['activo']
    },
    {
      fields: ['fechaExpiracion']
    },
    {
      fields: ['fechaCreacion']
    }
  ]
});

// Método para verificar si el QR está expirado
QRWhatsapp.prototype.isExpirado = function() {
  return new Date() > this.fechaExpiracion;
};

// Método para generar el enlace de WhatsApp
QRWhatsapp.prototype.generarEnlaceWhatsapp = function() {
  const mensajeCodificado = encodeURIComponent(this.mensaje);
  const numero = this.numeroWhatsapp || '';
  return `https://wa.me/${numero}?text=${mensajeCodificado}`;
};

module.exports = QRWhatsapp;

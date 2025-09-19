/**
 * Archivo índice para importar todos los modelos de Sequelize
 * Esto asegura que todos los modelos estén registrados y las asociaciones definidas
 */

const { sequelize } = require('../config/sequelize');

// Importar todos los modelos
const Usuario = require('./usuario.model');
const Ecopunto = require('./ecopunto.model');
const TipoResiduo = require('./tiporesiduo.model');
const EntregaResiduo = require('./entregaresiduo.model');
const Cupon = require('./cupon.model');
const CuponUso = require('./cuponUso.model');
const Canje = require('./canje.model');
const Premio = require('./premio.model');
const CuponMoneda = require('./cupon-moneda.model');
const CuponHistorialGanado = require('./cuponHistorialGanado.model');
const CuponHistorialGastado = require('./cuponHistorialGastado.model');
const EcopuntoMeta = require('./ecopuntoMeta.model');
const Recompensa = require('./recompensa.model');
const CanjeRecompensa = require('./canjeRecompensa.model');
const Trazabilidad = require('./trazabilidad.model');
const CanjeReciclaje = require('./canjeReciclaje.model');
const QRReciclaje = require('./qrReciclaje.model');
const QRWhatsapp = require('./qrWhatsapp.model');

// Definir asociaciones
const defineAssociations = () => {
  // Usuario - Ecopunto (One-to-Many)
  Usuario.belongsTo(Ecopunto, { foreignKey: 'ecopuntoId', as: 'ecopunto' });
  Ecopunto.hasMany(Usuario, { foreignKey: 'ecopuntoId', as: 'vecinos' });
  
  // Ecopunto - Usuario (One-to-One para encargado)
  Ecopunto.belongsTo(Usuario, { foreignKey: 'encargadoId', as: 'encargado' });
  Usuario.hasMany(Ecopunto, { foreignKey: 'encargadoId', as: 'ecopuntosEncargados' });

  // Usuario - EntregaResiduo (One-to-Many)
  Usuario.hasMany(EntregaResiduo, { foreignKey: 'usuarioId', as: 'entregas' });
  EntregaResiduo.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

  // Ecopunto - EntregaResiduo (One-to-Many)
  Ecopunto.hasMany(EntregaResiduo, { foreignKey: 'ecopuntoId', as: 'entregas' });
  EntregaResiduo.belongsTo(Ecopunto, { foreignKey: 'ecopuntoId', as: 'ecopunto' });

  // TipoResiduo - EntregaResiduo (One-to-Many)
  TipoResiduo.hasMany(EntregaResiduo, { foreignKey: 'tipoResiduoId', as: 'entregas' });
  EntregaResiduo.belongsTo(TipoResiduo, { foreignKey: 'tipoResiduoId', as: 'tipoResiduo' });

  // Cupon - EntregaResiduo (One-to-Many)
  Cupon.hasMany(EntregaResiduo, { foreignKey: 'cuponGeneradoId', as: 'entregasGeneradas' });
  EntregaResiduo.belongsTo(Cupon, { foreignKey: 'cuponGeneradoId', as: 'cuponGenerado' });

  // Usuario - Canje (One-to-Many)
  Usuario.hasMany(Canje, { foreignKey: 'usuarioId', as: 'canjes' });
  Canje.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

  // Cupon - Canje (One-to-Many)
  Cupon.hasMany(Canje, { foreignKey: 'cuponId', as: 'canjes' });
  Canje.belongsTo(Cupon, { foreignKey: 'cuponId', as: 'cupon' });

  // Usuario - CuponMoneda (One-to-One)
  Usuario.hasOne(CuponMoneda, { foreignKey: 'usuarioId', as: 'cuponMoneda' });
  CuponMoneda.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

  // CuponMoneda - CuponHistorialGanado (One-to-Many)
  CuponMoneda.hasMany(CuponHistorialGanado, { foreignKey: 'cuponMonedaId', as: 'historialGanados' });
  CuponHistorialGanado.belongsTo(CuponMoneda, { foreignKey: 'cuponMonedaId', as: 'cuponMoneda' });

  // CuponMoneda - CuponHistorialGastado (One-to-Many)
  CuponMoneda.hasMany(CuponHistorialGastado, { foreignKey: 'cuponMonedaId', as: 'historialGastados' });
  CuponHistorialGastado.belongsTo(CuponMoneda, { foreignKey: 'cuponMonedaId', as: 'cuponMoneda' });

  // Ecopunto - EcopuntoMeta (One-to-Many)
  Ecopunto.hasMany(EcopuntoMeta, { foreignKey: 'ecopuntoId', as: 'metas' });
  EcopuntoMeta.belongsTo(Ecopunto, { foreignKey: 'ecopuntoId', as: 'ecopunto' });

  // Usuario - Trazabilidad (One-to-Many)
  Usuario.hasMany(Trazabilidad, { foreignKey: 'userId', as: 'trazabilidad' });
  Trazabilidad.belongsTo(Usuario, { foreignKey: 'userId', as: 'user' });

  // Cupon - Trazabilidad (One-to-Many)
  Cupon.hasMany(Trazabilidad, { foreignKey: 'coupon_id', as: 'trazabilidad' });
  Trazabilidad.belongsTo(Cupon, { foreignKey: 'coupon_id', as: 'coupon' });

  // Usuario - CanjeReciclaje (One-to-Many)
  Usuario.hasMany(CanjeReciclaje, { foreignKey: 'usuarioId', as: 'canjesReciclaje' });
  CanjeReciclaje.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

  // QRReciclaje - CanjeReciclaje (One-to-Many)
  QRReciclaje.hasMany(CanjeReciclaje, { foreignKey: 'qrReciclajeId', as: 'canjes' });
  CanjeReciclaje.belongsTo(QRReciclaje, { foreignKey: 'qrReciclajeId', as: 'qrReciclaje' });

  // Cupon - CanjeReciclaje (One-to-Many)
  Cupon.hasMany(CanjeReciclaje, { foreignKey: 'cuponGeneradoId', as: 'canjesReciclaje' });
  CanjeReciclaje.belongsTo(Cupon, { foreignKey: 'cuponGeneradoId', as: 'cuponGenerado' });

  // Usuario - QRReciclaje (One-to-Many para creador)
  Usuario.hasMany(QRReciclaje, { foreignKey: 'usuarioCreadorId', as: 'qrReciclajesCreados' });
  QRReciclaje.belongsTo(Usuario, { foreignKey: 'usuarioCreadorId', as: 'usuarioCreador' });

  // Usuario - QRReciclaje (One-to-Many para usuario)
  Usuario.hasMany(QRReciclaje, { foreignKey: 'usuarioUsoId', as: 'qrReciclajesUsados' });
  QRReciclaje.belongsTo(Usuario, { foreignKey: 'usuarioUsoId', as: 'usuarioUso' });

  // Ecopunto - QRReciclaje (One-to-Many)
  Ecopunto.hasMany(QRReciclaje, { foreignKey: 'ecopuntoId', as: 'qrReciclajes' });
  QRReciclaje.belongsTo(Ecopunto, { foreignKey: 'ecopuntoId', as: 'ecopunto' });
};

// Definir asociaciones
defineAssociations();

console.log('✅ Todos los modelos de Sequelize han sido registrados y asociaciones definidas');

module.exports = {
  sequelize,
  Usuario,
  Ecopunto,
  TipoResiduo,
  EntregaResiduo,
  Cupon,
  CuponUso,
  Canje,
  Premio,
  CuponMoneda,
  CuponHistorialGanado,
  CuponHistorialGastado,
  EcopuntoMeta,
  Recompensa,
  CanjeRecompensa,
  Trazabilidad,
  CanjeReciclaje,
  QRReciclaje,
  QRWhatsapp
};

/**
 * Archivo índice para importar todos los modelos de Mongoose
 * Esto asegura que todos los modelos estén registrados antes de que se usen
 */

// Importar todos los modelos (ahora se registran directamente)
require('./usuario.model');
require('./ecopunto.model');
require('./ecopuntoMeta.model');
require('./tiporesiduo.model');
require('./entregaresiduo.model');
require('./cupon.model');
require('./canje.model');
require('./articulo.model');
require('./premio.model');
require('./cupon-moneda.model');

console.log('✅ Todos los modelos de Mongoose han sido registrados');

module.exports = {};

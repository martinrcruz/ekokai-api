const Entrega = require('../models/entregaresiduo.model');


const obtenerKilosPorMes = async () => {
    console.log('📊 [SERVICE] Iniciando agrupación de kilos por mes...');
  
    try {
      const resultado = await Entrega.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$fecha' },
              month: { $month: '$fecha' }
            },
            totalKg: { $sum: '$pesoKg' }
          }
        },
        {
          $project: {
            mes: {
              $concat: [
                { $toString: '$_id.year' },
                '-',
                {
                  $cond: {
                    if: { $lt: ['$_id.month', 10] },
                    then: { $concat: ['0', { $toString: '$_id.month' }] },
                    else: { $toString: '$_id.month' }
                  }
                }
              ]
            },
            totalKg: 1,
            _id: 0
          }
        },
        { $sort: { mes: 1 } }
      ]);
  
      console.log('✅ [SERVICE] Resultado de agregación:', resultado);
      return resultado;
    } catch (error) {
      console.error('❌ [SERVICE] Error en obtenerKilosPorMes:', error.message);
      throw new Error('No se pudo calcular los kilos por mes');
    }
  };
  
  
  const calcularProgresoMetaMensual = async (metaKg = 3000) => {
    console.log('📊 [SERVICE] Calculando progreso mensual hacia meta de', metaKg, 'kg');
  
    try {
      const ahora = new Date();
      const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      const ultimoDiaMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
  
      console.log('📅 [SERVICE] Rango del mes actual:', primerDiaMes.toISOString(), '→', ultimoDiaMes.toISOString());
  
      const resultado = await Entrega.aggregate([
        {
          $match: {
            fecha: { $gte: primerDiaMes, $lte: ultimoDiaMes }
          }
        },
        {
          $group: {
            _id: null,
            totalKg: { $sum: '$pesoKg' }
          }
        }
      ]);
  
      console.log('📈 [SERVICE] Resultado de la agregación:', resultado);
  
      const totalKg = resultado[0]?.totalKg || 0;
      const porcentaje = Math.min((totalKg / metaKg) * 100, 100).toFixed(2);
      const restante = Math.max(metaKg - totalKg, 0).toFixed(2);
      const mesActual = `${primerDiaMes.getFullYear()}-${(primerDiaMes.getMonth() + 1).toString().padStart(2, '0')}`;
  
      const datos = {
        mes: mesActual,
        totalKg: totalKg.toFixed(2),
        metaKg,
        porcentaje: Number(porcentaje),
        restante: Number(restante)
      };
  
      console.log('✅ [SERVICE] Datos finales:', datos);
      return datos;
    } catch (error) {
      console.error('❌ [SERVICE] Error al calcular progreso mensual:', error.message);
      throw new Error('No se pudo calcular el progreso mensual');
    }
  };
  
const obtenerTotalKilos = async () => {
  const resultado = await Entrega.aggregate([
    { $group: { _id: null, totalKg: { $sum: '$pesoKg' } } }
  ]);
  return resultado[0]?.totalKg || 0;
};

const obtenerSucursalConMasKilos = async () => {
  const resultado = await Entrega.aggregate([
    { $group: { _id: '$ecopunto', totalKg: { $sum: '$pesoKg' } } },
    { $sort: { totalKg: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: 'ecopuntos',
        localField: '_id',
        foreignField: '_id',
        as: 'ecopunto'
      }
    },
    { $unwind: '$ecopunto' },
    { $project: { sucursal: '$ecopunto.nombre', totalKg: 1 } }
  ]);

  return resultado[0] || null;
};

module.exports = {
  obtenerTotalKilos,
  obtenerSucursalConMasKilos,
  obtenerKilosPorMes,
  calcularProgresoMetaMensual
};

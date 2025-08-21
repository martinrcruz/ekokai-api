const EntregaResiduo = require('../models/entregaresiduo.model');

const obtenerKilosPorMes = async () => {
    console.log('📊 [SERVICE] Iniciando agrupación de kilos por mes...');
  
    try {
      const resultado = await EntregaResiduo.aggregate([
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
  
  
  const calcularProgresoMetaMensual = async (ecopuntoId = null, metaKg = 3000) => {
    console.log('📊 [SERVICE] Calculando progreso mensual hacia meta de', metaKg, 'kg');
  
    try {
      const ahora = new Date();
      const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      const ultimoDiaMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
  
      console.log('📅 [SERVICE] Rango del mes actual:', primerDiaMes.toISOString(), '→', ultimoDiaMes.toISOString());
  
      const matchStage = {
        fecha: { $gte: primerDiaMes, $lte: ultimoDiaMes }
      };
      
      // Si se especifica un ecopunto, filtrar por él
      if (ecopuntoId) {
        matchStage.ecopunto = ecopuntoId;
      }
  
      const resultado = await EntregaResiduo.aggregate([
        { $match: matchStage },
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
  
const obtenerTotalKilos = async (ecopuntoId = null) => {
  try {
    const matchStage = {};
    if (ecopuntoId) {
      matchStage.ecopunto = ecopuntoId;
    }
    
    const resultado = await EntregaResiduo.aggregate([
      { $match: matchStage },
      { $group: { _id: null, totalKg: { $sum: '$pesoKg' } } }
    ]);
    return resultado[0]?.totalKg || 0;
  } catch (error) {
    console.error('❌ [SERVICE] Error al obtener total de kilos:', error.message);
    throw new Error('No se pudo calcular el total de kilos');
  }
};

const obtenerSucursalConMasKilos = async () => {
  try {
    const resultado = await EntregaResiduo.aggregate([
      {
        $group: {
          _id: '$ecopunto',
          totalKg: { $sum: '$pesoKg' }
        }
      },
      { $sort: { totalKg: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'ecopuntos',
          localField: '_id',
          foreignField: '_id',
          as: 'ecopuntoInfo'
        }
      },
      { $unwind: '$ecopuntoInfo' },
      {
        $project: {
          _id: 0,
          sucursal: '$ecopuntoInfo.nombre',
          totalKg: 1
        }
      }
    ]);
    
    return resultado[0] || { sucursal: 'Sin datos', totalKg: 0 };
  } catch (error) {
    console.error('❌ [SERVICE] Error al obtener sucursal top:', error.message);
    throw new Error('No se pudo calcular la sucursal top');
  }
};

// === NUEVOS MÉTODOS PARA USUARIO LOGEADO ===

const obtenerKilosUsuarioHoy = async (usuarioId) => {
  try {
    console.log('📊 [SERVICE] Obteniendo kilos del usuario', usuarioId, 'para hoy');
    
    const hoy = new Date();
    const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const finDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
    
    const resultado = await EntregaResiduo.aggregate([
      {
        $match: {
          encargado: usuarioId,
          fecha: { $gte: inicioDia, $lt: finDia }
        }
      },
      {
        $group: {
          _id: null,
          kilosHoy: { $sum: '$pesoKg' }
        }
      }
    ]);
    
    const kilosHoy = resultado[0]?.kilosHoy || 0;
    console.log('✅ [SERVICE] Kilos del usuario hoy:', kilosHoy);
    return { kilosHoy };
  } catch (error) {
    console.error('❌ [SERVICE] Error al obtener kilos del usuario hoy:', error.message);
    throw new Error('No se pudo calcular los kilos del usuario hoy');
  }
};

const obtenerMetaDiariaUsuario = async (usuarioId) => {
  try {
    console.log('📊 [SERVICE] Obteniendo meta diaria del usuario', usuarioId);
    
    // Por ahora, usamos una meta fija de 100kg por día
    // En el futuro, esto podría venir de una configuración personalizada del usuario
    const metaDiaria = 100;
    
    console.log('✅ [SERVICE] Meta diaria del usuario:', metaDiaria);
    return { metaDiaria };
  } catch (error) {
    console.error('❌ [SERVICE] Error al obtener meta diaria del usuario:', error.message);
    throw new Error('No se pudo obtener la meta diaria del usuario');
  }
};

const obtenerEstadisticasUsuarioHoy = async (usuarioId) => {
  try {
    console.log('📊 [SERVICE] Obteniendo estadísticas completas del usuario', usuarioId, 'para hoy');
    
    const [kilosData, metaData] = await Promise.all([
      obtenerKilosUsuarioHoy(usuarioId),
      obtenerMetaDiariaUsuario(usuarioId)
    ]);
    
    const kilosHoy = kilosData.kilosHoy;
    const metaDiaria = metaData.metaDiaria;
    const porcentajeMeta = metaDiaria > 0 ? Math.min((kilosHoy / metaDiaria) * 100, 100) : 0;
    const kilosRestantes = Math.max(metaDiaria - kilosHoy, 0);
    
    const estadisticas = {
      kilosHoy,
      metaDiaria,
      porcentajeMeta: Math.round(porcentajeMeta * 100) / 100,
      kilosRestantes: Math.round(kilosRestantes * 100) / 100
    };
    
    console.log('✅ [SERVICE] Estadísticas completas del usuario hoy:', estadisticas);
    return estadisticas;
  } catch (error) {
    console.error('❌ [SERVICE] Error al obtener estadísticas completas del usuario hoy:', error.message);
    throw new Error('No se pudo obtener las estadísticas del usuario hoy');
  }
};

module.exports = {
  obtenerKilosPorMes,
  calcularProgresoMetaMensual,
  obtenerTotalKilos,
  obtenerSucursalConMasKilos,
  obtenerKilosUsuarioHoy,
  obtenerMetaDiariaUsuario,
  obtenerEstadisticasUsuarioHoy
};
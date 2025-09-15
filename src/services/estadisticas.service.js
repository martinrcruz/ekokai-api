const EntregaResiduo = require('../models/entregaresiduo.model');
const Ecopunto = require('../models/ecopunto.model');
const { Op, fn, col, literal } = require('sequelize');

const obtenerKilosPorMes = async () => {
  console.log('📊 [SERVICE] Iniciando agrupación de kilos por mes...');

  try {
    const resultado = await EntregaResiduo.findAll({
      attributes: [
        [fn('EXTRACT', literal('YEAR FROM "fecha"')), 'year'],
        [fn('EXTRACT', literal('MONTH FROM "fecha"')), 'month'],
        [fn('SUM', col('pesoKg')), 'totalKg']
      ],
      group: [
        fn('EXTRACT', literal('YEAR FROM "fecha"')),
        fn('EXTRACT', literal('MONTH FROM "fecha"'))
      ],
      order: [
        [fn('EXTRACT', literal('YEAR FROM "fecha"')), 'ASC'],
        [fn('EXTRACT', literal('MONTH FROM "fecha"')), 'ASC']
      ],
      raw: true
    });

    // Formatear resultado para compatibilidad con el frontend
    const resultadoFormateado = resultado.map(item => {
      const year = parseInt(item.year);
      const month = parseInt(item.month);
      const monthStr = month.toString().padStart(2, '0');
      
      return {
        mes: `${year}-${monthStr}`,
        totalKg: parseFloat(item.totalKg) || 0
      };
    });

    console.log('✅ [SERVICE] Resultado de agregación:', resultadoFormateado);
    return resultadoFormateado;
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

    const whereClause = {
      fecha: {
        [Op.between]: [primerDiaMes, ultimoDiaMes]
      }
    };

    // Si se especifica un ecopunto, filtrar por él
    if (ecopuntoId) {
      whereClause.ecopuntoId = ecopuntoId;
    }

    const totalKg = await EntregaResiduo.sum('pesoKg', {
      where: whereClause
    }) || 0;

    console.log('📈 [SERVICE] Total KG del mes:', totalKg);

    const porcentaje = Math.min((totalKg / metaKg) * 100, 100);
    const restante = Math.max(metaKg - totalKg, 0);
    const mesActual = `${primerDiaMes.getFullYear()}-${(primerDiaMes.getMonth() + 1).toString().padStart(2, '0')}`;

    const datos = {
      mes: mesActual,
      totalKg: parseFloat(totalKg.toFixed(2)),
      metaKg,
      porcentaje: parseFloat(porcentaje.toFixed(2)),
      restante: parseFloat(restante.toFixed(2))
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
    const whereClause = {};
    if (ecopuntoId) {
      whereClause.ecopuntoId = ecopuntoId;
    }
    
    const totalKg = await EntregaResiduo.sum('pesoKg', {
      where: whereClause
    }) || 0;

    return parseFloat(totalKg.toFixed(2));
  } catch (error) {
    console.error('❌ [SERVICE] Error al obtener total de kilos:', error.message);
    throw new Error('No se pudo calcular el total de kilos');
  }
};

const obtenerSucursalConMasKilos = async () => {
  try {
    // Primero obtener el ecopunto con más kilos
    const resultado = await EntregaResiduo.findAll({
      attributes: [
        'ecopuntoId',
        [fn('SUM', col('pesoKg')), 'totalKg']
      ],
      group: ['ecopuntoId'],
      order: [[fn('SUM', col('pesoKg')), 'DESC']],
      limit: 1,
      raw: true
    });

    if (resultado.length > 0) {
      const topResult = resultado[0];
      
      // Buscar información del ecopunto
      const ecopunto = await Ecopunto.findByPk(topResult.ecopuntoId);
      
      return {
        sucursal: ecopunto?.nombre || 'Sin nombre',
        totalKg: parseFloat(topResult.totalKg) || 0
      };
    }
    
    return { sucursal: 'Sin datos', totalKg: 0 };
  } catch (error) {
    console.error('❌ [SERVICE] Error al obtener sucursal top:', error.message);
    throw new Error('No se pudo calcular la sucursal top');
  }
};

// === MÉTODOS PARA USUARIO LOGEADO ===

const obtenerKilosUsuarioHoy = async (usuarioId) => {
  try {
    console.log('📊 [SERVICE] Obteniendo kilos del usuario', usuarioId, 'para hoy');
    
    const hoy = new Date();
    const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const finDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
    
    const kilosHoy = await EntregaResiduo.sum('pesoKg', {
      where: {
        encargadoId: usuarioId,
        fecha: {
          [Op.between]: [inicioDia, finDia]
        }
      }
    }) || 0;
    
    console.log('✅ [SERVICE] Kilos del usuario hoy:', kilosHoy);
    return { kilosHoy: parseFloat(kilosHoy.toFixed(2)) };
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
      porcentajeMeta: parseFloat(porcentajeMeta.toFixed(2)),
      kilosRestantes: parseFloat(kilosRestantes.toFixed(2))
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
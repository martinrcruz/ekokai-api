const estadisticasService = require('../services/estadisticas.service');

const totalKilos = async (req, res) => {
  try {
    const total = await estadisticasService.obtenerTotalKilos();
    res.json({ totalKg: total });
  } catch (error) {
    console.error('❌ Error al obtener total de kilos:', error.message);
    res.status(500).json({ error: 'Error al calcular total de kilos' });
  }
};

const sucursalTop = async (req, res) => {
  try {
    const resultado = await estadisticasService.obtenerSucursalConMasKilos();
    res.json(resultado);
  } catch (error) {
    console.error('❌ Error al obtener sucursal top:', error.message);
    res.status(500).json({ error: 'Error al calcular sucursal top' });
  }
};

const kilosPorMes = async (req, res) => {
    try {
      console.log('📥 [CONTROLLER] GET /estadisticas/kilos-por-mes');
      const data = await estadisticasService.obtenerKilosPorMes();
      console.log('📤 [CONTROLLER] Enviando datos de kilos por mes...');
      res.json(data);
    } catch (err) {
      console.error('❌ [CONTROLLER] Error en /kilos-por-mes:', err.message);
      res.status(500).json({ error: err.message });
    }
  };
  
  const progresoMetaMensual = async (req, res) => {
    try {
      console.log('📥 [CONTROLLER] GET /estadisticas/meta-mensual');
      const data = await estadisticasService.calcularProgresoMetaMensual(3000);
      console.log('📤 [CONTROLLER] Enviando progreso mensual:', data);
      res.json(data);
    } catch (err) {
      console.error('❌ [CONTROLLER] Error en /meta-mensual:', err.message);
      res.status(500).json({ error: err.message });
    }
  };
module.exports = {
  totalKilos,
  sucursalTop,
  kilosPorMes,
  progresoMetaMensual
};

const cuponRepo = require('../repositories/cupon.repository');

const crearCupon = async (req, res) => {
  try {
    console.log('[CONTROLLER] POST /cupones - Creando cupón:', req.body);
    const cupon = await cuponRepo.crearCupon(req.body);
    console.log('[CONTROLLER] Cupón creado:', cupon._id);
    res.status(201).json(cupon);
  } catch (err) {
    console.error('[CONTROLLER] Error al crear cupón:', err);
    res.status(400).json({ error: err.message });
  }
};

const listarCupones = async (req, res) => {
  try {
    console.log('[CONTROLLER] GET /cupones - Listando cupones');
    const cupones = await cuponRepo.listarCupones();
    console.log('[CONTROLLER] Cupones encontrados:', cupones.length);
    res.json(cupones);
  } catch (err) {
    console.error('[CONTROLLER] Error al listar cupones:', err);
    res.status(500).json({ error: err.message });
  }
};

const obtenerCuponPorId = async (req, res) => {
  try {
    console.log('[CONTROLLER] GET /cupones/:id - Obteniendo cupón:', req.params.id);
    const cupon = await cuponRepo.obtenerCuponPorId(req.params.id);
    if (!cupon) {
      console.log('[CONTROLLER] Cupón no encontrado');
      return res.status(404).json({ error: 'Cupón no encontrado' });
    }
    console.log('[CONTROLLER] Cupón encontrado:', cupon._id);
    res.json(cupon);
  } catch (err) {
    console.error('[CONTROLLER] Error al obtener cupón:', err);
    res.status(500).json({ error: err.message });
  }
};

const actualizarCupon = async (req, res) => {
  try {
    console.log('[CONTROLLER] PUT /cupones/:id - Actualizando cupón:', req.params.id);
    const cupon = await cuponRepo.actualizarCupon(req.params.id, req.body);
    if (!cupon) {
      console.log('[CONTROLLER] Cupón no encontrado para actualizar');
      return res.status(404).json({ error: 'Cupón no encontrado' });
    }
    console.log('[CONTROLLER] Cupón actualizado:', cupon._id);
    res.json(cupon);
  } catch (err) {
    console.error('[CONTROLLER] Error al actualizar cupón:', err);
    res.status(400).json({ error: err.message });
  }
};

const eliminarCupon = async (req, res) => {
  try {
    console.log('[CONTROLLER] DELETE /cupones/:id - Eliminando cupón:', req.params.id);
    const cupon = await cuponRepo.eliminarCupon(req.params.id);
    if (!cupon) {
      console.log('[CONTROLLER] Cupón no encontrado para eliminar');
      return res.status(404).json({ error: 'Cupón no encontrado' });
    }
    console.log('[CONTROLLER] Cupón eliminado:', req.params.id);
    res.json({ mensaje: 'Cupón eliminado correctamente' });
  } catch (err) {
    console.error('[CONTROLLER] Error al eliminar cupón:', err);
    res.status(400).json({ error: err.message });
  }
};

const activarCupon = async (req, res) => {
  try {
    console.log('[CONTROLLER] PUT /cupones/:id/activar - Activando cupón:', req.params.id);
    const cupon = await cuponRepo.actualizarCupon(req.params.id, { activo: true });
    if (!cupon) {
      console.log('[CONTROLLER] Cupón no encontrado para activar');
      return res.status(404).json({ error: 'Cupón no encontrado' });
    }
    console.log('[CONTROLLER] Cupón activado:', cupon._id);
    res.json(cupon);
  } catch (err) {
    console.error('[CONTROLLER] Error al activar cupón:', err);
    res.status(400).json({ error: err.message });
  }
};

const desactivarCupon = async (req, res) => {
  try {
    console.log('[CONTROLLER] PUT /cupones/:id/desactivar - Desactivando cupón:', req.params.id);
    const cupon = await cuponRepo.actualizarCupon(req.params.id, { activo: false });
    if (!cupon) {
      console.log('[CONTROLLER] Cupón no encontrado para desactivar');
      return res.status(404).json({ error: 'Cupón no encontrado' });
    }
    console.log('[CONTROLLER] Cupón desactivado:', cupon._id);
    res.json(cupon);
  } catch (err) {
    console.error('[CONTROLLER] Error al desactivar cupón:', err);
    res.status(400).json({ error: err.message });
  }
};

const listarCuponesActivos = async (req, res) => {
  try {
    console.log('[CONTROLLER] GET /cupones/activos - Listando cupones activos');
    const cupones = await cuponRepo.listarCuponesActivos();
    console.log('[CONTROLLER] Cupones activos encontrados:', cupones.length);
    res.json(cupones);
  } catch (err) {
    console.error('[CONTROLLER] Error al listar cupones activos:', err);
    res.status(500).json({ error: err.message });
  }
};

const buscarCupones = async (req, res) => {
  try {
    const { nombre } = req.query;
    console.log('[CONTROLLER] GET /cupones/buscar - Buscando cupones con nombre:', nombre);
    const cupones = await cuponRepo.buscarCuponesPorNombre(nombre);
    console.log('[CONTROLLER] Cupones encontrados en búsqueda:', cupones.length);
    res.json(cupones);
  } catch (err) {
    console.error('[CONTROLLER] Error al buscar cupones:', err);
    res.status(500).json({ error: err.message });
  }
};

// Nuevas funcionalidades
const generarCuponesMasivos = async (req, res) => {
  try {
    const { cantidad, ...cuponData } = req.body;
    console.log('[CONTROLLER] POST /cupones/generar-masivos - Generando', cantidad, 'cupones');
    
    if (!cantidad || cantidad < 1 || cantidad > 100) {
      return res.status(400).json({ error: 'Cantidad debe estar entre 1 y 100' });
    }
    
    const cupones = await cuponRepo.generarCuponesMasivos(cuponData, cantidad);
    console.log('[CONTROLLER] Cupones masivos generados:', cupones.length);
    res.status(201).json({ cupones, cantidad: cupones.length });
  } catch (err) {
    console.error('[CONTROLLER] Error al generar cupones masivos:', err);
    res.status(400).json({ error: err.message });
  }
};

const asociarUsuario = async (req, res) => {
  try {
    const { cuponId } = req.params;
    const { usuarioId } = req.body;
    console.log('[CONTROLLER] POST /cupones/:id/asociar-usuario - Asociando usuario:', usuarioId);
    
    const cupon = await cuponRepo.asociarUsuario(cuponId, usuarioId);
    console.log('[CONTROLLER] Usuario asociado al cupón:', cupon._id);
    res.json(cupon);
  } catch (err) {
    console.error('[CONTROLLER] Error al asociar usuario:', err);
    res.status(400).json({ error: err.message });
  }
};

const desasociarUsuario = async (req, res) => {
  try {
    const { cuponId, usuarioId } = req.params;
    console.log('[CONTROLLER] DELETE /cupones/:cuponId/asociar-usuario/:usuarioId - Desasociando usuario');
    
    const cupon = await cuponRepo.desasociarUsuario(cuponId, usuarioId);
    console.log('[CONTROLLER] Usuario desasociado del cupón:', cupon._id);
    res.json(cupon);
  } catch (err) {
    console.error('[CONTROLLER] Error al desasociar usuario:', err);
    res.status(400).json({ error: err.message });
  }
};

const asociarComercio = async (req, res) => {
  try {
    const { cuponId } = req.params;
    const { comercioId } = req.body;
    console.log('[CONTROLLER] POST /cupones/:id/asociar-comercio - Asociando comercio:', comercioId);
    
    const cupon = await cuponRepo.asociarComercio(cuponId, comercioId);
    console.log('[CONTROLLER] Comercio asociado al cupón:', cupon._id);
    res.json(cupon);
  } catch (err) {
    console.error('[CONTROLLER] Error al asociar comercio:', err);
    res.status(400).json({ error: err.message });
  }
};

const desasociarComercio = async (req, res) => {
  try {
    const { cuponId, comercioId } = req.params;
    console.log('[CONTROLLER] DELETE /cupones/:cuponId/asociar-comercio/:comercioId - Desasociando comercio');
    
    const cupon = await cuponRepo.desasociarComercio(cuponId, comercioId);
    console.log('[CONTROLLER] Comercio desasociado del cupón:', cupon._id);
    res.json(cupon);
  } catch (err) {
    console.error('[CONTROLLER] Error al desasociar comercio:', err);
    res.status(400).json({ error: err.message });
  }
};

const canjearCupon = async (req, res) => {
  try {
    const { cuponId } = req.params;
    const { usuarioId, comercioId, tokensGastados } = req.body;
    console.log('[CONTROLLER] POST /cupones/:id/canjear - Canjeando cupón');
    
    const resultado = await cuponRepo.canjearCupon(cuponId, usuarioId, comercioId, tokensGastados);
    console.log('[CONTROLLER] Cupón canjeado exitosamente');
    res.json(resultado);
  } catch (err) {
    console.error('[CONTROLLER] Error al canjear cupón:', err);
    res.status(400).json({ error: err.message });
  }
};

const listarCanjes = async (req, res) => {
  try {
    const filtros = req.query;
    console.log('[CONTROLLER] GET /cupones/canjes - Listando canjes con filtros:', filtros);
    
    const canjes = await cuponRepo.listarCanjes(filtros);
    console.log('[CONTROLLER] Canjes encontrados:', canjes.length);
    res.json(canjes);
  } catch (err) {
    console.error('[CONTROLLER] Error al listar canjes:', err);
    res.status(500).json({ error: err.message });
  }
};

const aprobarCanje = async (req, res) => {
  try {
    const { canjeId } = req.params;
    const { observaciones } = req.body;
    const aprobadoPor = req.user._id; // Del middleware de autenticación
    
    console.log('[CONTROLLER] PUT /cupones/canjes/:id/aprobar - Aprobando canje:', canjeId);
    
    const canje = await cuponRepo.aprobarCanje(canjeId, aprobadoPor, observaciones);
    console.log('[CONTROLLER] Canje aprobado:', canje._id);
    res.json(canje);
  } catch (err) {
    console.error('[CONTROLLER] Error al aprobar canje:', err);
    res.status(400).json({ error: err.message });
  }
};

const rechazarCanje = async (req, res) => {
  try {
    const { canjeId } = req.params;
    const { observaciones } = req.body;
    const aprobadoPor = req.user._id; // Del middleware de autenticación
    
    console.log('[CONTROLLER] PUT /cupones/canjes/:id/rechazar - Rechazando canje:', canjeId);
    
    const canje = await cuponRepo.rechazarCanje(canjeId, aprobadoPor, observaciones);
    console.log('[CONTROLLER] Canje rechazado:', canje._id);
    res.json(canje);
  } catch (err) {
    console.error('[CONTROLLER] Error al rechazar canje:', err);
    res.status(400).json({ error: err.message });
  }
};

const obtenerEstadisticas = async (req, res) => {
  try {
    console.log('[CONTROLLER] GET /cupones/estadisticas - Obteniendo estadísticas');
    
    const estadisticas = await cuponRepo.obtenerEstadisticasCupones();
    console.log('[CONTROLLER] Estadísticas obtenidas');
    res.json(estadisticas);
  } catch (err) {
    console.error('[CONTROLLER] Error al obtener estadísticas:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { 
  crearCupon, 
  listarCupones, 
  obtenerCuponPorId,
  actualizarCupon, 
  eliminarCupon,
  activarCupon,
  desactivarCupon,
  listarCuponesActivos,
  buscarCupones,
  generarCuponesMasivos,
  asociarUsuario,
  desasociarUsuario,
  asociarComercio,
  desasociarComercio,
  canjearCupon,
  listarCanjes,
  aprobarCanje,
  rechazarCanje,
  obtenerEstadisticas
}; 
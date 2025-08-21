const premioService = require('../services/premio.service');

// Obtener todos los premios (solo para administradores)
const obtenerTodosLosPremios = async (req, res) => {
  try {
    const premios = await premioService.listarPremios();
    res.json({
      ok: true,
      premios
    });
  } catch (error) {
    console.error('Error al obtener premios:', error);
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener premios activos para el catálogo público
const obtenerPremiosActivos = async (req, res) => {
  try {
    const premios = await premioService.listarPremiosActivos();
    res.json({
      ok: true,
      premios
    });
  } catch (error) {
    console.error('Error al obtener premios activos:', error);
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener premios por categoría
const obtenerPremiosPorCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;
    const premios = await premioService.listarPremiosPorCategoria(categoria);
    res.json({
      ok: true,
      premios
    });
  } catch (error) {
    console.error('Error al obtener premios por categoría:', error);
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener premios destacados
const obtenerPremiosDestacados = async (req, res) => {
  try {
    const premios = await premioService.listarPremiosDestacados();
    res.json({
      ok: true,
      premios
    });
  } catch (error) {
    console.error('Error al obtener premios destacados:', error);
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
};

// Buscar premios
const buscarPremios = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({
        ok: false,
        message: 'Término de búsqueda requerido'
      });
    }
    
    const premios = await premioService.buscarPremios(q.trim());
    res.json({
      ok: true,
      premios
    });
  } catch (error) {
    console.error('Error al buscar premios:', error);
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener premio por ID
const obtenerPremioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const premio = await premioService.obtenerPremioPorId(id);
    
    if (!premio) {
      return res.status(404).json({
        ok: false,
        message: 'Premio no encontrado'
      });
    }
    
    res.json({
      ok: true,
      premio
    });
  } catch (error) {
    console.error('Error al obtener premio:', error);
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nuevo premio (solo para administradores)
const crearPremio = async (req, res) => {
  try {
    const premioData = req.body;
    const nuevoPremio = await premioService.crearPremio(premioData);
    
    res.status(201).json({
      ok: true,
      premio: nuevoPremio
    });
  } catch (error) {
    console.error('Error al crear premio:', error);
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar premio (solo para administradores)
const actualizarPremio = async (req, res) => {
  try {
    const { id } = req.params;
    const premioData = req.body;
    
    const premioActualizado = await premioService.actualizarPremio(id, premioData);
    
    if (!premioActualizado) {
      return res.status(404).json({
        ok: false,
        message: 'Premio no encontrado'
      });
    }
    
    res.json({
      ok: true,
      premio: premioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar premio:', error);
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar premio (solo para administradores)
const eliminarPremio = async (req, res) => {
  try {
    const { id } = req.params;
    const premioEliminado = await premioService.eliminarPremio(id);
    
    if (!premioEliminado) {
      return res.status(404).json({
        ok: false,
        message: 'Premio no encontrado'
      });
    }
    
    res.json({
      ok: true,
      message: 'Premio eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar premio:', error);
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  obtenerTodosLosPremios,
  obtenerPremiosActivos,
  obtenerPremiosPorCategoria,
  obtenerPremiosDestacados,
  buscarPremios,
  obtenerPremioPorId,
  crearPremio,
  actualizarPremio,
  eliminarPremio
};


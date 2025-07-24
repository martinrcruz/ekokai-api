const Articulo = require('../models/articulo.model');

// Listar artículos con paginación y filtros
const listarArticulos = async (req, res) => {
  try {
    const { page = 1, limit = 100, search = '', grupo = '', familia = '' } = req.query;
    
    // Construir filtros
    const filtros = { eliminado: false };
    
    if (search) {
      filtros.$or = [
        { descripcionArticulo: { $regex: search, $options: 'i' } },
        { codigo: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (grupo) {
      filtros.grupo = { $regex: grupo, $options: 'i' };
    }
    
    if (familia) {
      filtros.familia = { $regex: familia, $options: 'i' };
    }

    // Calcular paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Ejecutar consulta
    const [articulos, total] = await Promise.all([
      Articulo.find(filtros)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Articulo.countDocuments(filtros)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      ok: true,
      articulos,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error al listar artículos:', error);
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear artículo
const crearArticulo = async (req, res) => {
  try {
    const { cantidad, codigo, grupo, familia, descripcionArticulo, precioVenta } = req.body;

    // Validar campos requeridos
    if (!codigo || !descripcionArticulo || !precioVenta) {
      return res.status(400).json({
        ok: false,
        message: 'Código, descripción y precio son obligatorios'
      });
    }

    // Verificar si el código ya existe
    const articuloExistente = await Articulo.findOne({ codigo, eliminado: false });
    if (articuloExistente) {
      return res.status(400).json({
        ok: false,
        message: 'Ya existe un artículo con ese código'
      });
    }

    const articulo = new Articulo({
      cantidad: cantidad || 0,
      codigo,
      grupo: grupo || 'General',
      familia: familia || 'General',
      descripcionArticulo,
      precioVenta
    });

    await articulo.save();

    res.status(201).json({
      ok: true,
      articulo
    });
  } catch (error) {
    console.error('Error al crear artículo:', error);
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener artículo por ID
const obtenerArticulo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const articulo = await Articulo.findOne({ _id: id, eliminado: false });
    
    if (!articulo) {
      return res.status(404).json({
        ok: false,
        message: 'Artículo no encontrado'
      });
    }

    res.json({
      ok: true,
      articulo
    });
  } catch (error) {
    console.error('Error al obtener artículo:', error);
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar artículo
const actualizarArticulo = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad, codigo, grupo, familia, descripcionArticulo, precioVenta } = req.body;

    // Validar campos requeridos
    if (!descripcionArticulo || !precioVenta) {
      return res.status(400).json({
        ok: false,
        message: 'Descripción y precio son obligatorios'
      });
    }

    // Verificar si el artículo existe
    const articulo = await Articulo.findOne({ _id: id, eliminado: false });
    if (!articulo) {
      return res.status(404).json({
        ok: false,
        message: 'Artículo no encontrado'
      });
    }

    // Si se está cambiando el código, verificar que no exista
    if (codigo && codigo !== articulo.codigo) {
      const articuloExistente = await Articulo.findOne({ codigo, eliminado: false });
      if (articuloExistente) {
        return res.status(400).json({
          ok: false,
          message: 'Ya existe un artículo con ese código'
        });
      }
    }

    // Actualizar artículo
    const articuloActualizado = await Articulo.findByIdAndUpdate(
      id,
      {
        cantidad: cantidad !== undefined ? cantidad : articulo.cantidad,
        codigo: codigo || articulo.codigo,
        grupo: grupo || articulo.grupo,
        familia: familia || articulo.familia,
        descripcionArticulo,
        precioVenta
      },
      { new: true }
    );

    res.json({
      ok: true,
      articulo: articuloActualizado
    });
  } catch (error) {
    console.error('Error al actualizar artículo:', error);
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar artículo (soft delete)
const eliminarArticulo = async (req, res) => {
  try {
    const { id } = req.params;

    const articulo = await Articulo.findOne({ _id: id, eliminado: false });
    if (!articulo) {
      return res.status(404).json({
        ok: false,
        message: 'Artículo no encontrado'
      });
    }

    // Soft delete
    await Articulo.findByIdAndUpdate(id, { eliminado: true });

    res.json({
      ok: true,
      message: 'Artículo eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar artículo:', error);
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  listarArticulos,
  crearArticulo,
  obtenerArticulo,
  actualizarArticulo,
  eliminarArticulo
}; 
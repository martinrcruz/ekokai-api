const tipoService = require('../services/tiporesiduo.service');

const crear = async (req, res) => {
  try {
    console.log('🎯 [CONTROLLER] → POST /tipos-residuo');
    console.log('📋 [CONTROLLER] Datos de creación:', req.body);
    
    // Validar datos requeridos
    const { nombre, descripcion, tokensPorKg, categoria, unidad, activo } = req.body;
    if (!nombre || !descripcion || tokensPorKg === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: nombre, descripcion, tokensPorKg'
      });
    }
    
    // Normalizar unidad si viene en abreviatura
    const unidadNormalizada = (unidad || '').toLowerCase();
    const unidadMap = { kg: 'kilos', kilos: 'kilos', g: 'gramos', gramos: 'gramos', l: 'litros', lt: 'litros', litros: 'litros' };
    const unidadFinal = unidadMap[unidadNormalizada] || unidad;

    const nuevoTipo = await tipoService.crearTipoResiduo({
      nombre,
      descripcion,
      tokensPorKg,
      categoria,
      unidad: unidadFinal,
      activo
    });
    console.log('✅ [CONTROLLER] Tipo de residuo creado exitosamente:', nuevoTipo._id);
    
    res.status(201).json({
      success: true,
      message: 'Tipo de residuo creado exitosamente',
      data: nuevoTipo
    });
  } catch (error) {
    console.error('❌ [CONTROLLER] Error al crear tipo de residuo:', error.message);
    res.status(400).json({ 
      success: false,
      message: 'Error al crear tipo de residuo',
      error: error.message 
    });
  }
};

const listar = async (req, res) => {
  try {
    console.log('🎯 [CONTROLLER] → GET /tipos-residuo');
    const tipos = await tipoService.obtenerTodos();
    console.log('✅ [CONTROLLER] Tipos de residuo obtenidos:', tipos.length);
    
    res.status(200).json({
      success: true,
      message: 'Tipos de residuo obtenidos exitosamente',
      data: tipos
    });
  } catch (error) {
    console.error('❌ [CONTROLLER] Error al listar tipos de residuo:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al listar tipos de residuo',
      error: error.message 
    });
  }
};

const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ [CONTROLLER] → DELETE /tipos-residuo/' + id);
    console.log('📋 [CONTROLLER] Datos de eliminación:', { id });
    
    // Validar que el ID sea válido
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ 
        success: false,
        message: 'ID de tipo de residuo inválido' 
      });
    }
    
    // Verificar que el tipo de residuo existe antes de eliminar
    const tipoExistente = await tipoService.obtenerPorId(id);
    console.log('🔍 [CONTROLLER] Tipo existente encontrado:', tipoExistente ? 'Sí' : 'No');
    
    if (!tipoExistente) {
      console.log('❌ [CONTROLLER] Tipo de residuo no encontrado con ID:', id);
      return res.status(404).json({ 
        success: false,
        message: 'Tipo de residuo no encontrado',
        data: { id }
      });
    }
    
    // Verificar si el tipo de residuo está siendo usado en entregas
    // TODO: Implementar verificación de dependencias si es necesario
    
    await tipoService.eliminarTipoResiduo(id);
    console.log('✅ [CONTROLLER] Tipo de residuo eliminado exitosamente:', id);
    
    res.status(200).json({ 
      success: true,
      message: 'Tipo de residuo eliminado exitosamente',
      data: { id, nombre: tipoExistente.nombre }
    });
  } catch (error) {
    console.error('❌ [CONTROLLER] Error al eliminar tipo de residuo:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar tipo de residuo',
      error: error.message 
    });
  }
};

const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('✏️ [CONTROLLER] → PUT /tipos-residuo/' + id);
    console.log('📋 [CONTROLLER] Datos de actualización:', req.body);
    
    // Validar que el ID sea válido
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ 
        success: false,
        message: 'ID de tipo de residuo inválido' 
      });
    }
    
    // Verificar que el tipo de residuo existe antes de actualizar
    const tipoExistente = await tipoService.obtenerPorId(id);
    console.log('🔍 [CONTROLLER] Tipo existente encontrado:', tipoExistente ? 'Sí' : 'No');
    
    if (!tipoExistente) {
      console.log('❌ [CONTROLLER] Tipo de residuo no encontrado con ID:', id);
      return res.status(404).json({ 
        success: false,
        message: 'Tipo de residuo no encontrado',
        data: { id }
      });
    }
    
    // Validar datos requeridos
    const { nombre, descripcion, tokensPorKg, categoria, unidad, activo } = req.body;
    
    // Validar que tokensPorKg sea un número positivo si viene en el payload
    if (tokensPorKg !== undefined && (isNaN(tokensPorKg) || Number(tokensPorKg) < 0)) {
      return res.status(400).json({ success: false, message: 'tokensPorKg debe ser un número positivo' });
    }

    // Normalizar unidad si viene en abreviatura
    let unidadActualizada = unidad;
    if (unidadActualizada !== undefined) {
      const unidadNorm = String(unidadActualizada).toLowerCase();
      const unidadMapUpd = { kg: 'kilos', kilos: 'kilos', g: 'gramos', gramos: 'gramos', l: 'litros', lt: 'litros', litros: 'litros' };
      unidadActualizada = unidadMapUpd[unidadNorm] || unidadActualizada;
      const allowed = ['kilos', 'gramos', 'litros'];
      if (!allowed.includes(unidadActualizada)) {
        return res.status(400).json({ success: false, message: 'unidad inválida. Use: kilos, gramos o litros' });
      }
    }
    
    const actualizado = await tipoService.actualizarTipoResiduo(id, {
      ...(nombre !== undefined && { nombre }),
      ...(descripcion !== undefined && { descripcion }),
      ...(tokensPorKg !== undefined && { tokensPorKg }),
      ...(categoria !== undefined && { categoria }),
      ...(unidadActualizada !== undefined && { unidad: unidadActualizada }),
      ...(activo !== undefined && { activo })
    });
    console.log('✅ [CONTROLLER] Tipo de residuo actualizado exitosamente:', id);
    
    res.status(200).json({
      success: true,
      message: 'Tipo de residuo actualizado exitosamente',
      data: actualizado
    });
  } catch (error) {
    console.error('❌ [CONTROLLER] Error al actualizar tipo de residuo:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error al actualizar tipo de residuo',
      error: error.message 
    });
  }
};

module.exports = {
  crear,
  listar,
  eliminar,
  actualizar
};

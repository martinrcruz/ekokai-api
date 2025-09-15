const Usuario = require('../models/usuario.model');
const EntregaResiduo = require('../models/entregaresiduo.model');


const crearUsuario = async (datos) => {
  console.log('🛠️ [REPOSITORY] Guardando nuevo usuario con:', datos);
  return await Usuario.create(datos);
};

const buscarUsuario = async ({ email, dni }) => {
  console.log('🔎 [REPOSITORY] Buscando usuario con email o dni:', email, dni);
  const { Op } = require('sequelize');
  return await Usuario.findOne({
    where: {
      [Op.or]: [{ email }, { dni }]
    }
  });
};



const buscarPorCorreo = async (email) => {
  return await Usuario.findOne({ where: { email } });
};

const buscarPorId = async (id) => {
  try {
    console.log('🔍 [REPOSITORY] Buscando usuario por ID:', id);
    
    // Obtener usuario básico
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      console.log('❌ [REPOSITORY] Usuario no encontrado:', id);
      return null;
    }
    
    // Calcular kilos totales del usuario
    const totalKilos = await EntregaResiduo.sum('pesoKg', {
      where: { usuarioId: id }
    });
    
    const usuarioObj = usuario.toJSON();
    usuarioObj.kilosTotal = totalKilos || 0;
    
    console.log(`✅ [REPOSITORY] Usuario encontrado: ${usuario.nombre} ${usuario.apellido} con ${usuarioObj.kilosTotal} kg y ${usuarioObj.tokensAcumulados || 0} tokens`);
    
    return usuarioObj;
    
  } catch (error) {
    console.error('❌ [REPOSITORY] Error en buscarPorId:', error.message);
    throw error;
  }
};

const listarUsuarios = async (filtro = {}) => {
  try {
    console.log('🔄 [REPOSITORY] Obteniendo usuarios...');
    
    // Obtener usuarios básicos con Sequelize
    const whereClause = filtro;
    const usuarios = await Usuario.findAll({ 
      where: whereClause,
      order: [['fechaCreacion', 'DESC']]
    });
    
    // Calcular kilos totales para cada usuario
    const usuariosConKilos = await Promise.all(usuarios.map(async (usuario) => {
      const totalKilos = await EntregaResiduo.sum('pesoKg', {
        where: { usuarioId: usuario.id }
      });
      
      const usuarioObj = usuario.toJSON();
      usuarioObj.kilosTotal = totalKilos || 0;
      
      console.log(`✅ [REPOSITORY] Usuario ${usuario.nombre} ${usuario.apellido}: ${usuarioObj.kilosTotal} kg, ${usuarioObj.tokensAcumulados || 0} tokens`);
      
      return usuarioObj;
    }));
    
    console.log(`✅ [REPOSITORY] Usuarios obtenidos: ${usuariosConKilos.length}`);
    return usuariosConKilos;
    
  } catch (error) {
    console.error('❌ [REPOSITORY] Error en listarUsuarios:', error.message);
    throw error;
  }
};

const buscarPorTelefono = async (telefono) => {
  return await Usuario.findOne({ where: { telefono } });
};


// NUEVO: actualizar tokens acumulados
const incrementarTokens = async (usuarioId, tokens) => {
    console.log(`🔁 [REPO] Sumando ${tokens} tokens al usuario ${usuarioId}`);
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) return null;
    
    const nuevosTokens = (usuario.tokensAcumulados || 0) + tokens;
    await usuario.update({ tokensAcumulados: nuevosTokens });
    return usuario;
  };

const actualizarUsuario = async (id, datos) => {
  console.log('✏️ [REPOSITORY] Actualizando usuario', id, 'con:', datos);
  const usuario = await Usuario.findByPk(id);
  if (!usuario) return null;
  
  await usuario.update(datos);
  return usuario;
};

const eliminarUsuario = async (id) => {
  console.log('🗑️ [REPOSITORY] Eliminando usuario', id);
  const usuario = await Usuario.findByPk(id);
  if (!usuario) return null;
  
  await usuario.destroy();
  return usuario;
};

// ✅ Buscar usuarios por criterios específicos
const buscarUsuariosPorCriterios = async (query) => {
  console.log('🔍 [REPOSITORY] Buscando usuarios con query:', query);
  try {
    // Obtener usuarios básicos con Sequelize
    const usuarios = await Usuario.findAll({ 
      where: query,
      order: [['fechaCreacion', 'DESC']]
    });
    
    // Calcular kilos totales para cada usuario
    const usuariosConKilos = await Promise.all(usuarios.map(async (usuario) => {
      const totalKilos = await EntregaResiduo.sum('pesoKg', {
        where: { usuarioId: usuario.id }
      });
      
      const usuarioObj = usuario.toJSON();
      usuarioObj.kilosTotal = totalKilos || 0;
      return usuarioObj;
    }));
    
    console.log(`✅ [REPOSITORY] Usuarios encontrados: ${usuariosConKilos.length}`);
    return usuariosConKilos;
    
  } catch (error) {
    console.error('❌ [REPOSITORY] Error en buscarUsuariosPorCriterios:', error.message);
    throw error;
  }
};

module.exports = {
  crearUsuario,
  buscarUsuario,
  buscarPorCorreo,
  buscarPorId,
  listarUsuarios,
  incrementarTokens,
  buscarPorTelefono,
  actualizarUsuario,
  eliminarUsuario,
  buscarUsuariosPorCriterios
};
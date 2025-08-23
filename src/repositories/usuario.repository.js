const Usuario = require('../models/usuario.model');
const EntregaResiduo = require('../models/entregaresiduo.model');


const crearUsuario = async (datos) => {
  console.log('🛠️ [REPOSITORY] Guardando nuevo usuario con:', datos);
  return await Usuario.create(datos);
};

const buscarUsuario = async ({ email, dni }) => {
  console.log('🔎 [REPOSITORY] Buscando usuario con email o dni:', email, dni);
  return await Usuario.findOne({
    $or: [{ email }, { dni }]
  });
};



const buscarPorCorreo = async (email) => {
  return await Usuario.findOne({ email });
};

const buscarPorId = async (id) => {
  try {
    console.log('🔍 [REPOSITORY] Buscando usuario por ID:', id);
    
    // Obtener usuario básico
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      console.log('❌ [REPOSITORY] Usuario no encontrado:', id);
      return null;
    }
    
    // Calcular kilos totales del usuario
    const resultado = await EntregaResiduo.aggregate([
      {
        $match: {
          usuario: usuario._id,
          estado: 'completado' // Solo entregas completadas
        }
      },
      {
        $group: {
          _id: null,
          kilosTotal: { $sum: '$pesoKg' }
        }
      }
    ]);
    
    const kilosTotal = resultado[0]?.kilosTotal || 0;
    
    // Convertir a objeto plano y agregar kilosTotal
    const usuarioObj = usuario.toObject();
    usuarioObj.kilosTotal = kilosTotal;
    
    console.log(`✅ [REPOSITORY] Usuario encontrado: ${usuario.nombre} ${usuario.apellido} con ${kilosTotal} kg y ${usuarioObj.tokensAcumulados || 0} tokens`);
    
    return usuarioObj;
    
  } catch (error) {
    console.error('❌ [REPOSITORY] Error en buscarPorId:', error.message);
    throw error;
  }
};

const listarUsuarios = async (filtro = {}) => {
  try {
    console.log('🔄 [REPOSITORY] Obteniendo usuarios con kilos totales...');
    
    // Obtener usuarios básicos
    const usuarios = await Usuario.find(filtro).sort({ fechaCreacion: -1 });
    
    // Calcular kilos totales para cada usuario
    const usuariosConKilos = await Promise.all(
      usuarios.map(async (usuario) => {
        try {
          // Calcular kilos totales del usuario
          const resultado = await EntregaResiduo.aggregate([
            {
              $match: {
                usuario: usuario._id,
                estado: 'completado' // Solo entregas completadas
              }
            },
            {
              $group: {
                _id: null,
                kilosTotal: { $sum: '$pesoKg' }
              }
            }
          ]);
          
          const kilosTotal = resultado[0]?.kilosTotal || 0;
          
          // Convertir a objeto plano y agregar kilosTotal
          const usuarioObj = usuario.toObject();
          usuarioObj.kilosTotal = kilosTotal;
          
          console.log(`✅ [REPOSITORY] Usuario ${usuario.nombre} ${usuario.apellido}: ${kilosTotal} kg, ${usuarioObj.tokensAcumulados || 0} tokens`);
          
          return usuarioObj;
        } catch (error) {
          console.error(`❌ [REPOSITORY] Error calculando kilos para usuario ${usuario._id}:`, error.message);
          // En caso de error, retornar usuario sin kilos
          const usuarioObj = usuario.toObject();
          usuarioObj.kilosTotal = 0;
          return usuarioObj;
        }
      })
    );
    
    console.log(`✅ [REPOSITORY] Usuarios obtenidos con kilos totales: ${usuariosConKilos.length}`);
    return usuariosConKilos;
    
  } catch (error) {
    console.error('❌ [REPOSITORY] Error en listarUsuarios:', error.message);
    throw error;
  }
};

const buscarPorTelefono = async (telefono) => {
  return await Usuario.findOne({ telefono });
};


// NUEVO: actualizar tokens acumulados
const incrementarTokens = async (usuarioId, tokens) => {
    console.log(`🔁 [REPO] Sumando ${tokens} tokens al usuario ${usuarioId}`);
    return await Usuario.findByIdAndUpdate(
      usuarioId,
      { $inc: { tokensAcumulados: tokens } },
      { new: true }
    );
  };

const actualizarUsuario = async (id, datos) => {
  console.log('✏️ [REPOSITORY] Actualizando usuario', id, 'con:', datos);
  return await Usuario.findByIdAndUpdate(id, datos, { new: true });
};

const eliminarUsuario = async (id) => {
  console.log('🗑️ [REPOSITORY] Eliminando usuario', id);
  return await Usuario.findByIdAndDelete(id);
};

// ✅ Buscar usuarios por criterios específicos
const buscarUsuariosPorCriterios = async (query) => {
  console.log('🔍 [REPOSITORY] Buscando usuarios con query:', query);
  try {
    // Obtener usuarios básicos
    const usuarios = await Usuario.find(query).sort({ fechaCreacion: -1 });
    
    // Calcular kilos totales para cada usuario
    const usuariosConKilos = await Promise.all(
      usuarios.map(async (usuario) => {
        try {
          // Calcular kilos totales del usuario
          const resultado = await EntregaResiduo.aggregate([
            {
              $match: {
                usuario: usuario._id,
                estado: 'completado' // Solo entregas completadas
              }
            },
            {
              $group: {
                _id: null,
                kilosTotal: { $sum: '$pesoKg' }
              }
            }
          ]);
          
          const kilosTotal = resultado[0]?.kilosTotal || 0;
          
          // Convertir a objeto plano y agregar kilosTotal
          const usuarioObj = usuario.toObject();
          usuarioObj.kilosTotal = kilosTotal;
          
          return usuarioObj;
        } catch (error) {
          console.error(`❌ [REPOSITORY] Error calculando kilos para usuario ${usuario._id}:`, error.message);
          // En caso de error, retornar usuario sin kilos
          const usuarioObj = usuario.toObject();
          usuarioObj.kilosTotal = 0;
          return usuarioObj;
        }
      })
    );
    
    console.log(`✅ [REPOSITORY] Usuarios encontrados con kilos totales: ${usuariosConKilos.length}`);
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
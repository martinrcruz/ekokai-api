const ecopuntoRepo = require('../repositories/ecopunto.repository');
const usuarioRepo = require('../repositories/usuario.repository');

const crearEcopunto = async ({ nombre, direccion, encargadoId }) => {
    console.log('🟡 [SERVICE] → Iniciando creación de ecopunto...');
  
    const nuevo = {
      nombre,
      direccion,
      // solo asigna si viene el encargadoId
      ...(encargadoId && { encargado: encargadoId })
    };
  
    const creado = await ecopuntoRepo.crearEcopunto(nuevo);
    console.log('✅ [SERVICE] Ecopunto creado:', creado.nombre);
    return creado;
  };

const asignarEncargado = async (ecopuntoId, encargadoId) => {
  console.log(`🟡 [SERVICE] → Enrolando encargado ${encargadoId} en ecopunto ${ecopuntoId}`);

  const usuario = await usuarioRepo.buscarPorId(encargadoId);
  if (!usuario) {
    console.warn('⚠️ [SERVICE] → Usuario no encontrado');
    throw new Error('Encargado no encontrado');
  }

  if (usuario.rol !== 'encargado') {
    console.warn('⚠️ [SERVICE] → Usuario no tiene rol de encargado');
    throw new Error('El usuario no tiene el rol de encargado');
  }

  const actualizado = await ecopuntoRepo.actualizarEncargado(ecopuntoId, encargadoId);
  console.log('✅ [SERVICE] → Encargado asignado correctamente');
  return actualizado;
};

module.exports = {
    crearEcopunto,
  asignarEncargado,
};

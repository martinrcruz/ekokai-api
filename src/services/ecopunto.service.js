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

const obtenerTotalKgPorEcopuntoId = async (ecopuntoId) => {
  return ecopuntoRepo.calcularTotalKgPorEcopuntoId(ecopuntoId);
};

const obtenerTotalKgPorNombre = async (nombre) => {
  return ecopuntoRepo.calcularTotalKgPorNombre(nombre);
};

const obtenerTotalKgMensualPorEcopuntoId = async (ecopuntoId) => {
  return ecopuntoRepo.calcularTotalKgMensualPorEcopuntoId(ecopuntoId);
};

const obtenerTotalKgMensualPorNombre = async (nombre) => {
  return ecopuntoRepo.calcularTotalKgMensualPorNombre(nombre);
};

const obtenerTotalVecinosPorEcopuntoId = async (ecopuntoId) => {
  return ecopuntoRepo.contarVecinosPorEcopuntoId(ecopuntoId);
};

const obtenerTotalVecinosPorNombre = async (nombre) => {
  return ecopuntoRepo.contarVecinosPorNombre(nombre);
};

const obtenerEntregasDetalladasPorEcopuntoId = async (ecopuntoId, opciones) => {
  return ecopuntoRepo.listarEntregasDetalladasPorEcopuntoId(ecopuntoId, opciones);
};

const obtenerEntregasDetalladasPorNombre = async (nombre, opciones) => {
  return ecopuntoRepo.listarEntregasDetalladasPorNombre(nombre, opciones);
};

// === Metas mensuales ===
const crearOEditarMetaMensual = async ({ ecopuntoId, year, month, objetivoKg }) => {
  return ecopuntoRepo.upsertMetaMensual({ ecopuntoId, year, month, objetivoKg });
};

const obtenerMetaMensual = async ({ ecopuntoId, year, month }) => {
  return ecopuntoRepo.obtenerMetaMensual({ ecopuntoId, year, month });
};

const eliminarMetaMensual = async ({ ecopuntoId, year, month }) => {
  return ecopuntoRepo.eliminarMetaMensual({ ecopuntoId, year, month });
};

module.exports = {
    crearEcopunto,
  asignarEncargado,
  obtenerTotalKgPorEcopuntoId,
  obtenerTotalKgPorNombre,
  obtenerTotalKgMensualPorEcopuntoId,
  obtenerTotalKgMensualPorNombre,
  obtenerTotalVecinosPorEcopuntoId,
  obtenerTotalVecinosPorNombre,
  obtenerEntregasDetalladasPorEcopuntoId,
  obtenerEntregasDetalladasPorNombre,
  crearOEditarMetaMensual,
  obtenerMetaMensual,
  eliminarMetaMensual
};

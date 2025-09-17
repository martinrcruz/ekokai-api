const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { QRWhatsapp } = require('../models');

class QRWhatsappService {
  constructor() {
    this.logoPath = path.join(__dirname, '../../public/logo-ekokai.png');
    this.qrOptions = {
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    };
  }

  /**
   * Genera un código QR con el logo de EKOKAI en el centro
   * @param {string} data - Datos para el código QR
   * @param {Object} options - Opciones adicionales para el QR
   * @returns {Promise<string>} - Data URL del código QR generado
   */
  async generarQRConLogo(data, options = {}) {
    try {
      const qrOptions = { ...this.qrOptions, ...options };
      
      // Generar el código QR como buffer
      const qrBuffer = await QRCode.toBuffer(data, qrOptions);
      
      // Si existe el logo, lo superponemos
      if (fs.existsSync(this.logoPath)) {
        return await this.superponerLogo(qrBuffer, this.logoPath);
      }
      
      // Si no hay logo, convertir el buffer a data URL
      return `data:image/png;base64,${qrBuffer.toString('base64')}`;
    } catch (error) {
      console.error('Error generando QR con logo:', error);
      throw new Error('Error al generar el código QR');
    }
  }

  /**
   * Superpone el logo de EKOKAI en el centro del código QR
   * @param {Buffer} qrBuffer - Buffer del código QR
   * @param {string} logoPath - Ruta del logo
   * @returns {Promise<string>} - Data URL del QR con logo
   */
  async superponerLogo(qrBuffer, logoPath) {
    try {
      // Para simplificar, por ahora retornamos el QR sin logo
      // En una implementación completa se usaría una librería como sharp o canvas
      return `data:image/png;base64,${qrBuffer.toString('base64')}`;
    } catch (error) {
      console.error('Error superponiendo logo:', error);
      return `data:image/png;base64,${qrBuffer.toString('base64')}`;
    }
  }

  /**
   * Crea un nuevo código QR de WhatsApp
   * @param {Object} qrData - Datos del código QR
   * @returns {Promise<Object>} - Código QR creado
   */
  async crearQRWhatsapp(qrData) {
    try {
      const { mensaje, fechaExpiracion, nombre, descripcion, numeroWhatsapp } = qrData;
      
      // Validar datos
      if (!mensaje || !fechaExpiracion || !nombre) {
        throw new Error('Faltan datos requeridos: mensaje, fechaExpiracion, nombre');
      }

      // Verificar que la fecha de expiración sea futura
      const fechaExp = new Date(fechaExpiracion);
      if (fechaExp <= new Date()) {
        throw new Error('La fecha de expiración debe ser futura');
      }

      // Generar enlace de WhatsApp
      const enlaceWhatsapp = this.generarEnlaceWhatsapp(mensaje, numeroWhatsapp);
      
      // Generar código QR
      const qrDataUrl = await this.generarQRConLogo(enlaceWhatsapp);

      // Crear registro en la base de datos
      const qrWhatsapp = await QRWhatsapp.create({
        mensaje,
        fechaExpiracion: fechaExp,
        nombre,
        descripcion,
        numeroWhatsapp,
        qrDataUrl,
        activo: true
      });

      return qrWhatsapp;
    } catch (error) {
      console.error('Error creando QR WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Genera el enlace de WhatsApp
   * @param {string} mensaje - Mensaje a enviar
   * @param {string} numero - Número de WhatsApp (opcional)
   * @returns {string} - Enlace de WhatsApp
   */
  generarEnlaceWhatsapp(mensaje, numero = '') {
    const mensajeCodificado = encodeURIComponent(mensaje);
    return `https://wa.me/${numero}?text=${mensajeCodificado}`;
  }

  /**
   * Obtiene todos los códigos QR activos
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {Promise<Array>} - Lista de códigos QR
   */
  async obtenerQRs(filtros = {}) {
    try {
      const where = { activo: true };
      
      if (filtros.soloActivos) {
        where.fechaExpiracion = {
          [require('sequelize').Op.gt]: new Date()
        };
      }

      const qrs = await QRWhatsapp.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: filtros.limit || 50,
        offset: filtros.offset || 0
      });

      return qrs;
    } catch (error) {
      console.error('Error obteniendo QRs:', error);
      throw error;
    }
  }

  /**
   * Obtiene un código QR por ID
   * @param {string} id - ID del código QR
   * @returns {Promise<Object>} - Código QR encontrado
   */
  async obtenerQRPorId(id) {
    try {
      const qr = await QRWhatsapp.findByPk(id);
      if (!qr) {
        throw new Error('Código QR no encontrado');
      }
      return qr;
    } catch (error) {
      console.error('Error obteniendo QR por ID:', error);
      throw error;
    }
  }

  /**
   * Actualiza un código QR
   * @param {string} id - ID del código QR
   * @param {Object} datosActualizacion - Datos a actualizar
   * @returns {Promise<Object>} - Código QR actualizado
   */
  async actualizarQR(id, datosActualizacion) {
    try {
      const qr = await QRWhatsapp.findByPk(id);
      if (!qr) {
        throw new Error('Código QR no encontrado');
      }

      // Si se actualiza el mensaje o número, regenerar el QR
      if (datosActualizacion.mensaje || datosActualizacion.numeroWhatsapp) {
        const mensaje = datosActualizacion.mensaje || qr.mensaje;
        const numero = datosActualizacion.numeroWhatsapp || qr.numeroWhatsapp;
        const enlaceWhatsapp = this.generarEnlaceWhatsapp(mensaje, numero);
        datosActualizacion.qrDataUrl = await this.generarQRConLogo(enlaceWhatsapp);
      }

      await qr.update(datosActualizacion);
      return qr;
    } catch (error) {
      console.error('Error actualizando QR:', error);
      throw error;
    }
  }

  /**
   * Desactiva un código QR
   * @param {string} id - ID del código QR
   * @returns {Promise<boolean>} - True si se desactivó correctamente
   */
  async desactivarQR(id) {
    try {
      const qr = await QRWhatsapp.findByPk(id);
      if (!qr) {
        throw new Error('Código QR no encontrado');
      }

      await qr.update({ activo: false });
      return true;
    } catch (error) {
      console.error('Error desactivando QR:', error);
      throw error;
    }
  }

  /**
   * Elimina códigos QR expirados
   * @returns {Promise<number>} - Número de códigos eliminados
   */
  async limpiarQRsExpirados() {
    try {
      const resultado = await QRWhatsapp.update(
        { activo: false },
        {
          where: {
            fechaExpiracion: {
              [require('sequelize').Op.lt]: new Date()
            },
            activo: true
          }
        }
      );

      return resultado[0];
    } catch (error) {
      console.error('Error limpiando QRs expirados:', error);
      throw error;
    }
  }
}

module.exports = new QRWhatsappService();

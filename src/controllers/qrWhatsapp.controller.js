const qrWhatsappService = require('../services/qrWhatsapp.service');

class QRWhatsappController {
  /**
   * Crea un nuevo código QR de WhatsApp
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async crearQR(req, res) {
    try {
      const { mensaje, fechaExpiracion, nombre, descripcion, numeroWhatsapp } = req.body;

      // Validaciones básicas
      if (!mensaje || !fechaExpiracion || !nombre) {
        return res.status(400).json({
          success: false,
          message: 'Faltan datos requeridos: mensaje, fechaExpiracion, nombre'
        });
      }

      // Validar longitud del mensaje
      if (mensaje.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'El mensaje no puede exceder los 1000 caracteres'
        });
      }

      // Validar longitud del nombre
      if (nombre.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'El nombre no puede exceder los 100 caracteres'
        });
      }

      const qrData = {
        mensaje,
        fechaExpiracion,
        nombre,
        descripcion,
        numeroWhatsapp
      };

      const qrCreado = await qrWhatsappService.crearQRWhatsapp(qrData);

      res.status(201).json({
        success: true,
        message: 'Código QR creado exitosamente',
        data: qrCreado
      });
    } catch (error) {
      console.error('Error en crearQR:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene todos los códigos QR
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async obtenerQRs(req, res) {
    try {
      const { soloActivos, limit, offset } = req.query;
      
      const filtros = {
        soloActivos: soloActivos === 'true',
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0
      };

      const qrs = await qrWhatsappService.obtenerQRs(filtros);

      res.status(200).json({
        success: true,
        message: 'Códigos QR obtenidos exitosamente',
        data: qrs,
        total: qrs.length
      });
    } catch (error) {
      console.error('Error en obtenerQRs:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene un código QR por ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async obtenerQRPorId(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID del código QR es requerido'
        });
      }

      const qr = await qrWhatsappService.obtenerQRPorId(id);

      res.status(200).json({
        success: true,
        message: 'Código QR obtenido exitosamente',
        data: qr
      });
    } catch (error) {
      console.error('Error en obtenerQRPorId:', error);
      const statusCode = error.message === 'Código QR no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualiza un código QR
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async actualizarQR(req, res) {
    try {
      const { id } = req.params;
      const datosActualizacion = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID del código QR es requerido'
        });
      }

      // Validar datos si se proporcionan
      if (datosActualizacion.mensaje && datosActualizacion.mensaje.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'El mensaje no puede exceder los 1000 caracteres'
        });
      }

      if (datosActualizacion.nombre && datosActualizacion.nombre.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'El nombre no puede exceder los 100 caracteres'
        });
      }

      const qrActualizado = await qrWhatsappService.actualizarQR(id, datosActualizacion);

      res.status(200).json({
        success: true,
        message: 'Código QR actualizado exitosamente',
        data: qrActualizado
      });
    } catch (error) {
      console.error('Error en actualizarQR:', error);
      const statusCode = error.message === 'Código QR no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Desactiva un código QR
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async desactivarQR(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID del código QR es requerido'
        });
      }

      await qrWhatsappService.desactivarQR(id);

      res.status(200).json({
        success: true,
        message: 'Código QR desactivado exitosamente'
      });
    } catch (error) {
      console.error('Error en desactivarQR:', error);
      const statusCode = error.message === 'Código QR no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Limpia códigos QR expirados
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async limpiarQRsExpirados(req, res) {
    try {
      const cantidadEliminados = await qrWhatsappService.limpiarQRsExpirados();

      res.status(200).json({
        success: true,
        message: `Se desactivaron ${cantidadEliminados} códigos QR expirados`,
        data: { cantidadEliminados }
      });
    } catch (error) {
      console.error('Error en limpiarQRsExpirados:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene estadísticas de códigos QR
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async obtenerEstadisticas(req, res) {
    try {
      const { QRWhatsapp } = require('../models');
      const { Op } = require('sequelize');

      const ahora = new Date();
      
      const [
        totalQRs,
        qrsActivos,
        qrsExpirados,
        qrsEsteMes
      ] = await Promise.all([
        QRWhatsapp.count(),
        QRWhatsapp.count({ where: { activo: true } }),
        QRWhatsapp.count({ 
          where: { 
            fechaExpiracion: { [Op.lt]: ahora },
            activo: true 
          } 
        }),
        QRWhatsapp.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(ahora.getFullYear(), ahora.getMonth(), 1)
            }
          }
        })
      ]);

      res.status(200).json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          totalQRs,
          qrsActivos,
          qrsExpirados,
          qrsEsteMes
        }
      });
    } catch (error) {
      console.error('Error en obtenerEstadisticas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }
}

module.exports = new QRWhatsappController();

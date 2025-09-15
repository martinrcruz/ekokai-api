'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Agregar foreign key de usuarios a ecopuntos
    await queryInterface.addConstraint('usuarios', {
      fields: ['ecopuntoId'],
      type: 'foreign key',
      name: 'usuarios_ecopuntoId_fkey',
      references: {
        table: 'ecopuntos',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Agregar foreign key de ecopuntos a usuarios (encargado)
    await queryInterface.addConstraint('ecopuntos', {
      fields: ['encargadoId'],
      type: 'foreign key',
      name: 'ecopuntos_encargadoId_fkey',
      references: {
        table: 'usuarios',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Agregar foreign keys para cupones
    await queryInterface.addConstraint('cupones', {
      fields: ['tipoResiduoGeneradorId'],
      type: 'foreign key',
      name: 'cupones_tipoResiduoGeneradorId_fkey',
      references: {
        table: 'tiporesiduos',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Agregar foreign keys para entregas
    await queryInterface.addConstraint('entregas', {
      fields: ['usuarioId'],
      type: 'foreign key',
      name: 'entregas_usuarioId_fkey',
      references: {
        table: 'usuarios',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('entregas', {
      fields: ['ecopuntoId'],
      type: 'foreign key',
      name: 'entregas_ecopuntoId_fkey',
      references: {
        table: 'ecopuntos',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('entregas', {
      fields: ['tipoResiduoId'],
      type: 'foreign key',
      name: 'entregas_tipoResiduoId_fkey',
      references: {
        table: 'tiporesiduos',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('entregas', {
      fields: ['cuponGeneradoId'],
      type: 'foreign key',
      name: 'entregas_cuponGeneradoId_fkey',
      references: {
        table: 'cupones',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('entregas', {
      fields: ['encargadoId'],
      type: 'foreign key',
      name: 'entregas_encargadoId_fkey',
      references: {
        table: 'usuarios',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Agregar foreign keys para canjes
    await queryInterface.addConstraint('canjes', {
      fields: ['cuponId'],
      type: 'foreign key',
      name: 'canjes_cuponId_fkey',
      references: {
        table: 'cupones',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('canjes', {
      fields: ['usuarioId'],
      type: 'foreign key',
      name: 'canjes_usuarioId_fkey',
      references: {
        table: 'usuarios',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('canjes', {
      fields: ['comercioId'],
      type: 'foreign key',
      name: 'canjes_comercioId_fkey',
      references: {
        table: 'usuarios',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('canjes', {
      fields: ['aprobadoPorId'],
      type: 'foreign key',
      name: 'canjes_aprobadoPorId_fkey',
      references: {
        table: 'usuarios',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Agregar foreign keys para cupon_monedas
    await queryInterface.addConstraint('cupon_monedas', {
      fields: ['usuarioId'],
      type: 'foreign key',
      name: 'cupon_monedas_usuarioId_fkey',
      references: {
        table: 'usuarios',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Agregar foreign keys para cupon_usos
    await queryInterface.addConstraint('cupon_usos', {
      fields: ['cuponId'],
      type: 'foreign key',
      name: 'cupon_usos_cuponId_fkey',
      references: {
        table: 'cupones',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('cupon_usos', {
      fields: ['usuarioId'],
      type: 'foreign key',
      name: 'cupon_usos_usuarioId_fkey',
      references: {
        table: 'usuarios',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('cupon_usos', {
      fields: ['comercioId'],
      type: 'foreign key',
      name: 'cupon_usos_comercioId_fkey',
      references: {
        table: 'usuarios',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Agregar foreign keys para cupon_historial_ganados
    await queryInterface.addConstraint('cupon_historial_ganados', {
      fields: ['cuponMonedaId'],
      type: 'foreign key',
      name: 'cupon_historial_ganados_cuponMonedaId_fkey',
      references: {
        table: 'cupon_monedas',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('cupon_historial_ganados', {
      fields: ['tipoResiduoId'],
      type: 'foreign key',
      name: 'cupon_historial_ganados_tipoResiduoId_fkey',
      references: {
        table: 'tiporesiduos',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('cupon_historial_ganados', {
      fields: ['ecopuntoId'],
      type: 'foreign key',
      name: 'cupon_historial_ganados_ecopuntoId_fkey',
      references: {
        table: 'ecopuntos',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Agregar foreign keys para cupon_historial_gastados
    await queryInterface.addConstraint('cupon_historial_gastados', {
      fields: ['cuponMonedaId'],
      type: 'foreign key',
      name: 'cupon_historial_gastados_cuponMonedaId_fkey',
      references: {
        table: 'cupon_monedas',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('cupon_historial_gastados', {
      fields: ['premioId'],
      type: 'foreign key',
      name: 'cupon_historial_gastados_premioId_fkey',
      references: {
        table: 'premios',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Agregar foreign keys para ecopunto_metas
    await queryInterface.addConstraint('ecopunto_metas', {
      fields: ['ecopuntoId'],
      type: 'foreign key',
      name: 'ecopunto_metas_ecopuntoId_fkey',
      references: {
        table: 'ecopuntos',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Agregar foreign keys para canjes_recompensa
    await queryInterface.addConstraint('canjes_recompensa', {
      fields: ['usuarioId'],
      type: 'foreign key',
      name: 'canjes_recompensa_usuarioId_fkey',
      references: {
        table: 'usuarios',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('canjes_recompensa', {
      fields: ['recompensaId'],
      type: 'foreign key',
      name: 'canjes_recompensa_recompensaId_fkey',
      references: {
        table: 'recompensas',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Agregar foreign keys para trazabilidad
    await queryInterface.addConstraint('trazabilidad', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'trazabilidad_userId_fkey',
      references: {
        table: 'usuarios',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('trazabilidad', {
      fields: ['canjeReciclajeId'],
      type: 'foreign key',
      name: 'trazabilidad_canjeReciclajeId_fkey',
      references: {
        table: 'canjes_reciclaje',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('trazabilidad', {
      fields: ['coupon_id'],
      type: 'foreign key',
      name: 'trazabilidad_coupon_id_fkey',
      references: {
        table: 'cupones',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('trazabilidad', {
      fields: ['exchange_id'],
      type: 'foreign key',
      name: 'trazabilidad_exchange_id_fkey',
      references: {
        table: 'canjes_reciclaje',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Agregar foreign keys para qr_reciclajes
    await queryInterface.addConstraint('qr_reciclajes', {
      fields: ['usuarioCreadorId'],
      type: 'foreign key',
      name: 'qr_reciclajes_usuarioCreadorId_fkey',
      references: {
        table: 'usuarios',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('qr_reciclajes', {
      fields: ['usuarioUsoId'],
      type: 'foreign key',
      name: 'qr_reciclajes_usuarioUsoId_fkey',
      references: {
        table: 'usuarios',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('qr_reciclajes', {
      fields: ['ecopuntoId'],
      type: 'foreign key',
      name: 'qr_reciclajes_ecopuntoId_fkey',
      references: {
        table: 'ecopuntos',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Agregar foreign keys para canjes_reciclaje
    await queryInterface.addConstraint('canjes_reciclaje', {
      fields: ['usuarioId'],
      type: 'foreign key',
      name: 'canjes_reciclaje_usuarioId_fkey',
      references: {
        table: 'usuarios',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('canjes_reciclaje', {
      fields: ['qrReciclajeId'],
      type: 'foreign key',
      name: 'canjes_reciclaje_qrReciclajeId_fkey',
      references: {
        table: 'qr_reciclajes',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('canjes_reciclaje', {
      fields: ['cuponGeneradoId'],
      type: 'foreign key',
      name: 'canjes_reciclaje_cuponGeneradoId_fkey',
      references: {
        table: 'cupones',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    // Eliminar todas las foreign keys en orden inverso
    const constraints = [
      'canjes_reciclaje_cuponGeneradoId_fkey',
      'canjes_reciclaje_qrReciclajeId_fkey',
      'canjes_reciclaje_usuarioId_fkey',
      'qr_reciclajes_ecopuntoId_fkey',
      'qr_reciclajes_usuarioUsoId_fkey',
      'qr_reciclajes_usuarioCreadorId_fkey',
      'trazabilidad_exchange_id_fkey',
      'trazabilidad_coupon_id_fkey',
      'trazabilidad_canjeReciclajeId_fkey',
      'trazabilidad_userId_fkey',
      'canjes_recompensa_recompensaId_fkey',
      'canjes_recompensa_usuarioId_fkey',
      'ecopunto_metas_ecopuntoId_fkey',
      'cupon_historial_gastados_premioId_fkey',
      'cupon_historial_gastados_cuponMonedaId_fkey',
      'cupon_historial_ganados_ecopuntoId_fkey',
      'cupon_historial_ganados_tipoResiduoId_fkey',
      'cupon_historial_ganados_cuponMonedaId_fkey',
      'cupon_usos_comercioId_fkey',
      'cupon_usos_usuarioId_fkey',
      'cupon_usos_cuponId_fkey',
      'cupon_monedas_usuarioId_fkey',
      'canjes_aprobadoPorId_fkey',
      'canjes_comercioId_fkey',
      'canjes_usuarioId_fkey',
      'canjes_cuponId_fkey',
      'entregas_encargadoId_fkey',
      'entregas_cuponGeneradoId_fkey',
      'entregas_tipoResiduoId_fkey',
      'entregas_ecopuntoId_fkey',
      'entregas_usuarioId_fkey',
      'cupones_tipoResiduoGeneradorId_fkey',
      'ecopuntos_encargadoId_fkey',
      'usuarios_ecopuntoId_fkey'
    ];

    for (const constraint of constraints) {
      try {
        await queryInterface.removeConstraint('usuarios', constraint);
      } catch (error) {
        // Intentar con otras tablas si falla
        try {
          await queryInterface.removeConstraint('ecopuntos', constraint);
        } catch (error2) {
          try {
            await queryInterface.removeConstraint('cupones', constraint);
          } catch (error3) {
            try {
              await queryInterface.removeConstraint('entregas', constraint);
            } catch (error4) {
              try {
                await queryInterface.removeConstraint('canjes', constraint);
              } catch (error5) {
                try {
                  await queryInterface.removeConstraint('cupon_monedas', constraint);
                } catch (error6) {
                  try {
                    await queryInterface.removeConstraint('cupon_usos', constraint);
                  } catch (error7) {
                    try {
                      await queryInterface.removeConstraint('cupon_historial_ganados', constraint);
                    } catch (error8) {
                      try {
                        await queryInterface.removeConstraint('cupon_historial_gastados', constraint);
                      } catch (error9) {
                        try {
                          await queryInterface.removeConstraint('ecopunto_metas', constraint);
                        } catch (error10) {
                          try {
                            await queryInterface.removeConstraint('canjes_recompensa', constraint);
                          } catch (error11) {
                            try {
                              await queryInterface.removeConstraint('trazabilidad', constraint);
                            } catch (error12) {
                              try {
                                await queryInterface.removeConstraint('qr_reciclajes', constraint);
                              } catch (error13) {
                                try {
                                  await queryInterface.removeConstraint('canjes_reciclaje', constraint);
                                } catch (error14) {
                                  // Ignorar si no se encuentra
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

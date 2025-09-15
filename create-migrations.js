const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const migrations = [
  {
    name: 'create-premios-table',
    content: `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('premios', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      imagen: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cuponesRequeridos: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      categoria: {
        type: Sequelize.STRING,
        allowNull: false
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      destacado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      orden: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('premios');
  }
};`
  },
  {
    name: 'create-recompensas-table',
    content: `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('recompensas', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      codigo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      nombre: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cuponesRequeridos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      establecimiento: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      direccion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      fechaInicio: {
        type: Sequelize.DATE,
        allowNull: true
      },
      fechaExpiracion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      stockDisponible: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      categoria: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      imagenUrl: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      terminos: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      fechaCreacion: {
        type: Sequelize.DATE,
        allowNull: false
      },
      fechaActualizacion: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('recompensas');
  }
};`
  },
  {
    name: 'create-ecopuntos-table',
    content: `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ecopuntos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      direccion: {
        type: Sequelize.STRING,
        allowNull: false
      },
      zona: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        defaultValue: ''
      },
      horarioApertura: {
        type: Sequelize.STRING,
        defaultValue: '08:00'
      },
      horarioCierre: {
        type: Sequelize.STRING,
        defaultValue: '20:00'
      },
      capacidadMaxima: {
        type: Sequelize.INTEGER,
        defaultValue: 1000
      },
      encargadoId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      fechaCreacion: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('ecopuntos');
  }
};`
  },
  {
    name: 'create-usuarios-table',
    content: `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      rol: {
        type: Sequelize.ENUM('vecino', 'encargado', 'administrador'),
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: true
      },
      apellido: {
        type: Sequelize.STRING,
        allowNull: true
      },
      dni: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fechaNacimiento: {
        type: Sequelize.DATE,
        allowNull: true
      },
      telefono: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pais: {
        type: Sequelize.STRING,
        allowNull: true
      },
      zona: {
        type: Sequelize.STRING,
        allowNull: true
      },
      direccion: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tokensAcumulados: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      ecopuntoId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      requiereCambioPassword: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      fechaCreacion: {
        type: Sequelize.DATE,
        allowNull: false
      },
      ultimaModificacion: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('usuarios');
  }
};`
  }
];

// Crear migraciones
migrations.forEach((migration, index) => {
  try {
    execSync(`npx sequelize-cli migration:generate --name ${migration.name}`, { stdio: 'pipe' });
    
    // Encontrar el archivo creado
    const files = fs.readdirSync('src/migrations');
    const newFile = files.find(f => f.includes(migration.name) && f.endsWith('.js'));
    
    if (newFile) {
      fs.writeFileSync(path.join('src/migrations', newFile), migration.content);
      console.log(`✅ Migración ${migration.name} creada`);
    }
  } catch (error) {
    console.log(`❌ Error creando migración ${migration.name}:`, error.message);
  }
});

console.log('🎉 Todas las migraciones básicas han sido creadas');

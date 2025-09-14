#!/usr/bin/env node

const sqlite3 = require('sqlite3');
const path = require('path');

console.log('🔍 Verificando instalación de SQLite3...');

try {
  // Intentar crear una conexión de prueba
  const db = new sqlite3.Database(':memory:');
  
  db.serialize(() => {
    db.run("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)");
    db.run("INSERT INTO test (name) VALUES ('test')");
    
    db.get("SELECT * FROM test", (err, row) => {
      if (err) {
        console.error('❌ Error al ejecutar consulta SQLite:', err.message);
        process.exit(1);
      } else {
        console.log('✅ SQLite3 funcionando correctamente');
        console.log('📊 Datos de prueba:', row);
      }
      
      db.close((err) => {
        if (err) {
          console.error('❌ Error al cerrar base de datos:', err.message);
          process.exit(1);
        } else {
          console.log('✅ Conexión SQLite3 cerrada correctamente');
          process.exit(0);
        }
      });
    });
  });
  
} catch (error) {
  console.error('❌ Error al cargar SQLite3:', error.message);
  console.error('💡 Solución: Ejecuta "npm rebuild sqlite3"');
  process.exit(1);
}

const express = require('express');
const app = express();

// Middleware para logging
app.use((req, res, next) => {
  console.log(`🔍 [DEBUG] ${req.method} ${req.url}`);
  console.log(`🔍 [DEBUG] Params:`, req.params);
  console.log(`🔍 [DEBUG] Query:`, req.query);
  next();
});

// Simular las rutas del usuario
app.get('/usuarios/buscar-vecinos', (req, res) => {
  console.log('✅ Ruta /usuarios/buscar-vecinos accedida correctamente');
  res.json({ message: 'Búsqueda de vecinos funcionando', query: req.query });
});

app.get('/usuarios/:id', (req, res) => {
  console.log('⚠️ Ruta /usuarios/:id accedida con ID:', req.params.id);
  res.json({ message: 'Usuario por ID', id: req.params.id });
});

app.get('/usuarios', (req, res) => {
  console.log('✅ Ruta /usuarios (lista) accedida correctamente');
  res.json({ message: 'Lista de usuarios' });
});

// Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de debug iniciado en puerto ${PORT}`);
  console.log(`🔍 Prueba: curl http://localhost:${PORT}/usuarios/buscar-vecinos?telefono=123`);
  console.log(`🔍 Prueba: curl http://localhost:${PORT}/usuarios/123`);
});

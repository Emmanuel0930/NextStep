const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

const connectDB = require('../datos/config/database');

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Importar rutas
const authRoutes = require('./rutas/auth');
const empleosRoutes = require('./rutas/empleos');
const perfilRoutes = require('./rutas/perfil');
const aplicacionesRoutes = require('./rutas/aplicaciones');
const insigniasRoutes = require('./rutas/insignias'); 

// Usar rutas
app.use('/api', authRoutes);
app.use('/api', empleosRoutes);
app.use('/api', perfilRoutes);
app.use('/api', aplicacionesRoutes);
app.use('/api/insignias', insigniasRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend NextStep está funcionando ✅',
    version: '1.0.0',
    endpoints: [
      'POST /api/login',
      'POST /api/registro',
      'GET /api/jobs',
      'GET /api/dashboard',
      'GET /api/perfil/:userId',
      'PUT /api/perfil/nivel1',
      'PUT /api/perfil/nivel2',
      'PUT /api/perfil/nivel3',
      'PUT /api/perfil/nivel4',
      'GET /api/streak',
      'GET /api/notifications',
      'GET /api/stats',
      'POST /api/aplicar',
      'GET /api/insignias/insignia/:cuentaId',
      'POST /api/insignias/verificar-perfil-completo'
    ]
  });
});

// Inicializar datos de prueba
const initData = require('./utils/initData');

// Esperar un momento para que la conexión a la base de datos esté lista
setTimeout(async () => {
  try {
    console.log('Iniciando carga de datos...');
    await initData();
    console.log('Carga de datos completada');
  } catch (error) {
    console.error('Error en la carga de datos:', error);
  }
}, 2000);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
const express = require('express');
const router = express.Router();
const Racha = require('../../datos/modelos/Racha');
const Cuenta = require('../../datos/modelos/Cuenta');

// Sistema simple de notificaciones (para usar con cron job o similar)
class NotificacionesRacha {
  constructor() {
    this.intervalos = new Map();
    this.notificacionesEnviadas = new Set();
  }

  // Iniciar sistema de notificaciones
  iniciar() {
    console.log('🔔 Sistema de notificaciones de racha iniciado');
    
    // Verificar cada minuto si hay notificaciones que enviar
    setInterval(() => {
      this.verificarNotificaciones();
    }, 60000); // 60 segundos
    
    // Limpiar notificaciones enviadas cada día
    setInterval(() => {
      this.notificacionesEnviadas.clear();
      console.log('🧹 Cache de notificaciones limpiado');
    }, 24 * 60 * 60 * 1000); // 24 horas
  }

  async verificarNotificaciones() {
    try {
      const ahora = new Date();
      const horaActual = ahora.getHours().toString().padStart(2, '0') + ':' + 
                        ahora.getMinutes().toString().padStart(2, '0');

      // Buscar usuarios que necesitan notificación a esta hora
      const usuariosParaNotificar = await Racha.find({
        notificacionesActivas: true,
        horaNotificacion: horaActual
      }).populate('cuentaId', 'email nombreUsuario');

      for (const racha of usuariosParaNotificar) {
        const claveNotificacion = `${racha.cuentaId._id}-${ahora.toDateString()}`;
        
        // Evitar enviar múltiples notificaciones el mismo día
        if (this.notificacionesEnviadas.has(claveNotificacion)) {
          continue;
        }

        // Verificar si el usuario necesita recordatorio (no ha hecho login hoy)
        const ultimoLogin = new Date(racha.ultimoLogin);
        const hoy = new Date();
        
        if (ultimoLogin.toDateString() !== hoy.toDateString()) {
          await this.enviarNotificacionRacha(racha);
          this.notificacionesEnviadas.add(claveNotificacion);
        }
      }
    } catch (error) {
      console.error('Error verificando notificaciones:', error);
    }
  }

  async enviarNotificacionRacha(racha) {
    try {
      const usuario = racha.cuentaId;
      const mensaje = this.generarMensajeMotivacional(racha.rachaActual, racha.mejorRacha);
      
      console.log(`🔔 Enviando notificación a ${usuario.nombreUsuario}:`, mensaje);

      // En un entorno real, aquí enviarías la notificación push
      // Por ahora, solo simulamos el envío
      
      // Simular envío de notificación push web
      const notificacion = {
        usuario: usuario.nombreUsuario,
        email: usuario.email,
        rachaActual: racha.rachaActual,
        mejorRacha: racha.mejorRacha,
        mensaje: mensaje,
        timestamp: new Date(),
        tipo: 'recordatorio_racha'
      };

      // Log para debugging
      console.log('📱 Notificación simulada:', {
        para: usuario.nombreUsuario,
        racha: racha.rachaActual,
        mensaje: mensaje.titulo
      });

      return notificacion;
    } catch (error) {
      console.error('Error enviando notificación:', error);
      throw error;
    }
  }

  generarMensajeMotivacional(rachaActual, mejorRacha) {
    const mensajes = [
      {
        titulo: '🔥 ¡Mantén tu racha viva!',
        cuerpo: rachaActual > 0 
          ? `Llevas ${rachaActual} días seguidos. ¡No rompas la cadena!`
          : '¡Es hora de comenzar una nueva racha! Entra ahora.'
      },
      {
        titulo: '⚡ ¡NextStep te espera!',
        cuerpo: rachaActual > 0
          ? `${rachaActual} días de constancia. ¡Continúa tu progreso!`
          : '¡Comienza tu racha diaria! Cada día cuenta.'
      },
      {
        titulo: '💪 ¡Tu racha te está esperando!',
        cuerpo: rachaActual > 0
          ? `¡${rachaActual} días seguidos! Mantén el momentum.`
          : '¡Nueva oportunidad de crear una racha perfecta!'
      }
    ];

    // Mensajes especiales para rachas largas
    if (rachaActual >= 7) {
      mensajes.push({
        titulo: '👑 ¡Eres imparable!',
        cuerpo: `${rachaActual} días consecutivos. ¡Sigue construyendo tu legacy!`
      });
    }

    if (rachaActual >= 30) {
      mensajes.push({
        titulo: '🚀 ¡LEYENDA EN ACCIÓN!',
        cuerpo: `¡${rachaActual} días! Tu dedicación es inspiradora. ¡Continúa!`
      });
    }

    // Si perdió una racha buena, mensaje motivacional
    if (rachaActual === 0 && mejorRacha > 7) {
      mensajes.push({
        titulo: '🌱 ¡Nuevo comienzo!',
        cuerpo: `Tu mejor racha fue de ${mejorRacha} días. ¡Puedes superarla!`
      });
    }

    return mensajes[Math.floor(Math.random() * mensajes.length)];
  }

  // Método para enviar notificación manual (para testing)
  async enviarNotificacionManual(cuentaId) {
    try {
      const racha = await Racha.findOne({ cuentaId }).populate('cuentaId', 'email nombreUsuario');
      
      if (!racha) {
        throw new Error('Racha no encontrada');
      }

      return await this.enviarNotificacionRacha(racha);
    } catch (error) {
      console.error('Error enviando notificación manual:', error);
      throw error;
    }
  }
}

// Instancia singleton del sistema de notificaciones
const sistemaNotificaciones = new NotificacionesRacha();

// Endpoint para obtener usuarios que necesitan notificación (para cron jobs externos)
router.get('/usuarios-notificacion', async (req, res) => {
  try {
    const ahora = new Date();
    const horaActual = ahora.getHours().toString().padStart(2, '0') + ':' + 
                      ahora.getMinutes().toString().padStart(2, '0');

    const usuarios = await Racha.find({
      notificacionesActivas: true,
      horaNotificacion: horaActual
    }).populate('cuentaId', 'email nombreUsuario');

    const usuariosParaNotificar = usuarios.filter(racha => {
      const ultimoLogin = new Date(racha.ultimoLogin);
      const hoy = new Date();
      return ultimoLogin.toDateString() !== hoy.toDateString();
    });

    res.json({
      success: true,
      hora: horaActual,
      usuariosEncontrados: usuarios.length,
      usuariosParaNotificar: usuariosParaNotificar.length,
      usuarios: usuariosParaNotificar.map(racha => ({
        cuentaId: racha.cuentaId._id,
        email: racha.cuentaId.email,
        nombreUsuario: racha.cuentaId.nombreUsuario,
        rachaActual: racha.rachaActual,
        mejorRacha: racha.mejorRacha,
        horaNotificacion: racha.horaNotificacion
      }))
    });
  } catch (error) {
    console.error('Error obteniendo usuarios para notificación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener usuarios para notificación' 
    });
  }
});

// Endpoint para enviar notificación manual (para testing)
router.post('/enviar-notificacion-manual', async (req, res) => {
  try {
    const { cuentaId } = req.body;
    
    if (!cuentaId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere cuentaId'
      });
    }

    const notificacion = await sistemaNotificaciones.enviarNotificacionManual(cuentaId);
    
    res.json({
      success: true,
      notificacion,
      message: 'Notificación enviada exitosamente'
    });
  } catch (error) {
    console.error('Error enviando notificación manual:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error al enviar notificación' 
    });
  }
});

// Endpoint para iniciar/detener el sistema de notificaciones
router.post('/sistema/:accion', (req, res) => {
  try {
    const { accion } = req.params;
    
    if (accion === 'iniciar') {
      sistemaNotificaciones.iniciar();
      res.json({
        success: true,
        message: 'Sistema de notificaciones iniciado'
      });
    } else if (accion === 'estado') {
      res.json({
        success: true,
        estado: 'activo',
        notificacionesEnviadas: sistemaNotificaciones.notificacionesEnviadas.size
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Acción no válida. Use: iniciar, estado'
      });
    }
  } catch (error) {
    console.error('Error controlando sistema de notificaciones:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al controlar sistema de notificaciones' 
    });
  }
});

// Iniciar automáticamente el sistema de notificaciones
sistemaNotificaciones.iniciar();

module.exports = router;
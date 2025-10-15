const express = require('express');
const router = express.Router();
const Racha = require('../../datos/modelos/Racha');
const Cuenta = require('../../datos/modelos/Cuenta');

// Obtener estadísticas de racha del usuario
router.get('/estadisticas/:cuentaId', async (req, res) => {
  try {
    const { cuentaId } = req.params;

    let racha = await Racha.findOne({ cuentaId });
    
    if (!racha) {
      // Crear racha inicial si no existe
      racha = new Racha({ 
        cuentaId,
        rachaActual: 0,
        mejorRacha: 0,
        ultimoLogin: new Date(),
        fechaInicioRachaActual: new Date()
      });
      await racha.save();
    }

    const estadisticas = racha.obtenerEstadisticas();
    
    res.json({
      success: true,
      estadisticas
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de racha:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas de racha' 
    });
  }
});

// Actualizar racha en login
router.post('/actualizar-login', async (req, res) => {
  try {
    const { cuentaId } = req.body;

    if (!cuentaId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere cuentaId'
      });
    }

    let racha = await Racha.findOne({ cuentaId });
    
    if (!racha) {
      // Crear nueva racha
      racha = new Racha({ 
        cuentaId,
        rachaActual: 1,
        mejorRacha: 1,
        ultimoLogin: new Date(),
        fechaInicioRachaActual: new Date(),
        totalDiasConLogin: 1
      });
    } else {
      // Actualizar racha existente
      const rachaAnterior = racha.rachaActual;
      racha.actualizarRacha();
      
      // Determinar tipo de evento para feedback
      let tipoEvento = 'mantenida';
      if (racha.rachaActual > rachaAnterior) {
        tipoEvento = 'incrementada';
      } else if (racha.rachaActual === 1 && rachaAnterior > 1) {
        tipoEvento = 'reiniciada';
      }

      // Guardar cambios
      await racha.save();

      return res.json({
        success: true,
        racha: racha.obtenerEstadisticas(),
        tipoEvento,
        rachaAnterior,
        mensaje: obtenerMensajeRacha(racha.rachaActual, tipoEvento)
      });
    }

    await racha.save();

    res.json({
      success: true,
      racha: racha.obtenerEstadisticas(),
      tipoEvento: 'nueva',
      mensaje: '¡Bienvenido! Has comenzado tu primera racha diaria 🔥'
    });

  } catch (error) {
    console.error('Error actualizando racha:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar racha' 
    });
  }
});

// Configurar notificaciones de racha
router.post('/configurar-notificaciones', async (req, res) => {
  try {
    const { cuentaId, notificacionesActivas, horaNotificacion } = req.body;

    if (!cuentaId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere cuentaId'
      });
    }

    let racha = await Racha.findOne({ cuentaId });
    
    if (!racha) {
      return res.status(404).json({
        success: false,
        message: 'Racha no encontrada'
      });
    }

    // Actualizar configuración
    if (notificacionesActivas !== undefined) {
      racha.notificacionesActivas = notificacionesActivas;
    }
    
    if (horaNotificacion) {
      // Validar formato de hora (HH:MM)
      const formatoHora = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!formatoHora.test(horaNotificacion)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de hora inválido. Use HH:MM'
        });
      }
      racha.horaNotificacion = horaNotificacion;
    }

    await racha.save();

    res.json({
      success: true,
      configuracion: {
        notificacionesActivas: racha.notificacionesActivas,
        horaNotificacion: racha.horaNotificacion
      },
      mensaje: 'Configuración de notificaciones actualizada'
    });

  } catch (error) {
    console.error('Error configurando notificaciones:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al configurar notificaciones' 
    });
  }
});

// Obtener usuarios que necesitan notificación
router.get('/usuarios-notificacion', async (req, res) => {
  try {
    const ahora = new Date();
    const horaActual = ahora.getHours().toString().padStart(2, '0') + ':' + 
                      ahora.getMinutes().toString().padStart(2, '0');

    // Buscar usuarios que tienen notificaciones activas y la hora coincide
    const usuarios = await Racha.find({
      notificacionesActivas: true,
      horaNotificacion: horaActual
    }).populate('cuentaId', 'email nombre');

    // Filtrar usuarios que necesitan notificación (no han hecho login hoy)
    const usuariosParaNotificar = usuarios.filter(racha => {
      const ultimoLogin = new Date(racha.ultimoLogin);
      const hoy = new Date();
      
      // Si no han hecho login hoy, necesitan notificación
      return ultimoLogin.toDateString() !== hoy.toDateString();
    });

    res.json({
      success: true,
      usuarios: usuariosParaNotificar.map(racha => ({
        cuentaId: racha.cuentaId._id,
        email: racha.cuentaId.email,
        nombre: racha.cuentaId.nombre,
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

// Función auxiliar para generar mensajes motivadores
function obtenerMensajeRacha(dias, tipo) {
  const mensajes = {
    nueva: [
      '¡Bienvenido! Has comenzado tu primera racha diaria 🔥',
      '¡Excelente! Tu aventura de constancia comienza ahora 🌟'
    ],
    incrementada: {
      1: ['¡Perfecto! Has comenzado tu racha diaria 🔥', '¡Primer día completado! 💪'],
      3: ['¡3 días seguidos! Vas por buen camino 🚀', '¡Excelente constancia! 3 días consecutivos ⭐'],
      7: ['¡Una semana completa! Eres imparable 🏆', '¡7 días de constancia! Increíble dedicación 🌟'],
      14: ['¡2 semanas consecutivas! Eres una leyenda 👑', '¡14 días seguidos! Tu disciplina es admirable 💎'],
      30: ['¡UN MES COMPLETO! Eres oficialmente imparable 🏅', '¡30 días de constancia! Eres un verdadero campeón 🔥'],
      60: ['¡2 MESES! Tu dedicación no tiene límites 🚀', '¡60 días consecutivos! Eres inspiración pura ⚡'],
      100: ['¡100 DÍAS! Has alcanzado la excelencia absoluta 👑', '¡CENTENARIO! Eres una leyenda viviente 🌟']
    },
    mantenida: [
      '¡Racha mantenida! Sigue así 💪',
      '¡Constancia perfecta! 🔥',
      '¡Otro día más en tu racha! 🌟'
    ],
    reiniciada: [
      '¡No te preocupes! Una nueva racha comienza hoy 🌱',
      '¡Nuevo comienzo! La constancia se construye día a día 💪',
      '¡Reinicio exitoso! Cada día es una nueva oportunidad 🌟'
    ]
  };

  if (tipo === 'incrementada') {
    // Buscar mensaje específico para días especiales
    const diasEspeciales = [100, 60, 30, 14, 7, 3, 1];
    for (let dia of diasEspeciales) {
      if (dias >= dia && mensajes.incrementada[dia]) {
        const mensajesDisponibles = mensajes.incrementada[dia];
        return mensajesDisponibles[Math.floor(Math.random() * mensajesDisponibles.length)];
      }
    }
    // Mensaje por defecto para incremento
    return `¡${dias} días consecutivos! Tu constancia es admirable 🔥`;
  }

  const mensajesDisponibles = mensajes[tipo] || mensajes.mantenida;
  return mensajesDisponibles[Math.floor(Math.random() * mensajesDisponibles.length)];
}

module.exports = router;
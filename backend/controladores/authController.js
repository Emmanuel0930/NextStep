
const Cuenta = require('../../datos/modelos/Cuenta');
const Ingresos = require('../../datos/modelos/Ingresos');
const Racha = require('../../datos/modelos/Racha');

const authController = {
  // Login de usuario
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      console.log('Intento de login:');
      console.log('Email recibido:', email);

      // Buscar usuario por correo
      const usuario = await Cuenta.findOne({ correo: email.toLowerCase() });
      
      if (!usuario) {
        console.log('Usuario encontrado:NO');
        return res.status(401).json({
          success: false,
          message: 'Credenciales incorrectas'
        });
      }

      console.log('Usuario encontrado:SÍ');
      console.log('Contraseña guardada:', usuario.contraseña ? 'SÍ' : 'NO');

      // Verificar contraseña
      const contraseñaValida = usuario.contraseña === password;

      if (!contraseñaValida) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales incorrectas'
        });
      }

      // Actualizar último login
      await usuario.actualizarLogin();

      // Actualizar racha diaria
      let racha = await Racha.findOne({ cuentaId: usuario._id });
      let rachaInfo = null;
      
      if (!racha) {
        // Crear nueva racha
        racha = new Racha({ 
          cuentaId: usuario._id,
          rachaActual: 1,
          mejorRacha: 1,
          ultimoLogin: new Date(),
          fechaInicioRachaActual: new Date(),
          totalDiasConLogin: 1
        });
        await racha.save();
        rachaInfo = {
          tipoEvento: 'nueva',
          racha: racha.obtenerEstadisticas(),
          mensaje: '¡Bienvenido! Has comenzado tu primera racha diaria 🔥'
        };
      } else {
        // Actualizar racha existente
        const rachaAnterior = racha.rachaActual;
        racha.actualizarRacha();
        await racha.save();
        
        let tipoEvento = 'mantenida';
        if (racha.rachaActual > rachaAnterior) {
          tipoEvento = 'incrementada';
        } else if (racha.rachaActual === 1 && rachaAnterior > 1) {
          tipoEvento = 'reiniciada';
        }
        
        rachaInfo = {
          tipoEvento,
          racha: racha.obtenerEstadisticas(),
          rachaAnterior,
          mensaje: obtenerMensajeRacha(racha.rachaActual, tipoEvento)
        };
      }

      console.log('LOGIN EXITOSO para:', usuario.nombreUsuario, '- Racha:', racha.rachaActual);

      res.json({
        success: true,
        profile: {
          id: usuario._id,
          nombreUsuario: usuario.nombreUsuario,
          correo: usuario.correo,
          puntos: usuario.puntos,
          nivel: usuario.nivel,
          porcentajePerfil: usuario.porcentajePerfil
        },
        racha: rachaInfo
      });

    } catch (error) {
      console.error('💥 ERROR en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Registro de nuevo usuario
  registro: async (req, res) => {
    try {
      const { nombreUsuario, correo, contraseña } = req.body;

      // Verificar si el usuario ya existe
      const usuarioExistente = await Cuenta.findOne({
        $or: [
          { correo: correo.toLowerCase() },
          { nombreUsuario: nombreUsuario }
        ]
      });

      if (usuarioExistente) {
        return res.status(400).json({
          success: false,
          message: 'El usuario o correo ya están registrados'
        });
      }

      // Crear nuevo usuario
      const nuevoUsuario = new Cuenta({
        nombreUsuario,
        correo: correo.toLowerCase(),
        contraseña, // En producción debería estar encriptada
        puntos: 0,
        nivel: 1,
        porcentajePerfil: 20
      });

      await nuevoUsuario.save();

      // Puntos por registro
      await Ingresos.create({
        cuentaId: nuevoUsuario._id,
        puntosGanados: 100
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente +100 puntos',
        profile: {
          id: nuevoUsuario._id,
          nombreUsuario: nuevoUsuario.nombreUsuario,
          correo: nuevoUsuario.correo,
          puntos: nuevoUsuario.puntos + 100,
          nivel: nuevoUsuario.nivel,
          porcentajePerfil: nuevoUsuario.porcentajePerfil
        }
      });

    } catch (error) {
      console.error('💥 ERROR en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar usuario'
      });
    }
  }
};

// Función auxiliar para generar mensajes motivadores de racha
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
      30: ['¡UN MES COMPLETO! Eres oficialmente imparable 🏅', '¡30 días de constancia! Eres un verdadero campeón 🔥']
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
    const diasEspeciales = [30, 14, 7, 3, 1];
    for (let dia of diasEspeciales) {
      if (dias >= dia && mensajes.incrementada[dia]) {
        const mensajesDisponibles = mensajes.incrementada[dia];
        return mensajesDisponibles[Math.floor(Math.random() * mensajesDisponibles.length)];
      }
    }
    return `¡${dias} días consecutivos! Tu constancia es admirable 🔥`;
  }

  const mensajesDisponibles = mensajes[tipo] || mensajes.mantenida;
  return mensajesDisponibles[Math.floor(Math.random() * mensajesDisponibles.length)];
}

module.exports = authController;
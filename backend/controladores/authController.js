
const Cuenta = require('../../datos/modelos/Cuenta');
const Ingresos = require('../../datos/modelos/Ingresos');

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

      console.log('LOGIN EXITOSO para:', usuario.nombreUsuario);

      res.json({
        success: true,
        profile: {
          id: usuario._id,
          nombreUsuario: usuario.nombreUsuario,
          correo: usuario.correo,
          puntos: usuario.puntos,
          nivel: usuario.nivel,
          porcentajePerfil: usuario.porcentajePerfil
        }
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

module.exports = authController;
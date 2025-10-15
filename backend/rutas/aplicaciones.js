const express = require('express');
const router = express.Router();
const InteraccionEmpleosCuenta = require('../../datos/modelos/InteraccionEmpleosCuenta');
const Ingresos = require('../../datos/modelos/Ingresos');
const Cuenta = require('../../datos/modelos/Cuenta');
const { calcularNivel } = require('../../datos/utils/nivelesSystem');

//Aplicar a un empleo
router.post('/aplicar', async (req, res) => {
  try {
    const { cuentaId, empleoId } = req.body;

    // Verificar si ya aplicó
    const aplicacionExistente = await InteraccionEmpleosCuenta.findOne({
      cuentaId,
      empleoId,
      estado: 'postulado'
    });

    if (aplicacionExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya has aplicado a este empleo'
      });
    }

    // Crear nueva aplicación
    const nuevaAplicacion = new InteraccionEmpleosCuenta({
      cuentaId,
      empleoId,
      estado: 'postulado',
      fechaPostulacion: new Date()
    });

    await nuevaAplicacion.save();

    // Agregar puntos por aplicación
    await Ingresos.create({
      cuentaId,
      puntosGanados: 10
    });

    // Actualizar puntos en cuenta y verificar subida de nivel
    const cuenta = await Cuenta.findByIdAndUpdate(cuentaId, {
      $inc: { puntos: 10 }
    }, { new: true });

    // Verificar subida de nivel automática
    const nuevoNivelData = calcularNivel(cuenta.puntos);
    if (nuevoNivelData.nivel !== cuenta.nivel) {
      await Cuenta.findByIdAndUpdate(cuentaId, {
        nivel: nuevoNivelData.nivel
      });
      console.log(`🎉 ¡SUBIDA DE NIVEL! Usuario ${cuentaId}: ${cuenta.nivel} → ${nuevoNivelData.nivel} (${nuevoNivelData.nombre})`);
    }

    res.json({
      success: true,
      message: '¡Postulación exitosa! + 1 puntos',
      aplicacion: nuevaAplicacion
    });

  } catch (error) {
    console.error('Error aplicando a empleo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aplicar al empleo'
    });
  }
});

//Obtener aplicaciones del usuario
router.get('/mis-aplicaciones/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const aplicaciones = await InteraccionEmpleosCuenta.find({
      cuentaId: userId,
      estado: 'postulado'
    }).populate('empleoId').sort({ fechaPostulacion: -1 });

    res.json({
      success: true,
      aplicaciones: aplicaciones
    });

  } catch (error) {
    console.error('Error obteniendo aplicaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener aplicaciones'
    });
  }
});

module.exports = router;
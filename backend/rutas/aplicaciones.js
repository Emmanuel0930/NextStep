const express = require('express');
const router = express.Router();
const InteraccionEmpleosCuenta = require('../../datos/modelos/InteraccionEmpleosCuenta');
const Ingresos = require('../../datos/modelos/Ingresos');
const Cuenta = require('../../datos/modelos/Cuenta');
const Insignias = require('../../datos/modelos/Insignias');
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

    // ---------------------------------------------------------
    // Lógica: marcar la insignia 'Primera Postulación' como obtenida
    // cuando el usuario tiene >=1 postulaciones. Además, enviar
    // la señal de notificación solo si no se ha enviado antes.
    // ---------------------------------------------------------
    try {
      const totalPostulaciones = await InteraccionEmpleosCuenta.countDocuments({ cuentaId, estado: 'postulado' });
      if (totalPostulaciones >= 1) {
        // Obtener o crear doc de insignia usando upsert para evitar duplicate-key
          await Insignias.findOneAndUpdate(
            { cuentaId, nombre: 'Primera Postulación' },
            {
              $setOnInsert: {
                descripcion: 'Envía tu primera postulación a una oferta',
                icono: '🚀',
                notificacionEnviada: false
              }
            },
            { upsert: true, new: true }
          );

          // Intentar marcar como obtenida SOLO si aún no lo está (operación atómica)
          const marcada = await Insignias.findOneAndUpdate(
            { cuentaId, nombre: 'Primera Postulación', obtenida: { $ne: true } },
            { $set: { obtenida: true, fechaObtenida: new Date() } },
            { new: true }
          );

          if (marcada) {
            const BONUS_PRIMERA = 10;
            await Ingresos.create({ cuentaId, puntosGanados: BONUS_PRIMERA });
            await Cuenta.findByIdAndUpdate(cuentaId, { $inc: { puntos: BONUS_PRIMERA } });
            console.log(`🏅 Insignia 'Primera Postulación' otorgada a ${cuentaId}`);
          }

          // Enviar indicación de notificación al frontend solo si no se ha enviado antes
          let insigniaNotificacion = null;
          const primeraDoc = await Insignias.findOne({ cuentaId, nombre: 'Primera Postulación' });
          if (primeraDoc && !primeraDoc.notificacionEnviada) {
            await Insignias.findOneAndUpdate(
              { cuentaId, nombre: 'Primera Postulación' },
              { $set: { notificacionEnviada: true } },
              { new: true }
            );
            insigniaNotificacion = {
              nombre: primeraDoc.nombre,
              descripcion: primeraDoc.descripcion,
              icono: primeraDoc.icono
            };
          }

        // Agregar la info en la respuesta para que el frontend pueda mostrar celebración
        return res.json({
          success: true,
          message: '¡Postulación exitosa! +10 puntos',
          aplicacion: nuevaAplicacion,
          insigniaOtorgada: insigniaNotificacion
        });
      }
    } catch (err) {
      console.error('Error evaluando/otorgando insignia de primera postulación:', err);
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
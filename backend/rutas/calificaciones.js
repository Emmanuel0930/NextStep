const express = require('express');
const router = express.Router();
const InteraccionEmpleosCuenta = require('../../datos/modelos/InteraccionEmpleosCuenta');
const mongoose = require('mongoose');

// Calificar un empleo
router.post('/calificar', async (req, res) => {
  try {
    const { cuentaId, empleoId, calificacion, comentario } = req.body;

    // Validar calificación
    if (!calificacion || calificacion < 1 || calificacion > 5) {
      return res.status(400).json({
        success: false,
        message: 'La calificación debe ser entre 1 y 5 estrellas'
      });
    }

    // Validar comentario
    const comentariosValidos = ['excelente', 'bueno', 'regular', 'malo', 'pésimo'];
    if (comentario && !comentariosValidos.includes(comentario)) {
      return res.status(400).json({
        success: false,
        message: 'Comentario no válido'
      });
    }

    // Buscar o crear interacción
    const interaccion = await InteraccionEmpleosCuenta.findOneAndUpdate(
      { cuentaId, empleoId },
      { 
        calificacion: parseInt(calificacion),
        comentario: comentario || null,
        fechaCalificacion: new Date()
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true 
      }
    );

    console.log(`⭐ Calificación guardada: ${calificacion} estrellas para empleo ${empleoId}`);

    res.json({ 
      success: true, 
      message: '¡Calificación guardada!',
      interaccion 
    });

  } catch (error) {
    console.error('Error calificando empleo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al guardar calificación'
    });
  }
});

// Obtener promedio de calificaciones de un empleo
router.get('/empleos/:id/promedio', async (req, res) => {
  try {
    const empleoId = req.params.id;

    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(empleoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de empleo no válido'
      });
    }

    const resultado = await InteraccionEmpleosCuenta.aggregate([
      { 
        $match: { 
          empleoId: new mongoose.Types.ObjectId(empleoId), 
          calificacion: { $ne: null, $gte: 1, $lte: 5 } 
        } 
      },
      { 
        $group: { 
          _id: '$empleoId', 
          promedio: { $avg: '$calificacion' }, 
          total: { $sum: 1 },
          distribucion: {
            $push: '$calificacion'
          }
        } 
      }
    ]);

    const datos = resultado.length > 0 ? resultado[0] : null;
    
    // Calcular distribución de estrellas
    let distribucion = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (datos && datos.distribucion) {
      datos.distribucion.forEach(calif => {
        distribucion[calif] = (distribucion[calif] || 0) + 1;
      });
    }

    res.json({ 
      success: true, 
      promedio: datos ? Math.round(datos.promedio * 10) / 10 : 0,
      totalCalificaciones: datos ? datos.total : 0,
      distribucion
    });

  } catch (error) {
    console.error('Error obteniendo promedio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener promedio de calificaciones'
    });
  }
});

// Obtener calificación del usuario actual para un empleo
router.get('/usuario/:empleoId', async (req, res) => {
  try {
    const { empleoId } = req.params;
    const { cuentaId } = req.query;

    if (!cuentaId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere cuentaId'
      });
    }

    const calificacion = await InteraccionEmpleosCuenta.findOne({
      cuentaId,
      empleoId,
      calificacion: { $ne: null }
    }).select('calificacion comentario fechaCalificacion');

    res.json({
      success: true,
      calificacion: calificacion || null
    });

  } catch (error) {
    console.error('Error obteniendo calificación del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener calificación'
    });
  }
});

module.exports = router;
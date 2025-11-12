const express = require('express');
const router = express.Router();
const Cuenta = require('../../datos/modelos/Cuenta');
const Nivel1 = require('../../datos/modelos/Nivel1');
const Nivel2 = require('../../datos/modelos/Nivel2');
const Nivel3 = require('../../datos/modelos/Nivel3');
const Nivel4 = require('../../datos/modelos/Nivel4');
const Ingresos = require('../../datos/modelos/Ingresos');
const Insignias = require('../../datos/modelos/Insignias');
const InteraccionEmpleosCuenta = require('../../datos/modelos/InteraccionEmpleosCuenta');
const mongoose = require('mongoose');
const Empleos = require('../../datos/modelos/Empleos');

// Obtener perfil completo del usuario
router.get('/perfil/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`GET /api/perfil/ llamado para usuario: ${userId}`);

    const cuenta = await Cuenta.findById(userId);
    if (!cuenta) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Obtener datos de todos los niveles
    const [nivel1, nivel2, nivel3, nivel4, ingresos, insignias] = await Promise.all([
      Nivel1.findOne({ cuentaId: userId }),
      Nivel2.findOne({ cuentaId: userId }),
      Nivel3.findOne({ cuentaId: userId }),
      Nivel4.findOne({ cuentaId: userId }),
      Ingresos.find({ cuentaId: userId }).sort({ fecha: -1 }).limit(10),
      Insignias.find({ cuentaId: userId })
    ]);

    // Si el usuario tiene postulaciones y no tiene la insignia 'Primera Postulación', crearla (retroactivo)
    try {
      const postulacionesCount = await InteraccionEmpleosCuenta.countDocuments({ cuentaId: userId, estado: 'postulado' });
      if (postulacionesCount >= 1) {
        const tienePrimera = insignias.some(i => (i.nombre || '').toLowerCase().includes('primera'));
        if (!tienePrimera) {
          // Usar upsert para evitar error de índice único existente en la colección
          const updated = await Insignias.findOneAndUpdate(
            { cuentaId: userId, nombre: 'Primera Postulación' },
            {
              $set: {
                obtenida: true,
                notificacionEnviada: true,
                fechaObtenida: new Date()
              },
              $setOnInsert: {
                descripcion: 'Envía tu primera postulación a una oferta',
                icono: '🚀'
              }
            },
            { upsert: true, new: true }
          );
          insignias.push(updated);
          console.log(`Perfil: Insignia 'Primera Postulación' creada/actualizada retroactivamente para ${userId}`);
        }
      }
    } catch (err) {
      console.error('Error verificando postulaciones en /perfil:', err);
    }

    // Calcular progreso total
    const nivelesCompletados = [nivel1, nivel2, nivel3, nivel4].filter(n => n?.completado).length;
    const porcentajePerfil = Math.min(20 + (nivelesCompletados * 20), 100);

    // Actualizar porcentaje en cuenta si cambió
    if (cuenta.porcentajePerfil !== porcentajePerfil) {
      await Cuenta.findByIdAndUpdate(userId, { porcentajePerfil });
    }

    res.json({
      success: true,
      perfil: {
        cuenta,
        niveles: {
          nivel1: nivel1 || { completado: false },
          nivel2: nivel2 || { completado: false },
          nivel3: nivel3 || { completado: false },
          nivel4: nivel4 || { completado: false }
        },
        ingresos,
  insignias,
        progresoTotal: {
          nivelesCompletados,
          porcentajePerfil,
          siguienteNivel: nivelesCompletados < 4 ? `Nivel ${nivelesCompletados + 1}` : '¡Completado!'
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil'
    });
  }
});

// Importar sistema de niveles
const { calcularNivel } = require('../../datos/utils/nivelesSystem');

// Función auxiliar para dar puntos UNA SOLA VEZ
async function darPuntosNivel(cuentaId, puntos, nivelNumero) {
  const cuenta = await Cuenta.findByIdAndUpdate(cuentaId, {
    $inc: { puntos: puntos }
  }, { new: true });
  
  // Calcular y actualizar nivel automáticamente
  const nuevoNivelData = calcularNivel(cuenta.puntos);
  const nivelAnterior = cuenta.nivel;
  
  if (nuevoNivelData.nivel !== nivelAnterior) {
    await Cuenta.findByIdAndUpdate(cuentaId, {
      nivel: nuevoNivelData.nivel
    });
    console.log(`🎉 ¡SUBIDA DE NIVEL! ${nivelAnterior} → ${nuevoNivelData.nivel} (${nuevoNivelData.nombre})`);
  }
  
  await Ingresos.create({
    cuentaId,
    puntosGanados: puntos
  });
  
  console.log(`✅ ${puntos} puntos otorgados por completar Nivel ${nivelNumero}`);
  
  return {
    puntosNuevos: cuenta.puntos,
    nivelAnterior,
    nivelNuevo: nuevoNivelData.nivel,
    subioDeNivel: nuevoNivelData.nivel !== nivelAnterior,
    datosNivel: nuevoNivelData
  };
}

// Actualizar Nivel 1 (Información Básica)
router.put('/perfil/nivel1', async (req, res) => {
  try {
    const { cuentaId, sector, cargo, salarioDeseado, estudios, ciudad, disponibilidad } = req.body;

    const nivelExistente = await Nivel1.findOne({ cuentaId });
    const yaCompletado = nivelExistente?.completado;

    const nivel1 = await Nivel1.findOneAndUpdate(
      { cuentaId },
      {
        sector: Array.isArray(sector) ? sector : [sector],
        cargo,
        salarioDeseado,
        estudios,
        ciudad,
        disponibilidad,
        completado: true
      },
      { upsert: true, new: true }
    );

    // SOLO dar puntos si NO estaba completado antes
    if (!yaCompletado) {
      const resultadoPuntos = await darPuntosNivel(cuentaId, 50, 1);
      
      res.json({
        success: true,
        message: resultadoPuntos.subioDeNivel 
          ? `Nivel 1 completado +50 puntos | ¡SUBISTE A ${resultadoPuntos.datosNivel.nombre}! 🎉`
          : 'Nivel 1 completado +50 puntos',
        nivel1, 
        puntosOtorgados: true,
        nivelInfo: resultadoPuntos
      });
    } else {
      res.json({
        success: true,
        message: 'Nivel 1 actualizado',
        nivel1,
        puntosOtorgados: false
      });
    }
  } catch (error) {
    console.error('Error actualizando nivel 1:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar nivel 1'
    });
  }
});

// Actualizar Nivel 2 (Experiencia)
router.put('/perfil/nivel2', async (req, res) => {
  try {
    const { cuentaId, experiencias } = req.body;

    const experienciaTotal = experiencias.reduce((total, exp) => total + (exp.duracion || 0), 0);
    const nivelExistente = await Nivel2.findOne({ cuentaId });
    const yaCompletado = nivelExistente?.completado;

    const nivel2 = await Nivel2.findOneAndUpdate(
      { cuentaId },
      {
        experiencias,
        experienciaTotal,
        completado: true
      },
      { upsert: true, new: true }
    );

    if (!yaCompletado) {
      const resultadoPuntos = await darPuntosNivel(cuentaId, 75, 2);
      
      res.json({
        success: true,
        message: resultadoPuntos.subioDeNivel 
          ? `Nivel 2 completado +75 puntos | ¡SUBISTE A ${resultadoPuntos.datosNivel.nombre}! 🎉`
          : 'Nivel 2 completado +75 puntos',
        nivel2, 
        puntosOtorgados: true,
        nivelInfo: resultadoPuntos
      });
    } else {
      res.json({
        success: true,
        message: 'Nivel 2 actualizado',
        nivel2,
        puntosOtorgados: false
      });
    }

  } catch (error) {
    console.error('Error actualizando nivel 2:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar nivel 2'
    });
  }
});

// Actualizar Nivel 3 (Habilidades)
router.put('/perfil/nivel3', async (req, res) => {
  try {
    const { cuentaId, descripcionPerfil, habilidades } = req.body;

    const nivelExistente = await Nivel3.findOne({ cuentaId });
    const yaCompletado = nivelExistente?.completado;
    
    const nivel3 = await Nivel3.findOneAndUpdate(
      { cuentaId },
      {
        descripcionPerfil,
        habilidades: Array.isArray(habilidades) ? habilidades : [habilidades],
        completado: true
      },
      { upsert: true, new: true }
    );

    if (!yaCompletado) {
      const resultadoPuntos = await darPuntosNivel(cuentaId, 60, 3);
      
      res.json({
        success: true,
        message: resultadoPuntos.subioDeNivel 
          ? `Nivel 3 completado +60 puntos | ¡SUBISTE A ${resultadoPuntos.datosNivel.nombre}! 🎉`
          : 'Nivel 3 completado +60 puntos',
        nivel3,
        puntosOtorgados: true,
        nivelInfo: resultadoPuntos
      });
    } else {
      res.json({
        success: true,
        message: 'Nivel 3 actualizado',
        nivel3,
        puntosOtorgados: false
      });
    }

  } catch (error) {
    console.error('Error actualizando nivel 3:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar nivel 3'
    });
  }
});

// Actualizar Nivel 4 (Idiomas y Referencias)
router.put('/perfil/nivel4', async (req, res) => {
  try {
    const { cuentaId, idiomas, referencias } = req.body;
    
    const nivelExistente = await Nivel4.findOne({ cuentaId });
    const yaCompletado = nivelExistente?.completado;
    
    const nivel4 = await Nivel4.findOneAndUpdate(
      { cuentaId },
      {
        idiomas: Array.isArray(idiomas) ? idiomas : [idiomas],
        referencias: Array.isArray(referencias) ? referencias : [referencias],
        completado: true
      },
      { upsert: true, new: true }
    );

    if (!yaCompletado) {
      const resultadoPuntos = await darPuntosNivel(cuentaId, 40, 4);
      
      res.json({
        success: true,
        message: resultadoPuntos.subioDeNivel 
          ? `Nivel 4 completado +40 puntos | ¡SUBISTE A ${resultadoPuntos.datosNivel.nombre}! 🎉`
          : 'Nivel 4 completado +40 puntos',
        nivel4,
        puntosOtorgados: true,
        nivelInfo: resultadoPuntos
      });
    } else {
      res.json({
        success: true,
        message: 'Nivel 4 actualizado',
        nivel4,
        puntosOtorgados: false
      });
    }
  } catch (error) {
    console.error('Error actualizando nivel 4:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar nivel 4'
    });
  }
});

// Obtener estadísticas del perfil
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [
      cuenta,
      totalPuntos,
      aplicacionesCount,
      empleosGuardadosCount,
      nivelesCompletados
    ] = await Promise.all([
      Cuenta.findById(userId),
      Ingresos.aggregate([
        { $match: { cuentaId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$puntosGanados' } } }
      ]),
      InteraccionEmpleosCuenta.countDocuments({ 
        cuentaId: userId, 
        estado: 'postulado' 
      }),
      InteraccionEmpleosCuenta.countDocuments({ 
        cuentaId: userId, 
        estado: 'guardado',
        favorito: true
      }),
      Promise.all([
        Nivel1.findOne({ cuentaId: userId }),
        Nivel2.findOne({ cuentaId: userId }),
        Nivel3.findOne({ cuentaId: userId }),
        Nivel4.findOne({ cuentaId: userId })
      ]).then(niveles => niveles.filter(n => n?.completado).length)
    ]);

    res.json({
      success: true,
      stats: {
        totalPuntos: cuenta?.puntos || 0, // Usar puntos de la cuenta
        aplicaciones: aplicacionesCount,
        empleosGuardados: empleosGuardadosCount,
        nivelesCompletados,
        progreso: Math.min(20 + (nivelesCompletados * 20), 100)
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

module.exports = router;

// Obtener empleos favoritos de un usuario
router.get('/perfil/:userId/favoritos', async (req, res) => {
  try {
    const { userId } = req.params;

    // Buscar interacciones marcadas como favorito
    const favoritos = await InteraccionEmpleosCuenta.find({ cuentaId: userId, favorito: true }).populate('empleoId').lean();

    const empleosFavoritos = favoritos
      .map(item => item.empleoId)
      .filter(Boolean)
      .map(empleo => ({
        id: empleo._id.toString(),
        nombre: empleo.nombre || empleo.title || '',
        ciudad: empleo.ciudad || empleo.city || '',
        sueldo: empleo.sueldo || empleo.salary || 0,
        descripcion: empleo.descripcion || empleo.description || '',
        palabrasClave: Array.isArray(empleo.palabrasClave) ? empleo.palabrasClave : Array.isArray(empleo.keywords) ? empleo.keywords : [],
        habilidades: Array.isArray(empleo.habilidades) ? empleo.habilidades : Array.isArray(empleo.skills) ? empleo.skills : [],
        añosExperiencia: empleo.añosExperiencia || empleo.experience || 0,
        fechaPublicacion: empleo.fechaPublicacion || empleo.publishDate || new Date(),
        ...(empleo.company && { empresa: empleo.company }),
        ...(empleo.contract && { tipoContrato: empleo.contract })
      }));

    res.json({ success: true, favoritos: empleosFavoritos });
  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener favoritos' });
  }
});
const express = require('express');
const router = express.Router();
const Insignias = require('../../datos/modelos/Insignias');
const Cuenta = require('../../datos/modelos/Cuenta');
const Nivel1 = require('../../datos/modelos/Nivel1');
const Nivel2 = require('../../datos/modelos/Nivel2');
const Nivel3 = require('../../datos/modelos/Nivel3');
const Nivel4 = require('../../datos/modelos/Nivel4');

//Verificar y otorgar insignia de perfil completado
router.post('/verificar-perfil-completo', async (req, res) => {
  try {
    const { cuentaId } = req.body;

    if (!cuentaId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de cuenta requerido' 
      });
    }

    console.log(`🔍 Verificando perfil completo para usuario: ${cuentaId}`);

    // Verificar cada nivel individualmente
    const [nivel1, nivel2, nivel3, nivel4] = await Promise.all([
      Nivel1.findOne({ cuentaId }),
      Nivel2.findOne({ cuentaId }),
      Nivel3.findOne({ cuentaId }),
      Nivel4.findOne({ cuentaId })
    ]);

    const nivel1Completado = nivel1?.completado || false;
    const nivel2Completado = nivel2?.completado || false;
    const nivel3Completado = nivel3?.completado || false;
    const nivel4Completado = nivel4?.completado || false;

    //Condicion para entregar la insignia. 
    const perfilCompleto = nivel1Completado && nivel2Completado && nivel3Completado && nivel4Completado;

    console.log(`📊 Estado niveles - 1:${nivel1Completado}, 2:${nivel2Completado}, 3:${nivel3Completado}, 4:${nivel4Completado}`);

    if (!perfilCompleto) {
      return res.json({ 
        success: false, 
        perfilCompleto: false,
        nivelesCompletados: {
          nivel1: nivel1Completado,
          nivel2: nivel2Completado,
          nivel3: nivel3Completado,
          nivel4: nivel4Completado
        },
        message: 'Perfil aún no está completo' 
      });
    }

    // Verificar si ya tiene la insignia
    let insignia = await Insignias.findOne({ cuentaId });

    if (insignia && insignia.obtenida) {
      console.log(`Usuario ${cuentaId} ya tiene la insignia`);
      return res.json({ 
        success: true, 
        perfilCompleto: true,
        insigniaYaObtenida: true,
        insignia 
      });
    }

    // Otorgar la insignia
    if (!insignia) {
      // Crear nueva insignia
      insignia = new Insignias({
        cuentaId,
        nombre: 'Perfil Completo',
        descripcion: '¡Has completado tu perfil al 100%!',
        icono: '🌟',
        obtenida: true,
        fechaObtenida: new Date()
      });
    } else {
      // Actualizar insignia existente
      insignia.obtenida = true;
      insignia.fechaObtenida = new Date();
    }

    await insignia.save();

    // Dar puntos bonus por completar el perfil
    const PUNTOS_BONUS = 100;
    await Cuenta.findByIdAndUpdate(cuentaId, {
      $inc: { puntos: PUNTOS_BONUS }
    });

    console.log(`Insignia otorgada a usuario ${cuentaId}`);

    res.json({
      success: true,
      perfilCompleto: true,
      insigniaObtenida: true,
      insignia,
      puntosGanados: PUNTOS_BONUS,
      message: '¡Felicitaciones! Has completado tu perfil al 100% 🌟'
    });

  } catch (error) {
    console.error('Error verificando perfil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al verificar perfil completo' 
    });
  }
});

//Insignia del usuario
router.get('/insignia/:cuentaId', async (req, res) => {
  try {
    const { cuentaId } = req.params;

    // Buscar o crear insignia
    let insignia = await Insignias.findOne({ cuentaId });

    if (!insignia) {
      // Crear insignia pendiente
      insignia = new Insignias({
        cuentaId,
        obtenida: false
      });
      await insignia.save();
    }

    res.json({
      success: true,
      insignia: {
        nombre: insignia.nombre,
        descripcion: insignia.descripcion,
        icono: insignia.icono,
        obtenida: insignia.obtenida,
        fechaObtenida: insignia.fechaObtenida
      }
    });

  } catch (error) {
    console.error('Error obteniendo insignia:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener insignia' 
    });
  }
});

module.exports = router;
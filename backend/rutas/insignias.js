const express = require('express');
const router = express.Router();
const Insignias = require('../../datos/modelos/Insignias');
const Cuenta = require('../../datos/modelos/Cuenta');
const Ingresos = require('../../datos/modelos/Ingresos');
const { calcularNivel } = require('../../datos/utils/nivelesSystem');
const Nivel1 = require('../../datos/modelos/Nivel1');
const Nivel2 = require('../../datos/modelos/Nivel2');
const Nivel3 = require('../../datos/modelos/Nivel3');
const Nivel4 = require('../../datos/modelos/Nivel4');
const InteraccionEmpleosCuenta = require('../../datos/modelos/InteraccionEmpleosCuenta');

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

  // Verificar si ya tiene la insignia de Perfil Completo
  let insignia = await Insignias.findOne({ cuentaId, nombre: 'Perfil Completo' });

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
    const cuenta = await Cuenta.findByIdAndUpdate(cuentaId, {
      $inc: { puntos: PUNTOS_BONUS }
    }, { new: true });

    // Recalcular nivel después de otorgar puntos
    const nivelActual = cuenta.nivel || 'Novato';
    const nuevoNivel = calcularNivel(cuenta.puntos);
    
    if (nivelActual !== nuevoNivel) {
      cuenta.nivel = nuevoNivel;
      await cuenta.save();
      console.log(`¡Usuario ${cuenta.email} subió de nivel por insignia! ${nivelActual} → ${nuevoNivel}`);
    }

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

    // Buscar o crear la insignia de 'Perfil Completo' usando upsert para evitar duplicate-key
    let insignia = await Insignias.findOneAndUpdate(
      { cuentaId, nombre: 'Perfil Completo' },
      {
        $setOnInsert: {
          descripcion: '¡Has completado tu perfil al 100%!',
          icono: '🌟',
          obtenida: false
        }
      },
      { upsert: true, new: true }
    );

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

// -------------------------------------------------------------
// Ruta de reparación: otorgar retroactivamente 'Primera Postulación'
// Recorre todas las cuentas que tienen al menos una postulación y
// crea/actualiza la insignia si aún no la tienen.
// Úsala solo una vez (o cuando necesites reparar datos).
// -------------------------------------------------------------
router.post('/repair/primera-postulacion', async (req, res) => {
  try {
    // Obtener lista de cuentas con aplicaciones (estado 'postulado')
    const cuentas = await InteraccionEmpleosCuenta.distinct('cuentaId', { estado: 'postulado' });

    const resultados = [];

    for (const cuentaId of cuentas) {
      try {
        const existente = await Insignias.findOne({ cuentaId, nombre: 'Primera Postulación' });
        if (existente && existente.obtenida) {
          resultados.push({ cuentaId, estado: 'ya_tenida' });
          continue;
        }

        // Crear o actualizar insignia usando upsert para evitar error si hay índice único
        await Insignias.findOneAndUpdate(
          { cuentaId, nombre: 'Primera Postulación' },
          {
            $set: {
              obtenida: true,
              fechaObtenida: existente?.fechaObtenida || new Date()
            },
            $setOnInsert: {
              descripcion: 'Envía tu primera postulación a una oferta',
              icono: '🚀'
            }
          },
          { upsert: true, new: true }
        );

        // Otorgar puntos solo si anteriormente no estaba obtenida
        if (!existente || !existente.obtenida) {
          const BONUS_PRIMERA = 10;
          await Ingresos.create({ cuentaId, puntosGanados: BONUS_PRIMERA });
          await Cuenta.findByIdAndUpdate(cuentaId, { $inc: { puntos: BONUS_PRIMERA } });
        }

        // Para reparación retroactiva, marcar que la notificación ya fue enviada
        // así no se spamea la notificación en frontend por datos antiguos.
        try {
          const doc = await Insignias.findOne({ cuentaId, nombre: 'Primera Postulación' });
          if (doc && !doc.notificacionEnviada) {
            doc.notificacionEnviada = true;
            await doc.save();
          }
        } catch (err) {
          console.error('Error marcando notificacionEnviada en repair:', err);
        }

        resultados.push({ cuentaId, estado: 'otorgada' });
      } catch (err) {
        console.error('Error procesando cuenta en repair:', cuentaId, err);
        resultados.push({ cuentaId, estado: 'error', error: err.message });
      }
    }

    res.json({ success: true, procesadas: resultados.length, resultados });
  } catch (error) {
    console.error('Error en repair primera-postulacion:', error);
    res.status(500).json({ success: false, message: 'Error en reparación de insignias' });
  }
});
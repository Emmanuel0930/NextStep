const express = require('express');
const router = express.Router();
const Cuenta = require('../../datos/modelos/Cuenta');
const Racha = require('../../datos/modelos/Racha');

// Obtener ranking de usuarios
router.get('/ranking', async (req, res) => {
  try {
    const { limite = 20, pagina = 1, usuarioId } = req.query;
    const skip = (pagina - 1) * parseInt(limite);

    // Obtener ranking completo
    const rankingCompleto = await generarRankingCompleto();
    
    // Paginación
    const rankingPaginado = rankingCompleto.slice(skip, skip + parseInt(limite));
    const totalUsuarios = rankingCompleto.length;
    const totalPaginas = Math.ceil(totalUsuarios / limite);

    // Obtener mi posición si se proporciona usuarioId
    let miPosicion = null;
    if (usuarioId) {
      const posicionIndex = rankingCompleto.findIndex(usuario => 
        usuario.cuentaId.toString() === usuarioId
      );
      if (posicionIndex >= 0) {
        miPosicion = {
          ...rankingCompleto[posicionIndex],
          posicion: posicionIndex + 1
        };
      }
    }

    res.json({
      success: true,
      ranking: rankingPaginado,
      paginacion: {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalUsuarios,
        totalPaginas,
        hasNext: pagina < totalPaginas,
        hasPrev: pagina > 1
      },
      miPosicion
    });

  } catch (error) {
    console.error('Error obteniendo ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ranking'
    });
  }
});

// Obtener posición del usuario actual
router.get('/mi-posicion', async (req, res) => {
  try {
    const { usuarioId } = req.query;
    
    if (!usuarioId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere usuarioId'
      });
    }

    const rankingCompleto = await generarRankingCompleto();
    const posicionIndex = rankingCompleto.findIndex(usuario => 
      usuario.cuentaId.toString() === usuarioId
    );
    
    const miPosicion = posicionIndex >= 0 ? {
      ...rankingCompleto[posicionIndex],
      posicion: posicionIndex + 1
    } : null;

    res.json({
      success: true,
      miPosicion
    });

  } catch (error) {
    console.error('Error obteniendo mi posición:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener posición'
    });
  }
});

// Funciones auxiliares
function calcularPuntuacionRanking(puntos, rachaActual, nivel) {
  return puntos + (rachaActual * 10) + (nivel * 50);
}

function esActivoHoy(ultimoLogin) {
  if (!ultimoLogin) return false;
  const hoy = new Date();
  const ultimoLoginDate = new Date(ultimoLogin);
  return ultimoLoginDate.toDateString() === hoy.toDateString();
}

async function generarRankingCompleto() {
  const cuentas = await Cuenta.find({})
    .select('nombreUsuario puntos nivel porcentajePerfil lastLogin _id')
    .lean();

  const rankingCompleto = [];

  for (const cuenta of cuentas) {
    const racha = await Racha.findOne({ cuentaId: cuenta._id })
      .select('rachaActual mejorRacha totalDiasConLogin')
      .lean();

    const puntuacionTotal = calcularPuntuacionRanking(
      cuenta.puntos || 0,
      racha?.rachaActual || 0,
      cuenta.nivel || 1
    );

    rankingCompleto.push({
      cuentaId: cuenta._id,
      nombreUsuario: cuenta.nombreUsuario,
      puntos: cuenta.puntos || 0,
      nivel: cuenta.nivel || 1,
      rachaActual: racha?.rachaActual || 0,
      mejorRacha: racha?.mejorRacha || 0,
      totalDias: racha?.totalDiasConLogin || 0,
      porcentajePerfil: cuenta.porcentajePerfil || 0,
      puntuacionTotal,
      ultimoLogin: cuenta.lastLogin,
      activoHoy: esActivoHoy(cuenta.lastLogin)
    });
  }

  // Ordenar por puntuación total (descendente)
  rankingCompleto.sort((a, b) => b.puntuacionTotal - a.puntuacionTotal);
  
  // Asignar posiciones
  rankingCompleto.forEach((usuario, index) => {
    usuario.posicion = index + 1;
  });

  return rankingCompleto;
}

module.exports = router;
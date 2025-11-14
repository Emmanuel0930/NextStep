const express = require('express');
const router = express.Router();
const Empleos = require('../../datos/modelos/Empleos');
const InteraccionEmpleosCuenta = require('../../datos/modelos/InteraccionEmpleosCuenta');
const Cuenta = require('../../datos/modelos/Cuenta');

// Obtener todos los empleos
router.get('/jobs', async (req, res) => {
  try {
    console.log('Solicitud de empleos recibida');
    
    const empleos = await Empleos.find().sort({ fechaPublicacion: -1 }).lean();
    
    console.log(`Empleos encontrados en BD: ${empleos.length}`);
    
    // Mapear ambos idiomas para compatibilidad
    const empleosFormateados = empleos.map(empleo => {
      const empleoObj = {
        id: empleo._id.toString(),
        nombre: empleo.nombre || empleo.title || '',
        ciudad: empleo.ciudad || empleo.city || '',
        sueldo: empleo.sueldo || empleo.salary || 0,
        descripcion: empleo.descripcion || empleo.description || '',
        palabrasClave: Array.isArray(empleo.palabrasClave) ? empleo.palabrasClave : 
                       Array.isArray(empleo.keywords) ? empleo.keywords : [],
        habilidades: Array.isArray(empleo.habilidades) ? empleo.habilidades : 
                     Array.isArray(empleo.skills) ? empleo.skills : [],
        añosExperiencia: empleo.añosExperiencia || empleo.experience || 0,
        fechaPublicacion: empleo.fechaPublicacion || empleo.publishDate || new Date(),
        
        ...(empleo.company && { empresa: empleo.company }),
        ...(empleo.contract && { tipoContrato: empleo.contract })
      };
      
      console.log('Empleo formateado:', {
        id: empleoObj.id,
        nombre: empleoObj.nombre,
        ciudad: empleoObj.ciudad,
        sueldo: empleoObj.sueldo,
        empresa: empleoObj.empresa
      });
      
      return empleoObj;
    });
    
    res.json(empleosFormateados);
  } catch (error) {
    console.error('Error obteniendo empleos:', error);
    res.status(500).json({ 
      error: "Error obteniendo empleos",
      mensaje: error.message 
    });
  }
});

// Obtener un empleo específico
router.get('/jobs/:id', async (req, res) => {
  try {
    const empleo = await Empleos.findById(req.params.id).lean();
    
    if (!empleo) {
      return res.status(404).json({ error: 'Empleo no encontrado' });
    }
    
    const empleoFormateado = {
      id: empleo._id.toString(),
      nombre: empleo.nombre || empleo.title || '',
      ciudad: empleo.ciudad || empleo.city || '',
      sueldo: empleo.sueldo || empleo.salary || 0,
      descripcion: empleo.descripcion || empleo.description || '',
      palabrasClave: Array.isArray(empleo.palabrasClave) ? empleo.palabrasClave : 
                     Array.isArray(empleo.keywords) ? empleo.keywords : [],
      habilidades: Array.isArray(empleo.habilidades) ? empleo.habilidades : 
                   Array.isArray(empleo.skills) ? empleo.skills : [],
      añosExperiencia: empleo.añosExperiencia || empleo.experience || 0,
      fechaPublicacion: empleo.fechaPublicacion || empleo.publishDate || new Date(),
      ...(empleo.company && { empresa: empleo.company }),
      ...(empleo.contract && { tipoContrato: empleo.contract })
    };
    
    res.json(empleoFormateado);
  } catch (error) {
    console.error('Error obteniendo empleo:', error);
    res.status(500).json({ 
      error: "Error obteniendo empleo",
      mensaje: error.message 
    });
  }
});

// Marcar o desmarcar favorito para un empleo por un usuario
router.post('/jobs/:id/favorito', async (req, res) => {
  try {
    const empleoId = req.params.id;
    const { cuentaId, favorito } = req.body;

    if (!cuentaId) {
      return res.status(400).json({ success: false, message: 'Falta cuentaId en el cuerpo' });
    }

    // Buscar interacción existente y actualizar o crear
    const interaccion = await InteraccionEmpleosCuenta.findOneAndUpdate(
      { cuentaId, empleoId },
      { $set: { favorito: !!favorito, estado: 'guardado' } },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: favorito ? 'Empleo marcado como favorito' : 'Empleo desmarcado como favorito', interaccion });
  } catch (error) {
    console.error('Error marcando favorito:', error);
    res.status(500).json({ success: false, message: 'Error marcando favorito', error: error.message });
  }
});

router.post('/jobs/:id/revisar', async (req, res) => {
  try {
    const { cuentaId } = req.body;

    if (!cuentaId) {
      return res.status(400).json({ success: false, message: 'Falta cuentaId' });
    }

    const cuenta = await Cuenta.findById(cuentaId);
    if (!cuenta) {
      return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const ultimaFecha = cuenta.puntosRevisiones?.ultimaFecha 
      ? new Date(cuenta.puntosRevisiones.ultimaFecha) 
      : null;
    
    if (ultimaFecha) {
      ultimaFecha.setHours(0, 0, 0, 0);
    }

    if (!ultimaFecha || ultimaFecha.getTime() !== hoy.getTime()) {
      cuenta.puntosRevisiones = {
        puntosDia: 0,
        vacantesRevisiadas: 0,
        ultimaFecha: hoy
      };
    }

    if (cuenta.puntosRevisiones.vacantesRevisiadas >= 10) {
      return res.json({ 
        success: false, 
        message: 'Límite diario alcanzado',
        puntosGanados: 0,
        puntosHoy: cuenta.puntosRevisiones.puntosDia,
        vacantesRevisiadas: cuenta.puntosRevisiones.vacantesRevisiadas,
        limiteAlcanzado: true
      });
    }

    const puntosGanados = 5;
    cuenta.puntosRevisiones.puntosDia += puntosGanados;
    cuenta.puntosRevisiones.vacantesRevisiadas += 1;
    cuenta.puntos += puntosGanados;

    await cuenta.save();

    res.json({ 
      success: true, 
      puntosGanados,
      puntosHoy: cuenta.puntosRevisiones.puntosDia,
      puntosTotal: cuenta.puntos,
      vacantesRevisiadas: cuenta.puntosRevisiones.vacantesRevisiadas,
      limiteAlcanzado: cuenta.puntosRevisiones.vacantesRevisiadas >= 10
    });

  } catch (error) {
    console.error('Error registrando revisión:', error);
    res.status(500).json({ success: false, message: 'Error al registrar revisión' });
  }
});

module.exports = router;
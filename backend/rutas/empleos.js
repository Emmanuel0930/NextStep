const express = require('express');
const router = express.Router();
const Empleos = require('../../datos/modelos/Empleos');

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

module.exports = router;
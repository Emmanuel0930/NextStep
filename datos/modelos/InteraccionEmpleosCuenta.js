const mongoose = require('mongoose');

const InteraccionEmpleosCuenta = new mongoose.Schema({
  cuentaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cuenta', 
    required: true 
  },
  empleoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Empleos', 
    required: true 
  },
  estado: { 
    type: String, 
    enum: ['guardado', 'postulado'],
    default: 'guardado'
  },
  favorito: { 
    type: Boolean, 
    default: false 
  },
  comentario: String,
  calificacion: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  fechaPostulacion: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('InteraccionEmpleosCuenta', InteraccionEmpleosCuenta);
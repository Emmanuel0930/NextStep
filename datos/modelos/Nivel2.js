const mongoose = require('mongoose');

const Nivel2Schema = new mongoose.Schema({
  cuentaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cuenta', 
    required: true 
  },
  experiencias: [{
    titulo: String,
    funciones: [String],
    duracion: Number 
  }],
  experienciaTotal: Number, 
  completado: { 
    type: Boolean, 
    default: false 
  }
});

module.exports = mongoose.model('Nivel2', Nivel2Schema);
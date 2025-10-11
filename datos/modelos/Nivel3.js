const mongoose = require('mongoose');

const Nivel3Schema = new mongoose.Schema({
  cuentaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cuenta', 
    required: true 
  },
  descripcionPerfil: String,
  habilidades: [String],
  completado: { 
    type: Boolean, 
    default: false 
  }
});

module.exports = mongoose.model('Nivel3', Nivel3Schema);
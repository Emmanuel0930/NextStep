const mongoose = require('mongoose');

const Nivel4Schema = new mongoose.Schema({
  cuentaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cuenta', 
    required: true 
  },
  idiomas: [String], 
  referencias: [String], 
  completado: { 
    type: Boolean, 
    default: false 
  }
});

module.exports = mongoose.model('Nivel4', Nivel4Schema);
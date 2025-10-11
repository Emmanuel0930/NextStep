const mongoose = require('mongoose');

const Nivel1Schema = new mongoose.Schema({
  cuentaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cuenta', 
    required: true 
  },
  sector: [String],
  cargo: String,
  salarioDeseado: Number,
  estudios: String,
  ciudad: String,
  disponibilidad: String,
  completado: { 
    type: Boolean, 
    default: false 
  }
});

module.exports = mongoose.model('Nivel1', Nivel1Schema);
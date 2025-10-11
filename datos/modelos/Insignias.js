const mongoose = require('mongoose');

const InsigniasSchema = new mongoose.Schema({
  cuentaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cuenta', 
    required: true 
  },
  nombre: {
    type: String,
    default: 'Perfil Completo'
  },
  descripcion: {
    type: String,
    default: '¡Has completado tu perfil al 100%!'
  },
  icono: {
    type: String,
    default: '🌟'
  },
  obtenida: { 
    type: Boolean, 
    default: false 
  },
  fechaObtenida: {
    type: Date
  }
}, {
  timestamps: true
});


InsigniasSchema.index({ cuentaId: 1 }, { unique: true });

module.exports = mongoose.model('Insignias', InsigniasSchema);
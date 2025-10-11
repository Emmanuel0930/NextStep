const mongoose = require('mongoose');

const NotificacionSchema = new mongoose.Schema({
  cuentaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cuenta', 
    required: true 
  },
  titulo: String,
  descripcion: String,
  leida: { 
    type: Boolean, 
    default: false 
  },
  fecha: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Notificacion', NotificacionSchema);
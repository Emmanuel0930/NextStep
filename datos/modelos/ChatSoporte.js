const mongoose = require('mongoose');

const ChatSoporteSchema = new mongoose.Schema({
  cuentaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cuenta', 
    required: true 
  },
  consulta: String,
  fecha: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('ChatSoporte', ChatSoporteSchema);
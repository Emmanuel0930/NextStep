const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  cuentaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cuenta', required: true },
  autor: { type: String, enum: ['user', 'ai', 'system'], required: true },
  texto: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  meta: { type: Object }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);

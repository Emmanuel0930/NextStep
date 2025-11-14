const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema({
  cuentaId: {
    type: String,
    required: true,
    index: true
  },
  autor: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  texto: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Índice compuesto para búsquedas eficientes
mensajeSchema.index({ cuentaId: 1, fecha: -1 });

module.exports = mongoose.model('Mensaje', mensajeSchema);

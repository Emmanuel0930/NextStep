const mongoose = require('mongoose');

const cuentaSchema = new mongoose.Schema({
  // ...existing code...
  puntos: {
    type: Number,
    default: 0,
    min: 0
  },
  nivel: {
    type: Number,
    default: 1
  }
  // ...existing code...
});

module.exports = mongoose.model('Cuenta', cuentaSchema);
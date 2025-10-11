const mongoose = require('mongoose');

const IngresosSchema = new mongoose.Schema({
  cuentaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cuenta', 
    required: true 
  },
  puntosGanados: {
    type: Number,
    default: 0
  },
  fecha: { 
    type: Date, 
    default: Date.now 
  }
});

IngresosSchema.index({ cuentaId: 1, fecha: -1 });

module.exports = mongoose.model('Ingresos', IngresosSchema);
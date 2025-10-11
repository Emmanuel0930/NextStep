const mongoose = require('mongoose');

const CuentaSchema = new mongoose.Schema({
  nombreUsuario: { 
    type: String, 
    required: [true, 'El nombre de usuario es requerido'], 
    unique: true,
    trim: true,
    minlength: [3, 'El usuario debe tener al menos 3 caracteres']
  },
  correo: { 
    type: String, 
    required: [true, 'El correo es requerido'], 
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un correo válido']
  },
  contraseña: { 
    type: String, 
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  puntos: { 
    type: Number, 
    default: 0 
  },
  nivel: { 
    type: Number, 
    default: 1 
  },
  porcentajePerfil: { 
    type: Number, 
    default: 20,
    min: 0,
    max: 100
  },
  amigos: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cuenta' 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLogin: { 
    type: Date, 
    default: Date.now 
  }
});

//Actualizar último login
CuentaSchema.methods.actualizarLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

//Agregar puntos
CuentaSchema.methods.agregarPuntos = function(puntos) {
  this.puntos += puntos;
  return this.save();
};
//Agregar a la base de datos
module.exports = mongoose.model('Cuenta', CuentaSchema);


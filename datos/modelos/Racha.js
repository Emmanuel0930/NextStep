const mongoose = require('mongoose');

const rachaSchema = new mongoose.Schema({
  cuentaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cuenta',
    required: true,
    unique: true
  },
  rachaActual: {
    type: Number,
    default: 0,
    min: 0
  },
  mejorRacha: {
    type: Number,
    default: 0,
    min: 0
  },
  ultimoLogin: {
    type: Date,
    default: Date.now
  },
  fechaInicioRachaActual: {
    type: Date,
    default: Date.now
  },
  fechaMejorRacha: {
    type: Date,
    default: Date.now
  },
  // Configuración de notificaciones
  notificacionesActivas: {
    type: Boolean,
    default: true
  },
  horaNotificacion: {
    type: String, // Formato "HH:MM" (ej: "19:00")
    default: "19:00"
  },
  // Estadísticas adicionales
  totalDiasConLogin: {
    type: Number,
    default: 0
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Método para verificar si el usuario debe mantener su racha
rachaSchema.methods.debeIncrementarRacha = function() {
  const ahora = new Date();
  const ultimoLogin = new Date(this.ultimoLogin);
  
  // Calcular diferencia en horas
  const diferenciaHoras = (ahora - ultimoLogin) / (1000 * 60 * 60);
  
  // Si el último login fue hace menos de 24 horas, mantener racha
  return diferenciaHoras < 24;
};

// Método para verificar si es un nuevo día
rachaSchema.methods.esNuevoDia = function() {
  const ahora = new Date();
  const ultimoLogin = new Date(this.ultimoLogin);
  
  // Verificar si es un día diferente (considerando medianoche)
  return ahora.toDateString() !== ultimoLogin.toDateString();
};

// Método para actualizar racha
rachaSchema.methods.actualizarRacha = function() {
  const ahora = new Date();
  
  if (this.esNuevoDia()) {
    if (this.debeIncrementarRacha()) {
      // Incrementar racha si es un nuevo día dentro de las 24h
      this.rachaActual += 1;
      this.totalDiasConLogin += 1;
      
      // Actualizar mejor racha si es necesario
      if (this.rachaActual > this.mejorRacha) {
        this.mejorRacha = this.rachaActual;
        this.fechaMejorRacha = ahora;
      }
      
      // Si es el primer día de una nueva racha
      if (this.rachaActual === 1) {
        this.fechaInicioRachaActual = ahora;
      }
    } else {
      // Reiniciar racha si pasaron más de 24h
      this.rachaActual = 1; // Iniciar nueva racha con el login de hoy
      this.fechaInicioRachaActual = ahora;
      this.totalDiasConLogin += 1;
    }
  }
  // Si es el mismo día, no hacer nada (evitar múltiples incrementos)
  
  this.ultimoLogin = ahora;
  return this;
};

// Método para obtener estadísticas
rachaSchema.methods.obtenerEstadisticas = function() {
  return {
    rachaActual: this.rachaActual,
    mejorRacha: this.mejorRacha,
    totalDiasConLogin: this.totalDiasConLogin,
    fechaInicioRachaActual: this.fechaInicioRachaActual,
    fechaMejorRacha: this.fechaMejorRacha,
    ultimoLogin: this.ultimoLogin,
    notificacionesActivas: this.notificacionesActivas,
    horaNotificacion: this.horaNotificacion
  };
};

// Índices para optimizar consultas
rachaSchema.index({ cuentaId: 1 });
rachaSchema.index({ ultimoLogin: -1 });
rachaSchema.index({ rachaActual: -1 });

module.exports = mongoose.model('Racha', rachaSchema);
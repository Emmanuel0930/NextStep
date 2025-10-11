const mongoose = require('mongoose');

const EmpleosSchema = new mongoose.Schema({

  nombre: String,
  ciudad: String,
  sueldo: Number,
  descripcion: String,
  palabrasClave: [String],
  habilidades: [String],
  añosExperiencia: Number,
  fechaPublicacion: { 
    type: Date, 
    default: Date.now 
  },
  
  title: String,
  city: String,
  salary: Number,
  description: String,
  keywords: [String],
  skills: [String],
  experience: Number,
  company: String,
  contract: String
}, {

  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

EmpleosSchema.virtual('nombreCompleto').get(function() {
  return this.nombre || this.title || '';
});

module.exports = mongoose.model('Empleos', EmpleosSchema);
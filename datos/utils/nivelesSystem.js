// Tabla de niveles del sistema
const NIVELES_TABLA = [
  {
    nivel: 1,
    nombre: "Novato",
    puntosMinimos: 0,
    puntosMaximos: 199,
    color: "gray",
    icono: "🌱",
    descripcion: "Comenzando tu viaje profesional"
  },
  {
    nivel: 2,
    nombre: "Aprendiz",
    puntosMinimos: 200,
    puntosMaximos: 399,
    color: "blue",
    icono: "📚",
    descripcion: "Adquiriendo nuevas habilidades"
  },
  {
    nivel: 3,
    nombre: "Competente",
    puntosMinimos: 400,
    puntosMaximos: 699,
    color: "green",
    icono: "⚡",
    descripcion: "Desarrollando experiencia sólida"
  },
  {
    nivel: 4,
    nombre: "Intermedio",
    puntosMinimos: 700,
    puntosMaximos: 999,
    color: "orange",
    icono: "🔥",
    descripcion: "Dominando habilidades clave"
  },
  {
    nivel: 5,
    nombre: "Avanzado",
    puntosMinimos: 1000,
    puntosMaximos: 1499,
    color: "purple",
    icono: "💎",
    descripcion: "Experto en tu área"
  },
  {
    nivel: 6,
    nombre: "Experto",
    puntosMinimos: 1500,
    puntosMaximos: 2499,
    color: "indigo",
    icono: "🏆",
    descripcion: "Maestría profesional alcanzada"
  },
  {
    nivel: 7,
    nombre: "Maestro",
    puntosMinimos: 2500,
    puntosMaximos: 4999,
    color: "pink",
    icono: "👑",
    descripcion: "Líder reconocido en tu campo"
  },
  {
    nivel: 8,
    nombre: "Leyenda",
    puntosMinimos: 5000,
    puntosMaximos: 9999,
    color: "yellow",
    icono: "🌟",
    descripcion: "Referente de la industria"
  },
  {
    nivel: 9,
    nombre: "Elite",
    puntosMinimos: 10000,
    puntosMaximos: 19999,
    color: "red",
    icono: "🚀",
    descripcion: "Top 1% de profesionales"
  },
  {
    nivel: 10,
    nombre: "Inmortal",
    puntosMinimos: 20000,
    puntosMaximos: 999999,
    color: "gradient",
    icono: "💫",
    descripcion: "Nivel legendario supremo"
  }
];

// Función para calcular nivel basado en puntos
const calcularNivel = (puntos) => {
  for (let i = NIVELES_TABLA.length - 1; i >= 0; i--) {
    const nivel = NIVELES_TABLA[i];
    if (puntos >= nivel.puntosMinimos) {
      return nivel;
    }
  }
  return NIVELES_TABLA[0]; // Novato por defecto
};

// Función para obtener siguiente nivel
const getSiguienteNivel = (puntos) => {
  const nivelActual = calcularNivel(puntos);
  const siguienteIndex = NIVELES_TABLA.findIndex(n => n.nivel === nivelActual.nivel) + 1;
  
  if (siguienteIndex < NIVELES_TABLA.length) {
    return NIVELES_TABLA[siguienteIndex];
  }
  return null; // Ya está en el nivel máximo
};

// Función para calcular progreso hacia siguiente nivel
const calcularProgreso = (puntos) => {
  const nivelActual = calcularNivel(puntos);
  const siguienteNivel = getSiguienteNivel(puntos);
  
  if (!siguienteNivel) {
    return 100; // Nivel máximo alcanzado
  }
  
  const puntosEnNivel = puntos - nivelActual.puntosMinimos;
  const puntosNecesarios = siguienteNivel.puntosMinimos - nivelActual.puntosMinimos;
  
  return Math.round((puntosEnNivel / puntosNecesarios) * 100);
};

// Función para obtener colores de Tailwind según el nivel
const getColorClasses = (color) => {
  const colores = {
    gray: {
      bg: 'bg-gray-500',
      text: 'text-gray-600',
      border: 'border-gray-300',
      gradient: 'from-gray-400 to-gray-600'
    },
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      border: 'border-blue-300',
      gradient: 'from-blue-400 to-blue-600'
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-green-600',
      border: 'border-green-300',
      gradient: 'from-green-400 to-green-600'
    },
    orange: {
      bg: 'bg-orange-500',
      text: 'text-orange-600',
      border: 'border-orange-300',
      gradient: 'from-orange-400 to-orange-600'
    },
    purple: {
      bg: 'bg-purple-500',
      text: 'text-purple-600',
      border: 'border-purple-300',
      gradient: 'from-purple-400 to-purple-600'
    },
    indigo: {
      bg: 'bg-indigo-500',
      text: 'text-indigo-600',
      border: 'border-indigo-300',
      gradient: 'from-indigo-400 to-indigo-600'
    },
    pink: {
      bg: 'bg-pink-500',
      text: 'text-pink-600',
      border: 'border-pink-300',
      gradient: 'from-pink-400 to-pink-600'
    },
    yellow: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-600',
      border: 'border-yellow-300',
      gradient: 'from-yellow-400 to-yellow-600'
    },
    red: {
      bg: 'bg-red-500',
      text: 'text-red-600',
      border: 'border-red-300',
      gradient: 'from-red-400 to-red-600'
    },
    gradient: {
      bg: 'bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500',
      text: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600',
      border: 'border-purple-300',
      gradient: 'from-purple-500 via-pink-500 to-yellow-500'
    }
  };
  
  return colores[color] || colores.gray;
};

module.exports = {
  NIVELES_TABLA,
  calcularNivel,
  getSiguienteNivel,
  calcularProgreso,
  getColorClasses
};
// Tabla de niveles del sistema - Frontend
export const NIVELES_TABLA = [
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
export const calcularNivel = (puntos) => {
  for (let i = NIVELES_TABLA.length - 1; i >= 0; i--) {
    const nivel = NIVELES_TABLA[i];
    if (puntos >= nivel.puntosMinimos) {
      return nivel;
    }
  }
  return NIVELES_TABLA[0]; // Novato por defecto
};

// Función para obtener siguiente nivel
export const getSiguienteNivel = (puntos) => {
  const nivelActual = calcularNivel(puntos);
  const siguienteIndex = NIVELES_TABLA.findIndex(n => n.nivel === nivelActual.nivel) + 1;
  
  if (siguienteIndex < NIVELES_TABLA.length) {
    return NIVELES_TABLA[siguienteIndex];
  }
  return null; // Ya está en el nivel máximo
};

// Función para calcular progreso hacia siguiente nivel
export const calcularProgreso = (puntos) => {
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
export const getColorClasses = (color) => {
  const colores = {
    gray: {
      bg: 'bg-gray-500',
      text: 'text-gray-600',
      border: 'border-gray-300',
      gradient: 'from-gray-400 to-gray-600',
      light: 'bg-gray-50',
      ring: 'ring-gray-200'
    },
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      border: 'border-blue-300',
      gradient: 'from-blue-400 to-blue-600',
      light: 'bg-blue-50',
      ring: 'ring-blue-200'
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-green-600',
      border: 'border-green-300',
      gradient: 'from-green-400 to-green-600',
      light: 'bg-green-50',
      ring: 'ring-green-200'
    },
    orange: {
      bg: 'bg-orange-500',
      text: 'text-orange-600',
      border: 'border-orange-300',
      gradient: 'from-orange-400 to-orange-600',
      light: 'bg-orange-50',
      ring: 'ring-orange-200'
    },
    purple: {
      bg: 'bg-tertiaryBrand-purple400',
      text: 'text-tertiaryBrand-purple400',
      border: 'border-tertiaryBrand-purple200',
      gradient: 'from-tertiaryBrand-purple400 to-secondaryBrand-500',
      light: 'bg-tertiaryBrand-purple50',
      ring: 'ring-tertiaryBrand-purple200'
    },
    indigo: {
      bg: 'bg-indigo-500',
      text: 'text-indigo-600',
      border: 'border-indigo-300',
      gradient: 'from-indigo-400 to-indigo-600',
      light: 'bg-indigo-50',
      ring: 'ring-indigo-200'
    },
    pink: {
      bg: 'bg-pink-500',
      text: 'text-pink-600',
      border: 'border-pink-300',
      gradient: 'from-pink-400 to-pink-600',
      light: 'bg-pink-50',
      ring: 'ring-pink-200'
    },
    yellow: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-600',
      border: 'border-yellow-300',
      gradient: 'from-yellow-400 to-yellow-600',
      light: 'bg-yellow-50',
      ring: 'ring-yellow-200'
    },
    red: {
      bg: 'bg-red-500',
      text: 'text-red-600',
      border: 'border-red-300',
      gradient: 'from-red-400 to-red-600',
      light: 'bg-red-50',
      ring: 'ring-red-200'
    },
    gradient: {
      bg: 'bg-gradient-to-r from-tertiaryBrand-purple400 via-secondaryBrand-500 to-tertiaryBrand-green400',
      text: 'text-transparent bg-clip-text bg-gradient-to-r from-tertiaryBrand-purple400 via-secondaryBrand-500 to-tertiaryBrand-green400',
      border: 'border-tertiaryBrand-purple200',
      gradient: 'from-tertiaryBrand-purple400 via-secondaryBrand-500 to-tertiaryBrand-green400',
      light: 'bg-gradient-to-r from-tertiaryBrand-purple50 via-secondaryBrand-50 to-tertiaryBrand-green50',
      ring: 'ring-tertiaryBrand-purple200'
    }
  };
  
  return colores[color] || colores.gray;
};

// Hook personalizado para manejar niveles
export const useNiveles = (puntos) => {
  const nivelActual = calcularNivel(puntos);
  const siguienteNivel = getSiguienteNivel(puntos);
  const progreso = calcularProgreso(puntos);
  const colores = getColorClasses(nivelActual.color);
  
  const puntosParaSiguienteNivel = siguienteNivel 
    ? siguienteNivel.puntosMinimos - puntos
    : 0;
    
  return {
    nivelActual,
    siguienteNivel,
    progreso,
    colores,
    puntosParaSiguienteNivel,
    esNivelMaximo: !siguienteNivel
  };
};
// frontend/src/services/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para manejo de errores global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ Error en API:', error);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      console.error('Sin respuesta del servidor');
    } else {
      console.error('Error configurando request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Interceptor para añadir el token automáticamente a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============ FUNCIONES DE AUTENTICACIÓN ============

export const login = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async ({ nombreUsuario, correo, contraseña }) => {
  try {
    const response = await api.post('/registro', { nombreUsuario, correo, contraseña });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ FUNCIONES DE EMPLEOS ============
/**
 * Obtener lista de empleos desde la base de datos
 * @returns {Promise<Array>} Lista de empleos con todos sus campos
 */
export const getJobs = async () => {
  try {
    console.log('🔄 Solicitando empleos desde:', `${API_BASE_URL}/jobs`);
    const response = await api.get('/jobs');
    
    console.log('✅ Respuesta recibida:', {
      status: response.status,
      cantidadEmpleos: response.data.length,
      primerEmpleo: response.data[0]
    });
    
    // Verificar que la respuesta sea un array
    if (!Array.isArray(response.data)) {
      console.error('❌ La respuesta no es un array:', response.data);
      throw new Error('Formato de respuesta inválido');
    }
    
    // Validar estructura de cada empleo
    response.data.forEach((job, index) => {
      if (!job.id && !job._id) {
        console.warn(`⚠️ Empleo ${index} sin ID:`, job);
      }
      console.log(`📋 Empleo ${index + 1}:`, {
        id: job.id,
        nombre: job.nombre,
        ciudad: job.ciudad,
        sueldo: job.sueldo,
        habilidades: job.habilidades?.length || 0,
        palabrasClave: job.palabrasClave?.length || 0
      });
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error en getJobs:', error.message);
    throw error;
  }
};

/**
 * Obtener un empleo específico por ID
 * @param {string} id - ID del empleo
 * @returns {Promise<Object>} Datos del empleo
 */
export const getJobById = async (id) => {
  try {
    console.log('🔄 Solicitando empleo con ID:', id);
    const response = await api.get(`/jobs/${id}`);
    console.log('✅ Empleo recibido:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error en getJobById:', error);
    throw error;
  }
};

/**
 * Marcar o desmarcar favorito para un empleo por un usuario
 * @param {string} empleoId
 * @param {string} cuentaId
 * @param {boolean} favorito
 */
export const toggleFavorite = async (empleoId, cuentaId, favorito) => {
  try {
    const response = await api.post(`/jobs/${empleoId}/favorito`, { cuentaId, favorito });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener empleos favoritos de un usuario
 * @param {string} cuentaId
 */
export const getFavorites = async (cuentaId) => {
  try {
    const response = await api.get(`/perfil/${cuentaId}/favoritos`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Buscar empleos por query
 * @param {string} query - Término de búsqueda
 * @returns {Promise<Array>} Lista de empleos filtrados
 */
export const searchJobs = async (query) => {
  try {
    console.log('🔍 Buscando empleos con query:', query);
    const jobs = await getJobs();
    
    if (!query || query.trim() === '') {
      return jobs;
    }
    
    const queryLower = query.toLowerCase().trim();
    
    const filteredJobs = jobs.filter(job => {
      // Buscar en nombre
      if (job.nombre && job.nombre.toLowerCase().includes(queryLower)) {
        return true;
      }
      
      // Buscar en ciudad
      if (job.ciudad && job.ciudad.toLowerCase().includes(queryLower)) {
        return true;
      }
      
      // Buscar en descripción
      if (job.descripcion && job.descripcion.toLowerCase().includes(queryLower)) {
        return true;
      }
      
      // Buscar en palabras clave
      if (Array.isArray(job.palabrasClave)) {
        if (job.palabrasClave.some(palabra => 
          palabra && palabra.toLowerCase().includes(queryLower)
        )) {
          return true;
        }
      }
      
      // Buscar en habilidades
      if (Array.isArray(job.habilidades)) {
        if (job.habilidades.some(habilidad => 
          habilidad && habilidad.toLowerCase().includes(queryLower)
        )) {
          return true;
        }
      }
      
      return false;
    });
    
    console.log(`✅ Encontrados ${filteredJobs.length} empleos para "${query}"`);
    return filteredJobs;
  } catch (error) {
    console.error('Error en searchJobs:', error);
    throw error;
  }
};

// ============ FUNCIONES DE DASHBOARD ============

export const getDashboardData = async (usuarioId) => {
  try {
    const response = await api.get(`/dashboard?usuarioId=${usuarioId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStreak = async (usuarioId) => {
  try {
    const response = await api.get(`/streak?usuarioId=${usuarioId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStats = async (usuarioId) => {
  try {
    const response = await api.get(`/stats?usuarioId=${usuarioId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ FUNCIONES DE CHAT ============

export async function getChatHistory(cuentaId, limit = 200) {
  const response = await api.get(`/chat/history/${cuentaId}?limit=${limit}`);
  return response.data;
}

export async function sendChatMessage(cuentaId, texto) {
  const response = await api.post('/chat/send', { cuentaId, texto });
  return response.data;
}

export default api;
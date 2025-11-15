import axios from "axios";
import config from '../config';

const API_BASE_URL = config.API_URL;

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

export const toggleFavorite = async (empleoId, cuentaId, favorito) => {
  try {
    const response = await api.post(`/jobs/${empleoId}/favorito`, { cuentaId, favorito });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFavorites = async (cuentaId) => {
  try {
    const response = await api.get(`/perfil/${cuentaId}/favoritos`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const reviewJob = async (empleoId, cuentaId) => {
  try {
    console.log('🔍 Revisando empleo:', { empleoId, cuentaId });
    const response = await api.post(`/jobs/${empleoId}/revisar`, { cuentaId });
    console.log('✅ Respuesta de revisión:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error revisando empleo:', error);
    throw error;
  }
};

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

// ============ FUNCIONES DE CALIFICACIONES ============

/**
 * Calificar un empleo
 * @param {string} cuentaId - ID del usuario
 * @param {string} empleoId - ID del empleo
 * @param {number} calificacion - Calificación de 1 a 5 estrellas
 * @param {string} comentario - Comentario opcional
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const calificarEmpleo = async (cuentaId, empleoId, calificacion, comentario) => {
  try {
    console.log('⭐ Enviando calificación:', { cuentaId, empleoId, calificacion, comentario });
    
    const response = await api.post('/calificaciones/calificar', {
      cuentaId,
      empleoId,
      calificacion,
      comentario
    });
    
    console.log('✅ Calificación guardada:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error calificando empleo:', error);
    throw error;
  }
};

/**
 * Obtener promedio de calificaciones de un empleo
 * @param {string} empleoId - ID del empleo
 * @returns {Promise<Object>} Datos del promedio
 */
export const getPromedioCalificaciones = async (empleoId) => {
  try {
    console.log('📊 Solicitando promedio para empleo:', empleoId);
    
    const response = await api.get(`/calificaciones/empleos/${empleoId}/promedio`);
    
    console.log('✅ Promedio recibido:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo promedio:', error);
    throw error;
  }
};

/**
 * Obtener calificación del usuario para un empleo
 * @param {string} empleoId - ID del empleo
 * @param {string} cuentaId - ID del usuario
 * @returns {Promise<Object>} Calificación del usuario
 */
export const getCalificacionUsuario = async (empleoId, cuentaId) => {
  try {
    console.log('👤 Solicitando calificación usuario:', { empleoId, cuentaId });
    
    const response = await api.get(`/calificaciones/usuario/${empleoId}?cuentaId=${cuentaId}`);
    
    console.log('✅ Calificación usuario recibida:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo calificación usuario:', error);
    throw error;
  }
};

// ============ FUNCIONES DE RANKING ============

/**
 * Obtener ranking de usuarios
 * @param {number} limite - Número de usuarios por página
 * @param {number} pagina - Página actual
 * @returns {Promise<Object>} Datos del ranking
 */
export const getRanking = async (limite = 20, pagina = 1) => {
  try {
    const response = await api.get(`/ranking/ranking?limite=${limite}&pagina=${pagina}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo ranking:', error);
    throw error;
  }
};

/**
 * Obtener posición del usuario actual en el ranking
 * @param {string} usuarioId - ID del usuario
 * @returns {Promise<Object>} Posición del usuario
 */
export const getMiPosicionRanking = async (usuarioId) => {
  try {
    const response = await api.get(`/ranking/mi-posicion?usuarioId=${usuarioId}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo mi posición:', error);
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

export default api;
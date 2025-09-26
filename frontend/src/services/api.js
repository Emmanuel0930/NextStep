import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para manejo de errores global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en API:', error);
    return Promise.reject(error);
  }
);

// ============ FUNCIONES DE AUTENTICACIÓN ============

/**
 * Iniciar sesión con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise} Respuesta del servidor
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/login', {
      email,
      password
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ FUNCIONES DE EMPLEOS ============

/**
 * Obtener lista de empleos
 * @returns {Promise} Lista de empleos disponibles
 */
export const getJobs = async () => {
  try {
    const response = await api.get('/jobs');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Buscar empleos por query
 * @param {string} query - Término de búsqueda
 * @returns {Promise} Lista de empleos filtrados
 */
export const searchJobs = async (query) => {
  try {
    // Por ahora usar el endpoint existente y filtrar en el cliente
    // En el futuro se podría agregar: `/jobs/search?q=${query}`
    const response = await api.get('/jobs');
    const jobs = response.data;
    
    if (!query) return jobs;
    
    return jobs.filter(job => 
      job.title.toLowerCase().includes(query.toLowerCase()) ||
      job.company.toLowerCase().includes(query.toLowerCase()) ||
      job.city.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    throw error;
  }
};

// ============ FUNCIONES DE DASHBOARD ============

/**
 * Obtener datos del dashboard
 * @returns {Promise} Datos del dashboard (aplicaciones y trabajos recomendados)
 */
export const getDashboardData = async () => {
  try {
    const response = await api.get('/dashboard');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ UTILIDADES ============

// Exportar instancia de axios configurada para uso avanzado
export { api };

// Exportar URL base para casos específicos
export { API_BASE_URL };

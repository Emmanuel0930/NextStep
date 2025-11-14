import { useState, useEffect } from "react";
import { X, MapPin, DollarSign, Clock, User, CheckCircle, FileText, WifiOff, Wifi } from "lucide-react";
import { getJobs } from "../services/api";
import SearchComponent from "../components/Search";
import { useNotification } from "../components/NotificationProvider";
import { offlineCache } from "../utils/offlineCache";


export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [usingCache, setUsingCache] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (usingCache) {
        fetchJobs();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [usingCache]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");
      setUsingCache(false);
      
      const jobsData = await getJobs();
      
      console.log('Jobs.js - Datos recibidos:', jobsData);
      console.log('Total empleos:', jobsData.length);
      
      if (jobsData.length > 0) {
        console.log('Primer empleo completo:', jobsData[0]);
      }
      
      setJobs(jobsData);
      setFilteredJobs(jobsData);
      offlineCache.saveJobs(jobsData);
      
    } catch (error) {
      console.error('Error al cargar empleos:', error);
      
      const cachedJobs = offlineCache.getJobs();
      if (cachedJobs && cachedJobs.length > 0) {
        console.log('Usando cache offline');
        setJobs(cachedJobs);
        setFilteredJobs(cachedJobs);
        setUsingCache(true);
        setError("Sin conexión. Mostrando vacantes guardadas.");
      } else {
        setError("Error al cargar los empleos. Verifica tu conexión e intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Abrir automáticamente el modal si hay jobId en la URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('jobId');
    if (jobId && jobs.length > 0) {
      const job = jobs.find(j => String(j.id) === String(jobId));
      if (job) {
        setSelectedJob(job);
        setShowModal(true);
      }
    }
  }, [jobs]);

  // Manejar búsqueda y filtros combinados
  useEffect(() => {
    const performSearch = async () => {
      setSearchLoading(true);
      
      let results = jobs;

      // Filtrar por búsqueda de texto
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase().trim();
        results = results.filter((job) => {
          const searchableFields = [
            job.nombre || '',
            job.ciudad || '',
            job.descripcion || '',
            job.empresa || '',
            ...(Array.isArray(job.palabrasClave) ? job.palabrasClave : []),
            ...(Array.isArray(job.habilidades) ? job.habilidades : [])
          ];
          
          return searchableFields.some(field => 
            field && field.toString().toLowerCase().includes(queryLower)
          );
        });
      }

      // Filtro por salario mínimo
      if (activeFilters.salarioMin) {
        const salarioMin = parseInt(activeFilters.salarioMin);
        results = results.filter(job => {
          // Si el trabajo no tiene salario, no lo filtramos
          if (!job.sueldo || job.sueldo === 0) return true;
          return job.sueldo >= salarioMin;
        });
      }

      // Filtro por ciudad
      if (activeFilters.ciudad) {
        results = results.filter(job => 
          job.ciudad && job.ciudad.toLowerCase().includes(activeFilters.ciudad.toLowerCase())
        );
      }

      // Filtro por habilidades
      if (activeFilters.habilidades) {
        results = results.filter(job =>
          job.habilidades && 
          Array.isArray(job.habilidades) && 
          job.habilidades.some(habilidad => 
            habilidad.toLowerCase().includes(activeFilters.habilidades.toLowerCase())
          )
        );
      }

      // Filtro por experiencia mínima
      if (activeFilters.experienciaMin !== undefined && activeFilters.experienciaMin !== '') {
        const expMin = parseInt(activeFilters.experienciaMin, 10);
        results = results.filter(job => {
          const jobExp = Number(job.añosExperiencia) || 0;
          if (expMin === 0) {
            // Filtrar solo trabajos que no requieran experiencia
            return jobExp === 0;
          }
          return jobExp >= expMin;
        });
      }

      console.log(`Búsqueda + Filtros: ${results.length} resultados`);
      console.log('Filtros activos:', activeFilters);
      
      setFilteredJobs(results);
      setSearchLoading(false);
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeFilters, jobs]);

  // Función para recibir los filtros del componente Search
  const handleFiltersChange = (filters) => {
    setActiveFilters(filters);
  };

  const handleJobClick = (job) => {
    console.log('Job seleccionado completo:', job);
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  const handleAplicarClick = async (jobId) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('Debes iniciar sesión para aplicar a este empleo');
        return;
      }

      const response = await fetch('http://localhost:5000/api/aplicar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cuentaId: userId,
          empleoId: jobId
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        handleCloseModal();
      } else {
        alert(data.message || 'Error al aplicar al empleo');
      }
    } catch (error) {
      console.error('Error aplicando al empleo:', error);
      alert('Error al aplicar al empleo');
    }
  };

  const handleRetry = async () => {
    await fetchJobs();
  };

  const formatSalary = (salary) => {
    if (!salary || salary === 0) return 'Salario a convenir';
    if (typeof salary === 'number') {
      return `$${salary.toLocaleString('es-CO')}`;
    }
    return salary;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col justify-center items-center">
        <div className="bg-white rounded-full p-4 shadow-lg mb-6">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">NextStep</h3>
        <p className="text-gray-500">Cargando las mejores oportunidades...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex justify-center items-center p-4">
        <div className="max-w-sm md:max-w-md w-full">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
              ¡Ups! Algo salió mal
            </h2>
            <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Indicador de estado offline */}
      {!isOnline && (
        <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>Sin conexión - Mostrando vacantes guardadas</span>
        </div>
      )}
      
      {usingCache && isOnline && (
        <div className="bg-blue-500 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
          <Wifi className="w-4 h-4" />
          <span>Conexión restablecida - Sincronizando...</span>
        </div>
      )}

      {/* Modal de Detalles del Empleo */}
      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedJob.nombre}
                  </h2>
                  {selectedJob.empresa && (
                    <div className="flex items-center text-purple-600 font-medium mb-2">
                      <span>🏢 {selectedJob.empresa}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{selectedJob.ciudad}</span>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Información principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center text-purple-700 mb-2">
                    <DollarSign className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Salario</span>
                  </div>
                  <p className="text-xl font-bold text-purple-600">
                    {formatSalary(selectedJob.sueldo)}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center text-blue-700 mb-2">
                    <User className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Experiencia</span>
                  </div>
                  <p className="text-xl font-bold text-blue-600">
                    {selectedJob.añosExperiencia || 0} {(selectedJob.añosExperiencia || 0) === 1 ? 'año' : 'años'}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center text-green-700 mb-2">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Ubicación</span>
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {selectedJob.ciudad}
                  </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center text-orange-700 mb-2">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Publicación</span>
                  </div>
                  <p className="text-lg font-bold text-orange-600">
                    {selectedJob.fechaPublicacion 
                      ? new Date(selectedJob.fechaPublicacion).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Reciente'}
                  </p>
                </div>
              </div>

              {/* Descripción */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Descripción del Puesto
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedJob.descripcion || 'No hay descripción disponible.'}
                  </p>
                </div>
              </div>

              {/* Habilidades */}
              {selectedJob.habilidades && Array.isArray(selectedJob.habilidades) && selectedJob.habilidades.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Habilidades Requeridas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.habilidades.map((habilidad, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium border border-green-200"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {habilidad}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Palabras clave */}
              {selectedJob.palabrasClave && Array.isArray(selectedJob.palabrasClave) && selectedJob.palabrasClave.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Palabras Clave
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.palabrasClave.map((palabra, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm border border-purple-200"
                      >
                        #{palabra}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleAplicarClick(selectedJob.id)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Aplicar Ahora
                </button>
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barra de busqueda */}
      <SearchComponent 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchLoading={searchLoading}
        loading={loading}
        jobs={jobs}
        filteredJobs={filteredJobs}
        onFiltersChange={handleFiltersChange} 
      />

      <div className="px-4 py-6 max-w-6xl mx-auto">
        {!loading && !searchLoading && filteredJobs.length > 0 && (
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              {searchQuery || Object.values(activeFilters).some(f => f !== '') ? (
                <>Encontrados <span className="font-semibold text-purple-600">{filteredJobs.length}</span> empleos</>
              ) : (
                <><span className="font-semibold text-purple-600">{filteredJobs.length}</span> empleos disponibles</>
              )}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => handleJobClick(job)}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:border-purple-200 transition-all flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                  {job.nombre}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center text-green-600 font-semibold">
                    <DollarSign className="w-5 h-5 mr-1 flex-shrink-0" />
                    <span className="truncate">{formatSalary(job.sueldo)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-1 flex-shrink-0" />
                    <span className="truncate">{job.ciudad}</span>
                  </div>
                  
                  {job.añosExperiencia > 0 && (
                    <div className="flex items-center text-blue-600 text-sm">
                      <User className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>{job.añosExperiencia} {job.añosExperiencia === 1 ? 'año' : 'años'}</span>
                    </div>
                  )}
                </div>

                {/* Preview de habilidades */}
                {job.habilidades && job.habilidades.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {job.habilidades.slice(0, 3).map((hab, idx) => (
                      <span key={idx} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                        {hab}
                      </span>
                    ))}
                    {job.habilidades.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        +{job.habilidades.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {job.fechaPublicacion 
                    ? new Date(job.fechaPublicacion).toLocaleDateString('es-CO')
                    : 'Reciente'}
                </span>
                <span className="text-purple-600 text-sm font-medium group-hover:text-purple-700">
                  Ver detalles →
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && !loading && !searchLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">🔍</div>
            {searchQuery || Object.values(activeFilters).some(f => f !== '') ? (
              <>
                <p className="text-gray-600 text-lg mb-2">
                  No se encontraron empleos con los filtros aplicados
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  Intenta ajustar tu búsqueda o filtros
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilters({});
                  }}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Ver todos los empleos
                </button>
              </>
            ) : (
              <p className="text-gray-600 text-lg">
                No hay empleos disponibles en este momento
              </p>
            )}
          </div>
        )}

        {searchLoading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Buscando empleos...</p>
          </div>
        )}
      </div>
    </div>
  );
}
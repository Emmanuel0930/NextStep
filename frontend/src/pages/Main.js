import { useState, useEffect } from "react";
import { X, MapPin, DollarSign, Clock, Search } from "lucide-react";
import { getJobs, searchJobs } from "../services/api";
import { searchInFields, testNormalization } from "../utils/textUtils";

export default function Main() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        
        // Ejecutar pruebas de normalización
        testNormalization();
        
        const jobsData = await getJobs();
        setJobs(jobsData);
        setFilteredJobs(jobsData);
        setError("");
      } catch (error) {
        console.error('Error al cargar empleos:', error);
        setError("Error al cargar los empleos. Verifica tu conexión e intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setFilteredJobs(jobs);
        return;
      }

      setSearchLoading(true);
      
      const localFiltered = jobs.filter((job) => {
        return searchInFields(searchQuery, [
          job.title,
          job.company,
          job.city,
        ]);
      });
      
      setFilteredJobs(localFiltered);
      setSearchLoading(false);
    };

    const timeoutId = setTimeout(performSearch, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, jobs]);

  const handleJobClick = (job) => {
    alert(`Ver detalles del trabajo: ${job.title} en ${job.company}`);
  };

  const handleRetry = async () => {
    try {
      setLoading(true);
      setError("");
      const jobsData = await getJobs();
      setJobs(jobsData);
      setFilteredJobs(jobsData);
    } catch (error) {
      console.error('Error al reintentar:', error);
      setError("Error al cargar los empleos. Verifica tu conexión e intenta nuevamente.");
    } finally {
      setLoading(false);
    }
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
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 pb-6">
        <div className="px-4 pt-12 pb-4">
          <div className="max-w-4xl mx-auto text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">NextStep</h1>
            <p className="text-purple-100 text-sm md:text-base">Encuentra tu próxima oportunidad</p>
          </div>

          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white rounded-2xl py-4 pl-12 pr-12 text-gray-800 placeholder-gray-500 shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50 transition-all text-sm md:text-base"
                placeholder={searchLoading ? "Buscando..." : "Cargo, empresa o ciudad..."}
                disabled={loading}
              />
              
              {searchLoading && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                </div>
              )}
              
              {searchQuery && !searchLoading && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-6xl mx-auto">
        {!loading && !searchLoading && filteredJobs.length > 0 && (
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              {searchQuery ? (
                <>Encontrados <span className="font-semibold text-purple-600">{filteredJobs.length}</span> empleos para "{searchQuery}"</>
              ) : (
                <><span className="font-semibold text-purple-600">{filteredJobs.length}</span> empleos disponibles</>
              )}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between"
              onClick={() => handleJobClick(job)}
            >
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {job.title}
                </h3>
                <div className="flex items-center text-gray-600 text-base mb-2">
                  <span className="font-medium">{job.company}</span>
                  <span className="mx-2">•</span>
                  <span>{job.contract}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-green-600 font-semibold text-base">
                    <DollarSign className="w-5 h-5 mr-1" />
                    {job.salary}
                  </div>
                  <div className="flex items-center text-gray-500 text-base">
                    <MapPin className="w-5 h-5 mr-1" />
                    <span className="mr-3">{job.city}</span>
                    <Clock className="w-5 h-5 mr-1" />
                    <span>{job.type}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  Publicado hace 2 días
                </span>
                <button className="text-purple-600 text-base font-medium hover:text-purple-700">
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && !loading && !searchLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">🔍</div>
            {searchQuery ? (
              <>
                <p className="text-gray-600 text-lg mb-2">
                  No se encontraron empleos para "{searchQuery}"
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  Intenta con otros términos de búsqueda
                </p>
                <button
                  onClick={() => setSearchQuery("")}
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
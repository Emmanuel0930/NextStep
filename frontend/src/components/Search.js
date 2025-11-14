import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Briefcase, 
  Building, 
  Navigation, 
  Filter,
  DollarSign,
  MapPin,
  Zap,
  ChevronDown,
  Clock
} from 'lucide-react';

export default function SearchComponent({ 
  searchQuery, 
  setSearchQuery, 
  searchLoading, 
  loading,
  jobs,
  filteredJobs,
  onFiltersChange
}) {
  const [filters, setFilters] = useState({
    salarioMin: '',
    ciudad: '',
    habilidades: '',
    experienciaMin: '' // Nuevo filtro
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [availableOptions, setAvailableOptions] = useState({
    ciudades: [],
    habilidades: []
  });

  useEffect(() => {
    // Extraer opciones únicas de los empleos
    if (jobs.length > 0) {
      const ciudades = [...new Set(jobs.map(job => job.ciudad).filter(Boolean))];
      const todasHabilidades = jobs.flatMap(job => 
        Array.isArray(job.habilidades) ? job.habilidades : []
      );
      const habilidadesUnicas = [...new Set(todasHabilidades)].slice(0, 15);

      setAvailableOptions({
        ciudades: ciudades.sort(),
        habilidades: habilidadesUnicas.sort()
      });
    }
  }, [jobs]);

  // Notificar al padre cuando cambien los filtros
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      salarioMin: '',
      ciudad: '',
      habilidades: '',
      experienciaMin: '' // Limpiar también experiencia
    });
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '') || searchQuery;

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length + (searchQuery ? 1 : 0);
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-purple-700 pb-6 relative overflow-hidden">
      {/* Decoración de fondo - círculos y formas */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full opacity-20 -mr-48 -mt-48 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-800 rounded-full opacity-20 -ml-32 -mb-32 blur-2xl"></div>
      <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-10"></div>
      <div className="absolute top-1/4 right-1/3 w-24 h-24 bg-purple-400 rounded-full opacity-15"></div>
      
      {/* Patrón de puntos decorativos */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full"></div>
        <div className="absolute top-20 right-20 w-2 h-2 bg-white rounded-full"></div>
        <div className="absolute bottom-10 left-1/3 w-2 h-2 bg-white rounded-full"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-white rounded-full"></div>
      </div>

      <div className="px-4 pt-12 pb-4 relative z-10">
        <div className="max-w-6xl mx-auto text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">NextStep</h1>
          <p className="text-purple-100 text-sm md:text-base drop-shadow-sm">Encuentra tu próxima oportunidad</p>
          
          {/* Línea decorativa animada */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-12 h-0.5 bg-white opacity-30 rounded-full"></div>
            <div className="w-2 h-2 bg-white opacity-50 rounded-full animate-pulse"></div>
            <div className="w-12 h-0.5 bg-white opacity-30 rounded-full"></div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
            {/* Fila superior: Búsqueda + Botones */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Búsqueda principal */}
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 placeholder-gray-500"
                  placeholder={searchLoading ? "Buscando..." : "Buscar por cargo, empresa, habilidades..."}
                  disabled={loading}
                />
                
                {searchLoading && (
                  <div className="absolute right-3 top-3">
                    <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                  </div>
                )}
                
                {searchQuery && !searchLoading && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-600" />
                  </button>
                )}
              </div>

              {/* Botón filtros avanzados */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-colors ${
                  hasActiveFilters
                    ? 'bg-purple-100 text-purple-700 border-purple-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getActiveFiltersCount()}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* Limpiar filtros */}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-4 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                >
                  <X className="w-4 h-4" />
                  Limpiar
                </button>
              )}
            </div>

            {/* Filtros avanzados desplegables */}
            {showAdvancedFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Salario mínimo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Salario mínimo
                  </label>
                  <select
                    value={filters.salarioMin}
                    onChange={(e) => handleFilterChange('salarioMin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option value="">Cualquier salario</option>
                    <option value="1000000">$1.000.000+</option>
                    <option value="2000000">$2.000.000+</option>
                    <option value="3000000">$3.000.000+</option>
                    <option value="4000000">$4.000.000+</option>
                    <option value="5000000">$5.000.000+</option>
                  </select>
                </div>

                {/* Ciudad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Ciudad
                  </label>
                  <select
                    value={filters.ciudad}
                    onChange={(e) => handleFilterChange('ciudad', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option value="">Todas las ciudades</option>
                    {availableOptions.ciudades.map(ciudad => (
                      <option key={ciudad} value={ciudad}>{ciudad}</option>
                    ))}
                  </select>
                </div>

                {/* Habilidades */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-600" />
                    Habilidades
                  </label>
                  <select
                    value={filters.habilidades}
                    onChange={(e) => handleFilterChange('habilidades', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option value="">Cualquier habilidad</option>
                    {availableOptions.habilidades.map(habilidad => (
                      <option key={habilidad} value={habilidad}>{habilidad}</option>
                    ))}
                  </select>
                </div>

                {/* Experiencia mínima - NUEVO */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    Experiencia mínima
                  </label>
                  <select
                    value={filters.experienciaMin}
                    onChange={(e) => handleFilterChange('experienciaMin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option value="">Cualquier experiencia</option>
                    <option value="0">Sin experiencia</option>
                    <option value="1">1+ año</option>
                    <option value="2">2+ años</option>
                    <option value="3">3+ años</option>
                    <option value="4">4+ años</option>
                    <option value="5">5+ años</option>
                  </select>
                </div>
              </div>
            )}

            {/* Estadísticas */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t border-gray-200 gap-2">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{jobs.length} empleos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  <span>{new Set(jobs.map(job => job.empresa)).size} empresas</span>
                </div>
                <div className="flex items-center gap-1">
                  <Navigation className="w-4 h-4" />
                  <span>{availableOptions.ciudades.length} ciudades</span>
                </div>
              </div>
              
              {(searchQuery || hasActiveFilters) && (
                <div className="text-sm text-purple-600 font-medium">
                  {filteredJobs.length} resultados
                  {searchQuery && ` para "${searchQuery}"`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
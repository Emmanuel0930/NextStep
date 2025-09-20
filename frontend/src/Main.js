import { useState, useEffect } from "react";
import { ArrowLeft, X, MapPin, DollarSign, Clock } from 'lucide-react';

export default function Main() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/jobs')
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar los empleos.');
        setLoading(false);
      });
  }, []);

  const handleJobClick = (job) => {
    alert(`Ver detalles del trabajo: ${job.title} en ${job.company}`);
  };

  const handleSearchFocus = () => {
    setShowKeyboard(true);
  };

  const handleSearchBlur = () => {
    setShowKeyboard(false);
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-center text-red-600 text-lg p-8 bg-white rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="bg-purple-300 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center bg-purple-400 rounded-lg px-3 py-2">
            <ArrowLeft className="w-5 h-5 text-purple-800 mr-3 md:hidden" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="bg-transparent text-purple-900 placeholder-purple-700 flex-1 outline-none font-medium"
              placeholder="Buscar empleos..."
            />
            <X className="w-5 h-5 text-purple-800 ml-3" />
          </div>
        </div>
      </div>

      {/* Job Results - Responsive Grid */}
      <div className="px-4 py-6 max-w-6xl mx-auto">
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

        {filteredJobs.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg mb-2">🔍</div>
            <p className="text-gray-500">No se encontraron empleos para "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Virtual Keyboard (when search is focused) */}
      {showKeyboard && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-200 p-4 z-50 border-t">
          <div className="max-w-sm mx-auto">
            {/* First Row */}
            <div className="grid grid-cols-10 gap-1 mb-2">
              {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map(key => (
                <button
                  key={key}
                  className="bg-white rounded p-2 text-center text-gray-800 font-medium shadow-sm hover:bg-gray-100"
                  onClick={() => setSearchQuery(prev => prev + key)}
                >
                  {key}
                </button>
              ))}
            </div>
            {/* Second Row */}
            <div className="grid grid-cols-9 gap-1 mb-2 pl-4">
              {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'].map(key => (
                <button
                  key={key}
                  className="bg-white rounded p-2 text-center text-gray-800 font-medium shadow-sm hover:bg-gray-100"
                  onClick={() => setSearchQuery(prev => prev + key)}
                >
                  {key}
                </button>
              ))}
            </div>
            {/* Third Row */}
            <div className="grid grid-cols-9 gap-1 mb-3">
              <button className="bg-gray-300 rounded p-2 text-center text-gray-600 font-medium">
                ⇧
              </button>
              {['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(key => (
                <button
                  key={key}
                  className="bg-white rounded p-2 text-center text-gray-800 font-medium shadow-sm hover:bg-gray-100"
                  onClick={() => setSearchQuery(prev => prev + key)}
                >
                  {key}
                </button>
              ))}
              <button 
                className="bg-gray-300 rounded p-2 text-center text-gray-600 font-medium"
                onClick={() => setSearchQuery(prev => prev.slice(0, -1))}
              >
                ⌫
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
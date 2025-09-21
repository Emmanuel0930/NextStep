import React, { useEffect, useState } from 'react';
import { User, Home, Trophy, Target, Zap } from 'lucide-react';

export default function Dashboard() {
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Racha');
  const [points, setPoints] = useState(450);
  const [level, setLevel] = useState(3);
  const [streak, setStreak] = useState(5);

  const maxPoints = 500;
  const progressPercentage = (points / maxPoints) * 100;

  useEffect(() => {
    fetch('http://localhost:5000/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setApplicationsCount(data.applicationsCount);
        setRecommendedJobs(data.recommendedJobs);
        setLoading(false);
      })
      .catch(() => {
        // Datos de ejemplo para desarrollo
        setApplicationsCount(12);
        setRecommendedJobs([
          { title: 'Frontend Developer', company: 'TechCorp', city: 'Medellín', contract: 'Tiempo completo', salary: '$3M - $4M' },
          { title: 'UI/UX Designer', company: 'Design Studio', city: 'Bogotá', contract: 'Remoto', salary: '$2.5M - $3.5M' },
          { title: 'Backend Developer', company: 'StartupXYZ', city: 'Cali', contract: 'Medio tiempo', salary: '$2M - $3M' }
        ]);
        setLoading(false);
      });
  }, []);

  const tabs = [
    { name: 'Perfil', active: false },
    { name: 'Racha', active: true },
    { name: 'Vacantes', active: false },
    { name: 'Postulaciones', active: false }
  ];

  const handleMascotClick = () => {
    alert('¡Hola! Soy tu asistente virtual. El chatbot estará disponible pronto 🤖');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Círculo decorativo detrás de oportunidades */}
  <div className="absolute -left-32 -bottom-32 w-[500px] h-[500px] md:w-[800px] md:h-[800px] bg-purple-500 rounded-full opacity-30 z-0 pointer-events-none"></div>
      {/* Navigation Tabs - Responsive */}
      <div className="bg-white border-b px-4 py-4">
        <div className="flex justify-center flex-wrap gap-2 max-w-6xl mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`px-6 py-2 md:px-8 md:py-3 rounded-full text-sm md:text-base font-semibold transition-all duration-200 ${
                tab.name === activeTab
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content - Responsive Layout */}
      <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center text-gray-500 py-12">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            Cargando...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Points Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 z-10 relative">
                <h2 className="text-xl font-semibold text-purple-600 mb-3">Puntos</h2>
                <div className="text-5xl md:text-6xl font-bold text-purple-600 mb-2">
                  {points}/{maxPoints}
                </div>
                <p className="text-gray-500 text-base">
                  Continúa así, pronto encontrarás la oportunidad ideal
                </p>
              </div>

              {/* Level Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 z-10 relative">
                <h3 className="text-xl font-semibold text-purple-600 mb-3">NIVEL {level}</h3>
                <p className="text-gray-500 mb-4">
                  Estás a solo 50 puntos de subir de nivel
                </p>
                
                {/* Progress Bar */}
                <div className="relative mb-2">
                  <div className="w-full bg-purple-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-purple-700 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  {/* Progress Indicator */}
                  <div 
                    className="absolute top-0 w-1 bg-gray-600 h-4 rounded-sm"
                    style={{ left: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Next Goal */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 z-10 relative">
                <h3 className="text-xl font-semibold text-purple-600 mb-3">Siguiente Meta</h3>
                <p className="text-gray-500">
                  Completa tu perfil al 100% y gana 20 Puntos
                </p>
              </div>

              {/* Weekly Challenge Card - Mobile/Tablet */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white relative overflow-hidden lg:hidden z-10">
                <div className="relative z-10 pr-20">
                  <h3 className="text-xl font-bold mb-2">Reto Semanal De Racha</h3>
                  <p className="text-purple-100">
                    Participa en un minitest de habilidades
                  </p>
                </div>
                {/* Decoración: Rayo centrado */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-16 h-16 rounded-full bg-blue-400 flex items-center justify-center shadow-lg">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Right Column - Stats and Challenge */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 z-10 relative">
                  <div className="flex items-center space-x-3 mb-3">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    <span className="text-gray-500 font-medium">Racha actual</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{streak} días</div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 z-10 relative">
                  <div className="flex items-center space-x-3 mb-3">
                    <Target className="w-6 h-6 text-green-500" />
                    <span className="text-gray-500 font-medium">Postulaciones</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{applicationsCount}</div>
                </div>
              </div>

              {/* Weekly Challenge Card - Desktop */}
              <div className="hidden lg:block bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white relative overflow-hidden z-10">
                <div className="relative z-10 pr-20">
                  <h3 className="text-lg font-bold mb-2">Reto Semanal De Racha</h3>
                  <p className="text-purple-100 text-sm">
                    Participa en un minitest de habilidades
                  </p>
                </div>
                {/* Decoración: Rayo centrado */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-16 h-16 rounded-full bg-blue-400 flex items-center justify-center shadow-lg">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></div>
                </div>
                {/* Circular Background Decoration */}
                <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-purple-700 rounded-full opacity-50"></div>
              </div>

              {/* Recommended Jobs */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 z-10 relative">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Oportunidades Recomendadas</h3>
                <div className="space-y-3">
                  {recommendedJobs.slice(0, 3).map((job, idx) => (
                    <div key={idx} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                      <div className="font-semibold text-gray-800 text-sm">{job.title}</div>
                      <div className="text-gray-600 text-sm">{job.company}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        {job.city} • {job.contract}
                      </div>
                      <div className="text-green-600 font-semibold text-sm mt-1">{job.salary}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Mascot - Bottom Right */}
      <button
        onClick={handleMascotClick}
  className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 p-0 border-none bg-transparent hover:scale-105 transition-transform duration-300"
      >
    <img src="/jobbie.png" alt="Chatbot" className="w-32 h-32 md:w-40 md:h-40 object-contain" style={{ background: 'transparent' }} />
        {/* Indicador de chat activo */}
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
      </button>
    </div>
  );
}
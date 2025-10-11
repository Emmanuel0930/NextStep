import React, { useEffect, useState } from 'react';
import { User, Trophy, Target, Zap, Briefcase, MapPin, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Racha');
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [userProfile, setUserProfile] = useState(null);

  const maxPoints = 500;
  const progressPercentage = (points / maxPoints) * 100;

  useEffect(() => {
    const fetchDashboardData = async () => {
      const userId = localStorage.getItem('userId');
      const profile = localStorage.getItem('userProfile');
      
      let userData = {};
      if (profile) {
        userData = JSON.parse(profile);
        setUserProfile(userData);
        setPoints(userData.puntos || 0);
        setLevel(userData.nivel || 1);
      }

      if (!userId) {
        console.error('No se encontró userId en localStorage');
        setLoading(false);
        return;
      }

      try {
        // Obtener puntos actualizados del servidor
        const perfilResponse = await fetch(`http://localhost:5000/api/perfil/${userId}`);
        if (perfilResponse.ok) {
          const perfilData = await perfilResponse.json();
          if (perfilData.success) {
            setPoints(perfilData.perfil.cuenta.puntos);
            setLevel(perfilData.perfil.cuenta.nivel);
            const updatedProfile = {
              ...userData,
              puntos: perfilData.perfil.cuenta.puntos,
              nivel: perfilData.perfil.cuenta.nivel,
              porcentajePerfil: perfilData.perfil.cuenta.porcentajePerfil
            };
            localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
          }
        }

        //Obtener número de postulaciones
        const aplicacionesResponse = await fetch(`http://localhost:5000/api/mis-aplicaciones/${userId}`);
        if (aplicacionesResponse.ok) {
          const aplicacionesData = await aplicacionesResponse.json();
          if (aplicacionesData.success) {
            setApplicationsCount(aplicacionesData.aplicaciones.length);
          }
        }

        // Obtener datos del dashboard con recomendaciones personalizadas
        const dashboardResponse = await fetch(`http://localhost:5000/api/dashboard?usuarioId=${userId}`);
        const dashboardData = await dashboardResponse.json();
        
        if (dashboardData.success) {
          if (dashboardData.recommendedJobs && dashboardData.recommendedJobs.length > 0) {
            setRecommendedJobs(dashboardData.recommendedJobs);
          } else {
            // Si no hay recomendaciones, obtener trabajos generales
            const jobsResponse = await fetch('http://localhost:5000/api/jobs');
            const jobsData = await jobsResponse.json();
            setRecommendedJobs(jobsData.slice(0, 5));
          }
        } else {
          // Fallback: obtener trabajos generales
          const jobsResponse = await fetch('http://localhost:5000/api/jobs');
          const jobsData = await jobsResponse.json();
          setRecommendedJobs(jobsData.slice(0, 5));
        }

        // Obtener racha del usuario
        const streakResponse = await fetch(`http://localhost:5000/api/streak?usuarioId=${userId}`);
        const streakData = await streakResponse.json();
        if (streakData.success) {
          setStreak(streakData.currentStreak);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
        
        //Obtener empleos generales
        try {
          const jobsResponse = await fetch('http://localhost:5000/api/jobs');
          const jobsData = await jobsResponse.json();
          setRecommendedJobs(jobsData.slice(0, 5));
        } catch (jobsError) {
          console.error('Error obteniendo empleos:', jobsError);
        }
        
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Función para obtener datos de manera segura
  const getJobData = (job, field) => {
    if (!job) return '';
    
    switch(field) {
      case 'nombre':
        return job.nombre || job.title || 'Título no disponible';
      case 'empresa':
        return job.empresa || job.company || 'Empresa destacada';
      case 'ciudad':
        return job.ciudad || job.city || 'Ubicación no especificada';
      case 'sueldo':
        return job.sueldo || job.salary || 0;
      case 'descripcion':
        return job.descripcion || 'Descripción no disponible';
      case 'habilidades':
        return job.habilidades || job.skills || [];
      default:
        return job[field] || '';
    }
  };

  const formatSalary = (salary) => {
    if (!salary || salary === 0) return 'Salario a convenir';
    if (typeof salary === 'number') {
      return `$${salary.toLocaleString('es-CO')}`;
    }
    return salary;
  };

  // Tabs:Racha, Vacantes y Postulaciones
  const tabs = [
    { name: 'Racha', active: true },
    { name: 'Vacantes', active: false },
    { name: 'Postulaciones', active: false }
  ];

  const handleMascotClick = () => {
    alert('¡Hola! Soy tu asistente virtual. El chatbot estará disponible pronto 🤖');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="absolute -left-32 -bottom-32 w-[500px] h-[500px] md:w-[800px] md:h-[800px] bg-purple-500 rounded-full opacity-30 z-0 pointer-events-none"></div>
      
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

      <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center text-gray-500 py-12">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            Cargando...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 z-10 relative">
                <h2 className="text-xl font-semibold text-purple-600 mb-3">Puntos</h2>
                <div className="text-5xl md:text-6xl font-bold text-purple-600 mb-2">
                  {points}/{maxPoints}
                </div>
                <p className="text-gray-500 text-base">
                  {points >= maxPoints 
                    ? "¡Felicidades! Has alcanzado el máximo de puntos" 
                    : "Continúa así, pronto encontrarás la oportunidad ideal"}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 z-10 relative">
                <h3 className="text-xl font-semibold text-purple-600 mb-3">NIVEL {level}</h3>
                <p className="text-gray-500 mb-4">
                  {points >= maxPoints 
                    ? "¡Nivel máximo alcanzado!" 
                    : `Estás a ${maxPoints - points} puntos de subir de nivel`}
                </p>
                
                <div className="relative mb-2">
                  <div className="w-full bg-purple-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-purple-700 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div 
                    className="absolute top-0 w-1 bg-gray-600 h-4 rounded-sm"
                    style={{ left: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 z-10 relative">
                <h3 className="text-xl font-semibold text-purple-600 mb-3">Siguiente Meta</h3>
                <p className="text-gray-500">
                  {userProfile?.porcentajePerfil === 100 
                    ? "¡Perfil completo al 100%!" 
                    : `Completa tu perfil al 100% (actual: ${userProfile?.porcentajePerfil || 20}%)`}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white relative overflow-hidden lg:hidden z-10">
                <div className="relative z-10 pr-20">
                  <h3 className="text-xl font-bold mb-2">Reto Semanal De Racha</h3>
                  <p className="text-purple-100">
                    Llevas {streak} días consecutivos
                  </p>
                </div>
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

            <div className="space-y-6">
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

              <div className="hidden lg:block bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white relative overflow-hidden z-10">
                <div className="relative z-10 pr-20">
                  <h3 className="text-lg font-bold mb-2">Reto Semanal De Racha</h3>
                  <p className="text-purple-100 text-sm">
                    Llevas {streak} días consecutivos
                  </p>
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-16 h-16 rounded-full bg-blue-400 flex items-center justify-center shadow-lg">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></div>
                </div>
                <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-purple-700 rounded-full opacity-50"></div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 z-10 relative">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  Oportunidades Recomendadas
                </h3>
                <div className="space-y-3">
                  {recommendedJobs.length > 0 ? (
                    recommendedJobs.slice(0, 5).map((job, idx) => (
                      <div key={idx} className="border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-purple-200 transition-all cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 text-sm mb-1">
                              {getJobData(job, 'nombre')}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                              <MapPin className="w-3 h-3" />
                              {getJobData(job, 'ciudad')}
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="text-green-600 font-semibold text-sm">
                                {formatSalary(getJobData(job, 'sueldo'))}
                              </span>
                            </div>
                            {getJobData(job, 'habilidades').length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {getJobData(job, 'habilidades').slice(0, 3).map((skill, skillIdx) => (
                                  <span 
                                    key={skillIdx}
                                    className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Briefcase className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">No hay oportunidades disponibles</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleMascotClick}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
      >
        <div className="text-2xl">🤖</div>
      </button>
    </div>
  );
}
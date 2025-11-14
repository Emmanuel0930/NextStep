import React, { useEffect, useState } from 'react';
import { User, Trophy, Target, Zap, Briefcase, MapPin, DollarSign } from 'lucide-react';
import NivelDisplay from "../components/NivelDisplay";
import StreakCounter from "../components/StreakCounter";
import { calcularNivel, getSiguienteNivel, calcularProgreso } from "../utils/nivelesSystem";

export default function Dashboard() {
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Racha');
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [rachaData, setRachaData] = useState(null);

  // Usar el sistema de niveles dinámico
  const currentLevelInfo = calcularNivel(points);
  const nextLevelInfo = getSiguienteNivel(points);
  const progressPercentage = calcularProgreso(points);
  const maxPoints = nextLevelInfo ? nextLevelInfo.puntosMinimos : currentLevelInfo.puntosMaximos;

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

        // Obtener datos de racha
        try {
          const rachaResponse = await fetch(`http://localhost:5000/api/rachas/estadisticas/${userId}`);
          if (rachaResponse.ok) {
            const rachaResult = await rachaResponse.json();
            if (rachaResult.success) {
              setRachaData(rachaResult.estadisticas);
              setStreak(rachaResult.estadisticas.rachaActual);
            }
          }
        } catch (error) {
          console.error('Error cargando datos de racha:', error);
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

  // Sistema de retos dinámicos
  const getSiguienteReto = () => {
    const porcentajePerfil = userProfile?.porcentajePerfil || 0;
    const puntosActuales = points || 0;
    const rachaActual = rachaData?.rachaActual || 0;
    const aplicacionesCount = applicationsCount || 0;
    
    // Definir retos según el progreso del usuario
    const retos = [
      // Retos de perfil (prioridad alta si no está completo)
      {
        id: 'perfil_25',
        condition: porcentajePerfil < 25,
        titulo: 'Completa tu información básica',
        descripcion: 'Agrega tu información personal y de contacto para obtener mejores recomendaciones',
        puntos: 50,
        progreso: porcentajePerfil,
        meta: 25
      },
      {
        id: 'perfil_50',
        condition: porcentajePerfil >= 25 && porcentajePerfil < 50,
        titulo: 'Completa tu experiencia laboral',
        descripcion: 'Agrega tu historial profesional para destacar ante los empleadores',
        puntos: 75,
        progreso: porcentajePerfil,
        meta: 50
      },
      {
        id: 'perfil_75',
        condition: porcentajePerfil >= 50 && porcentajePerfil < 75,
        titulo: 'Completa tu formación académica',
        descripcion: 'Agrega tus estudios y certificaciones para mostrar tus competencias',
        puntos: 75,
        progreso: porcentajePerfil,
        meta: 75
      },
      {
        id: 'perfil_100',
        condition: porcentajePerfil >= 75 && porcentajePerfil < 100,
        titulo: 'Completa tu perfil al 100%',
        descripcion: 'Termina de completar todas las secciones y obtén tu insignia especial',
        puntos: 100,
        progreso: porcentajePerfil,
        meta: 100
      },

      // Retos de aplicaciones (después del perfil completo)
      {
        id: 'primera_aplicacion',
        condition: porcentajePerfil >= 50 && aplicacionesCount === 0,
        titulo: 'Aplica a tu primer empleo',
        descripcion: 'Da el primer paso enviando tu primera postulación',
        puntos: 10,
        progreso: 0,
        meta: 1
      },
      {
        id: 'aplicaciones_5',
        condition: aplicacionesCount >= 1 && aplicacionesCount < 5,
        titulo: 'Aplica a 5 empleos',
        descripcion: 'Aumenta tus oportunidades postulándote a más puestos de trabajo',
        puntos: 50,
        progreso: aplicacionesCount,
        meta: 5
      },
      {
        id: 'aplicaciones_10',
        condition: aplicacionesCount >= 5 && aplicacionesCount < 10,
        titulo: 'Alcanza 10 aplicaciones',
        descripcion: 'Mantén un nivel alto de postulaciones para maximizar tus opciones',
        puntos: 100,
        progreso: aplicacionesCount,
        meta: 10
      },

      // Retos de racha
      {
        id: 'racha_3',
        condition: rachaActual >= 0 && rachaActual < 3,
        titulo: 'Racha de 3 días',
        descripcion: 'Mantén tu constancia ingresando por 3 días seguidos',
        puntos: 0,
        progreso: rachaActual,
        meta: 3
      },
      {
        id: 'racha_7',
        condition: rachaActual >= 3 && rachaActual < 7,
        titulo: 'Una semana completa',
        descripcion: 'Logra 7 días consecutivos de actividad en la plataforma',
        puntos: 0,
        progreso: rachaActual,
        meta: 7
      },
      {
        id: 'racha_30',
        condition: rachaActual >= 7 && rachaActual < 30,
        titulo: 'Racha legendaria',
        descripcion: 'Alcanza 30 días seguidos de actividad - ¡Un logro increíble!',
        puntos: 0,
        progreso: rachaActual,
        meta: 30
      },

      // Retos de puntos/niveles
      {
        id: 'puntos_500',
        condition: puntosActuales >= 100 && puntosActuales < 500,
        titulo: 'Alcanza 500 puntos',
        descripcion: 'Completa actividades en la plataforma para acumular más puntos',
        puntos: puntosActuales,
        progreso: puntosActuales,
        meta: 500
      },
      {
        id: 'puntos_1000',
        condition: puntosActuales >= 500 && puntosActuales < 1000,
        titulo: 'Alcanza 1000 puntos',
        descripcion: 'Continúa completando actividades para llegar a este hito importante',
        puntos: puntosActuales,
        progreso: puntosActuales,
        meta: 1000
      },

      // Reto por defecto para usuarios avanzados
      {
        id: 'mantener_actividad',
        condition: porcentajePerfil === 100 && aplicacionesCount >= 10 && rachaActual >= 7,
        titulo: 'Mantén tu progreso',
        descripcion: 'Continúa tu actividad diaria postulándote y manteniendo tu racha',
        puntos: 0,
        progreso: 1,
        meta: 1
      }
    ];

    // Encontrar el primer reto que cumple la condición
    const retoActual = retos.find(reto => reto.condition);
    
    if (!retoActual) {
      return (
        <div className="text-center py-4">
          <span className="text-6xl">🎉</span>
          <p className="text-gray-600 mt-2">¡Has completado todos los retos disponibles!</p>
          <p className="text-sm text-gray-500 mt-1">Mantén tu actividad diaria para seguir creciendo</p>
        </div>
      );
    }

    const porcentajeProgreso = retoActual.meta > 0 ? Math.min((retoActual.progreso / retoActual.meta) * 100, 100) : 0;

    return (
      <div>
        <p className="text-gray-500 mb-3">
          {retoActual.titulo.replace(/[🎯📝💼🎓⭐🚀📊🔥⚡👑💎🏆🌟✨]/g, '').trim()}
        </p>
        
        {/* Mostrar progreso si es aplicable */}
        {retoActual.meta > 0 && retoActual.progreso !== undefined && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progreso actual</span>
              <span>{retoActual.progreso} / {retoActual.meta}</span>
            </div>
            <div className="w-full bg-gray-200 rounded h-1.5">
              <div 
                className="h-1.5 rounded bg-purple-600 transition-all duration-500"
                style={{ width: `${porcentajeProgreso}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Descripción adicional */}
        <p className="text-sm text-gray-400">
          {retoActual.descripcion}
        </p>
      </div>
    );
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

      {/* AGREGAR data-tutorial PARA EL TUTORIAL */}
      <div 
        className="px-4 md:px-8 py-6 max-w-6xl mx-auto"
        data-tutorial="dashboard-section"
      >
        {loading ? (
          <div className="text-center text-gray-500 py-12">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            Cargando...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div 
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 z-10 relative"
                data-tutorial="points-section"
              >
                <h2 className="text-xl font-semibold text-purple-600 mb-3">Puntos</h2>
                <div className="text-5xl md:text-6xl font-bold text-purple-600 mb-2">
                  {points}{nextLevelInfo ? `/${maxPoints}` : ''}
                </div>
                <p className="text-gray-500 text-base">
                  {!nextLevelInfo 
                    ? "¡Felicidades! Has alcanzado el nivel máximo" 
                    : `Te faltan ${maxPoints - points} puntos para el nivel ${nextLevelInfo.nivel} - ${nextLevelInfo.nombre}`}
                </p>
              </div>

              {/* Nuevo sistema de niveles */}
              <div data-tutorial="levels-section">
                <NivelDisplay puntos={points} showProgress={true} size="normal" />
              </div>

              {/* Sistema de Retos Dinámicos */}
              <div 
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 z-10 relative"
                data-tutorial="challenges-section"
              >
                <h3 className="text-xl font-semibold text-purple-600 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Siguiente Reto
                </h3>
                {getSiguienteReto()}
              </div>

              {/* Racha Diaria - Mobile */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white relative overflow-hidden lg:hidden z-10">
                <div className="relative z-10 pr-20">
                  <h3 className="text-xl font-bold mb-2">Tu Racha Diaria 🔥</h3>
                  <p className="text-purple-100">
                    {rachaData ? (
                      rachaData.rachaActual > 0 
                        ? `¡${rachaData.rachaActual} días consecutivos!`
                        : 'Comienza tu racha hoy'
                    ) : 'Cargando racha...'}
                  </p>
                  {rachaData?.mejorRacha > 0 && (
                    <p className="text-purple-200 text-sm mt-1">
                      Mejor racha: {rachaData.mejorRacha} días
                    </p>
                  )}
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center shadow-lg">
                    <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-2xl">🔥</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Componente de Racha Completo - Desktop */}
              <div 
                className="hidden lg:block"
                data-tutorial="streak-section"
              >
                <StreakCounter 
                  cuentaId={localStorage.getItem('userId')} 
                  size="normal" 
                  showConfig={false}
                />
              </div>

              {/* Tarjeta de Postulaciones - Desktop */}
              <div className="hidden lg:block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 z-10 relative">
                <div className="flex items-center space-x-3 mb-3">
                  <Target className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700 font-semibold">Mis Postulaciones</span>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{applicationsCount}</div>
                <p className="text-gray-500 text-sm">
                  {applicationsCount === 0 
                    ? 'Aún no has enviado postulaciones' 
                    : applicationsCount === 1 
                      ? 'Postulación enviada' 
                      : 'Postulaciones enviadas'
                  }
                </p>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:hidden">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 z-10 relative">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">🔥</span>
                    <span className="text-gray-500 font-medium">Racha actual</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-800">
                    {rachaData?.rachaActual || 0} días
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 z-10 relative">
                  <div className="flex items-center space-x-3 mb-3">
                    <Target className="w-6 h-6 text-green-500" />
                    <span className="text-gray-500 font-medium">Postulaciones</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{applicationsCount}</div>
                </div>
              </div>

              {/* Card de Racha para escritorio - Simplificado */}
              <div className="hidden lg:block bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white relative overflow-hidden z-10">
                <div className="relative z-10 pr-20">
                  <h3 className="text-lg font-bold mb-2">Tu Racha Diaria 🔥</h3>
                  <p className="text-purple-100 text-sm">
                    {rachaData ? (
                      rachaData.rachaActual > 0 
                        ? `¡${rachaData.rachaActual} días consecutivos!`
                        : 'Comienza tu racha hoy'
                    ) : 'Cargando racha...'}
                  </p>
                  {rachaData?.mejorRacha > 0 && (
                    <p className="text-purple-200 text-xs mt-1">
                      Mejor racha: {rachaData.mejorRacha} días
                    </p>
                  )}
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center shadow-lg">
                    <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-2xl">🔥</span>
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
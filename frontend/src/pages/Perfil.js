import React, { useState, useEffect } from 'react';
import { 
  User, Briefcase, FileText, Languages, Save, CheckCircle, 
  Award, Edit, MapPin, DollarSign, GraduationCap, 
  Clock, Plus, Trash2, Heart 
} from 'lucide-react';

import { useNotification } from "../components/NotificationProvider";
import { useFeedback } from "../components/FeedbackProvider";
import PushNotifications from "../components/PushNotifications";
import config from '../config';

const API_BASE_URL = config.API_URL;

export default function Perfil() {
  const [activeLevel, setActiveLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  const [showAllFavoritos, setShowAllFavoritos] = useState(false);
  const [formData, setFormData] = useState({});
  const [saveStatus, setSaveStatus] = useState({});
  const [editMode, setEditMode] = useState(false);
  const { showProfileActionFeedback, showSuccessFeedback, showProgressFeedback, animateElement, celebrateAchievement } = useFeedback();

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/perfil/${userId}`);
      const data = await response.json();
      if (data.success) {
        setUserProfile(data.perfil);
        initializeFormData(data.perfil.niveles);
        // Obtener favoritos del usuario
        try {
          const favResp = await fetch(`${API_BASE_URL}/perfil/${userId}/favoritos`);
          const favData = await favResp.json();
          if (favData && favData.success) {
            setFavoritos(favData.favoritos || []);
          }
        } catch (err) {
          console.error('Error cargando favoritos:', err);
        }
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeFormData = (niveles) => {
    const initialData = {};
    [1, 2, 3, 4].forEach(level => {
      const nivelData = niveles[`nivel${level}`];
      if (nivelData && nivelData.completado) {
        initialData[level] = { ...nivelData };
      } else {
        // Inicializar con estructura vacía según el nivel
        if (level === 1) {
          initialData[level] = {
            sector: [],
            cargo: '',
            salarioDeseado: '',
            estudios: '',
            ciudad: '',
            disponibilidad: ''
          };
        } else if (level === 2) {
          initialData[level] = {
            experiencias: [{
              titulo: '',
              funciones: [''],
              duracion: ''
            }]
          };
        } else if (level === 3) {
          initialData[level] = {
            descripcionPerfil: '',
            habilidades: ['']
          };
        } else if (level === 4) {
          initialData[level] = {
            idiomas: [''],
            referencias: ['']
          };
        }
      }
    });
    setFormData(initialData);
  };

  const handleInputChange = (level, field, value) => {
    setFormData(prev => ({
      ...prev,
      [level]: {
        ...prev[level],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (level, field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [level]: {
        ...prev[level],
        [field]: (prev[level][field] || []).map((item, i) => i === index ? value : item)
      }
    }));
  };

  const addArrayItem = (level, field) => {
    setFormData(prev => ({
      ...prev,
      [level]: {
        ...prev[level],
        [field]: [...(prev[level][field] || []), '']
      }
    }));
  };

  const removeArrayItem = (level, field, index) => {
    setFormData(prev => ({
      ...prev,
      [level]: {
        ...prev[level],
        [field]: (prev[level][field] || []).filter((_, i) => i !== index)
      }
    }));
  };

  const handleExperienciaChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      2: {
        ...prev[2],
        experiencias: (prev[2].experiencias || []).map((exp, i) => 
          i === index ? { ...exp, [field]: value } : exp
        )
      }
    }));
  };

  const addExperiencia = () => {
    setFormData(prev => ({
      ...prev,
      2: {
        ...prev[2],
        experiencias: [...(prev[2].experiencias || []), { titulo: '', funciones: [''], duracion: '' }]
      }
    }));
  };

  const removeExperiencia = (index) => {
    setFormData(prev => ({
      ...prev,
      2: {
        ...prev[2],
        experiencias: (prev[2].experiencias || []).filter((_, i) => i !== index)
      }
    }));
  };

  const addFuncion = (expIndex) => {
    setFormData(prev => ({
      ...prev,
      2: {
        ...prev[2],
        experiencias: (prev[2].experiencias || []).map((exp, i) => 
          i === expIndex ? { ...exp, funciones: [...(exp.funciones || []), ''] } : exp
        )
      }
    }));
  };

  const removeFuncion = (expIndex, funcIndex) => {
    setFormData(prev => ({
      ...prev,
      2: {
        ...prev[2],
        experiencias: (prev[2].experiencias || []).map((exp, i) => 
          i === expIndex ? { ...exp, funciones: (exp.funciones || []).filter((_, j) => j !== funcIndex) } : exp
        )
      }
    }));
  };

  const handleFuncionChange = (expIndex, funcIndex, value) => {
    setFormData(prev => ({
      ...prev,
      2: {
        ...prev[2],
        experiencias: (prev[2].experiencias || []).map((exp, i) => 
          i === expIndex ? { 
            ...exp, 
            funciones: (exp.funciones || []).map((func, j) => j === funcIndex ? value : func)
          } : exp
        )
      }
    }));
  };

  const saveLevel = async (level) => {
  if (!formData[level]) return;
  
  setSaveStatus(prev => ({ ...prev, [level]: 'saving' }));

  try {
    const response = await fetch(`${API_BASE_URL}/perfil/nivel${level}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cuentaId: userId,
        ...formData[level]
      })
    });

    const data = await response.json();
    
    if (data.success) {
      setSaveStatus(prev => ({ ...prev, [level]: 'success' }));
      setEditMode(false);
      await fetchUserProfile();
      await verificarInsigniaPerfilCompleto();
      
      // Detectar subida de nivel y mostrar animación especial
      if (data.nivelInfo && data.nivelInfo.subioDeNivel) {
        celebrateAchievement({
          nombre: `¡SUBISTE DE NIVEL!`,
          descripcion: `Ahora eres ${data.nivelInfo.datosNivel.nombre} ${data.nivelInfo.datosNivel.icono}`,
          icono: data.nivelInfo.datosNivel.icono
        }, { type: 'milestone' });
      } else {
        // Mostrar feedback específico por nivel
        const levelMessages = {
          1: 'updated', // General
          2: 'updated',
          3: 'skills_added', // Específico para habilidades
          4: 'updated'
        };
        
        showProfileActionFeedback(levelMessages[level] || 'updated');
      }
      
      // Animar el nivel guardado
      animateElement(`nivel-${level}`, 'animate-bounce-in');
      
      setTimeout(() => setSaveStatus(prev => ({ ...prev, [level]: '' })), 2000);
    }
  } catch (error) {
    console.error(`Error guardando nivel ${level}:`, error);
    setSaveStatus(prev => ({ ...prev, [level]: 'error' }));
  }
};

// Función para verificar insignia automáticamente
const { showNotification } = useNotification();
const verificarInsigniaPerfilCompleto = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/insignias/verificar-perfil-completo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cuentaId: userId })
    });

    const data = await response.json();
    
    console.log('🏆 Verificación de insignia:', data);
    
    if (data.success && data.perfilCompleto && data.insigniaObtenida && !data.insigniaYaObtenida) {
      // La notificación ahora se maneja en la página de Insignias con animaciones
      // showNotification(`🎉 ¡FELICITACIONES! ${data.message} 🌟 Insignia: "${data.insignia.nombre}" ⭐ +${data.puntosGanados} puntos ¡Visita la sección de Insignias para verla!`, 6000);
      // Recargar el perfil para actualizar los puntos
      await fetchUserProfile();
    }
  } catch (error) {
    console.error('❌ Error verificando insignia:', error);
  }
};

  const getPuntosPorNivel = (level) => {
    const puntos = { 1: 50, 2: 75, 3: 60, 4: 40 };
    return puntos[level] || 0;
  };

  const getLevelStatus = (level) => {
    return userProfile?.niveles[`nivel${level}`]?.completado ? 'completed' : 'pending';
  };

  const toggleSector = (sector) => {
    const sectoresActuales = formData[1]?.sector || [];
    if (sectoresActuales.includes(sector)) {
      handleInputChange(1, 'sector', sectoresActuales.filter(s => s !== sector));
    } else {
      handleInputChange(1, 'sector', [...sectoresActuales, sector]);
    }
  };

  const sectoresDisponibles = [
    "Tecnología", "Salud", "Educación", "Finanzas", 
    "Comercio", "Manufactura", "Servicios", "Marketing", "Ventas"
  ];

  const nivelesEstudio = [
    "Bachillerato", "Técnico", "Tecnólogo", "Pregrado", 
    "Especialización", "Maestría", "Doctorado"
  ];

  const disponibilidades = [
    "Tiempo completo", "Medio tiempo", "Por horas", 
    "Remoto", "Presencial", "Híbrido"
  ];

  const idiomasComunes = [
    "Español", "Inglés", "Portugués", "Francés", 
    "Alemán", "Italiano", "Chino", "Japonés"
  ];

  const levelForms = {
    1: {
      title: "Información Básica",
      icon: <User className="w-6 h-6" />,
    },
    2: {
      title: "Experiencia Laboral",
      icon: <Briefcase className="w-6 h-6" />,
    },
    3: {
      title: "Habilidades",
      icon: <FileText className="w-6 h-6" />,
    },
    4: {
      title: "Idiomas y Referencias",
      icon: <Languages className="w-6 h-6" />,
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const nivelesCompletados = userProfile?.progresoTotal?.nivelesCompletados || 0;
  const porcentajePerfil = userProfile?.progresoTotal?.porcentajePerfil || 0;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda - Información del Perfil */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card de Usuario */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {userProfile?.cuenta?.nombreUsuario}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {userProfile?.cuenta?.correo}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 text-center">
                <div className="text-2xl font-bold text-tertiaryBrand-purple400">
                  {userProfile?.cuenta?.puntos || 0}
                </div>
                <p className="text-sm text-gray-500">Puntos Totales</p>
              </div>
            </div>

            {/* Notificaciones Push */}
            <PushNotifications cuentaId={userId} />

            {/* Progreso del Perfil */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-primaryBrand-300 mb-4">
                Progreso del Perfil
              </h3>
              
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-700">
                    <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-tertiaryBrand-purple400">
                        {porcentajePerfil}%
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  {nivelesCompletados}/4 niveles completados
                </p>
              </div>

              <div className="w-full bg-tertiaryBrand-purple100 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-purple-700 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${porcentajePerfil}%` }}
                ></div>
              </div>

              {porcentajePerfil === 100 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                  <p className="text-green-700 text-sm font-semibold">
                    🎉 ¡Perfil completo!
                  </p>
                </div>
              )}
            </div>

            {/* Navegación de niveles */}
            <div className="space-y-3">
              {[1, 2, 3, 4].map(level => (
                <button
                  key={level}
                  onClick={() => {
                    setActiveLevel(level);
                    setEditMode(false);
                    // Feedback al cambiar de nivel
                    showSuccessFeedback(`Navegando a Nivel ${level}`, { duration: 1500 });
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                    activeLevel === level
                      ? 'bg-tertiaryBrand-purple400 text-white shadow-lg'
                      : getLevelStatus(level) === 'completed'
                      ? 'bg-green-50 text-green-700 border-2 border-green-200'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeLevel === level 
                      ? 'bg-white bg-opacity-20' 
                      : getLevelStatus(level) === 'completed'
                      ? 'bg-green-100'
                      : 'bg-tertiaryBrand-purple50'
                  }`}>
                    {getLevelStatus(level) === 'completed' ? (
                      <CheckCircle className={`w-5 h-5 ${activeLevel === level ? 'text-white' : 'text-green-600'}`} />
                    ) : (
                      React.cloneElement(levelForms[level]?.icon, {
                        className: `w-5 h-5 ${activeLevel === level ? 'text-white' : 'text-tertiaryBrand-purple400'}`
                      })
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">Nivel {level}</div>
                    <div className={`text-xs truncate ${activeLevel === level ? 'opacity-90' : 'opacity-70'}`}>
                      {levelForms[level]?.title}
                    </div>
                  </div>
                  {getLevelStatus(level) === 'completed' && (
                    <Award className={`w-4 h-4 flex-shrink-0 ${activeLevel === level ? 'text-yellow-300' : 'text-yellow-500'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Columna Derecha - Contenido del Nivel */}
          <div className="lg:col-span-2">
            <div id={`nivel-${activeLevel}`} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover-lift">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    {React.cloneElement(levelForms[activeLevel]?.icon, {
                      className: 'w-6 h-6 text-tertiaryBrand-purple400'
                    })}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {levelForms[activeLevel]?.title}
                    </h2>
                    {!getLevelStatus(activeLevel) && (
                      <p className="text-tertiaryBrand-purple400 text-sm">
                        +{getPuntosPorNivel(activeLevel)} puntos
                      </p>
                    )}
                  </div>
                </div>

                {!editMode ? (
                  <button
                    onClick={() => {
                      setEditMode(true);
                      showProgressFeedback(`Modo edición activado para Nivel ${activeLevel}`, { duration: 2000 });
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-tertiaryBrand-purple400 bg-tertiaryBrand-purple50 rounded-lg hover:bg-tertiaryBrand-purple100 transition-colors button-press hover-lift"
                  >
                    <Edit className="w-4 h-4" />
                    {getLevelStatus(activeLevel) ? 'Editar' : 'Completar'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditMode(false);
                        initializeFormData(userProfile.niveles);
                      }}
                      className="px-4 py-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => saveLevel(activeLevel)}
                      disabled={saveStatus[activeLevel] === 'saving'}
                      className="flex items-center gap-2 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 button-press hover-lift"
                    >
                      {saveStatus[activeLevel] === 'saving' ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saveStatus[activeLevel] === 'saving' ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                )}
              </div>

              {editMode ? (
                <div className="space-y-6">
                  {/* NIVEL 1 - Información Básica */}
                  {activeLevel === 1 && (
                    <div className="space-y-6">
                      {/* Sectores - Selección múltiple */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sectores de interés
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {sectoresDisponibles.map(sector => (
                            <button
                              key={sector}
                              type="button"
                              onClick={() => toggleSector(sector)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                (formData[1]?.sector || []).includes(sector)
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {sector}
                            </button>
                          ))}
                        </div>
                        {(formData[1]?.sector || []).length > 0 && (
                          <p className="text-sm text-gray-500 mt-2">
                            Seleccionados: {(formData[1]?.sector || []).join(', ')}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cargo deseado
                          </label>
                          <input
                            type="text"
                            value={formData[1]?.cargo || ''}
                            onChange={(e) => handleInputChange(1, 'cargo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Ej: Desarrollador Frontend"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Salario deseado
                          </label>
                          <input
                            type="number"
                            value={formData[1]?.salarioDeseado || ''}
                            onChange={(e) => handleInputChange(1, 'salarioDeseado', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="3000000"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nivel de estudios
                          </label>
                          <select
                            value={formData[1]?.estudios || ''}
                            onChange={(e) => handleInputChange(1, 'estudios', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="">Selecciona</option>
                            {nivelesEstudio.map(nivel => (
                              <option key={nivel} value={nivel}>{nivel}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ciudad
                          </label>
                          <input
                            type="text"
                            value={formData[1]?.ciudad || ''}
                            onChange={(e) => handleInputChange(1, 'ciudad', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Bogotá, Medellín..."
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Disponibilidad
                          </label>
                          <select
                            value={formData[1]?.disponibilidad || ''}
                            onChange={(e) => handleInputChange(1, 'disponibilidad', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="">Selecciona</option>
                            {disponibilidades.map(disp => (
                              <option key={disp} value={disp}>{disp}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NIVEL 2 - Experiencia Laboral */}
                  {activeLevel === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Experiencias Laborales</h3>
                        <button
                          type="button"
                          onClick={addExperiencia}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Agregar
                        </button>
                      </div>

                      {(formData[2]?.experiencias || []).map((exp, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">Experiencia {index + 1}</h4>
                            {(formData[2]?.experiencias || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeExperiencia(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Título del cargo
                              </label>
                              <input
                                type="text"
                                value={exp.titulo || ''}
                                onChange={(e) => handleExperienciaChange(index, 'titulo', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Ej: Desarrollador Junior"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duración (años)
                              </label>
                              <input
                                type="number"
                                value={exp.duracion || ''}
                                onChange={(e) => handleExperienciaChange(index, 'duracion', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="2"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium text-gray-700">
                                Funciones principales
                              </label>
                              <button
                                type="button"
                                onClick={() => addFuncion(index)}
                                className="text-purple-600 hover:text-purple-700 text-sm"
                              >
                                <Plus className="w-4 h-4 inline mr-1" />
                                Agregar función
                              </button>
                            </div>
                            <div className="space-y-2">
                              {(exp.funciones || []).map((func, funcIndex) => (
                                <div key={funcIndex} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={func || ''}
                                    onChange={(e) => handleFuncionChange(index, funcIndex, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Describe una función"
                                  />
                                  {(exp.funciones || []).length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeFuncion(index, funcIndex)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* NIVEL 3 - Habilidades */}
                  {activeLevel === 3 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción de perfil
                        </label>
                        <textarea
                          value={formData[3]?.descripcionPerfil || ''}
                          onChange={(e) => handleInputChange(3, 'descripcionPerfil', e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                          placeholder="Describe tu perfil profesional, objetivos y experiencia..."
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            Habilidades técnicas
                          </label>
                          <button
                            type="button"
                            onClick={() => addArrayItem(3, 'habilidades')}
                            className="text-purple-600 hover:text-purple-700 text-sm"
                          >
                            <Plus className="w-4 h-4 inline mr-1" />
                            Agregar habilidad
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(formData[3]?.habilidades || []).map((habilidad, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={habilidad || ''}
                                onChange={(e) => handleArrayChange(3, 'habilidades', index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Ej: JavaScript, React, Node.js"
                              />
                              {(formData[3]?.habilidades || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeArrayItem(3, 'habilidades', index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NIVEL 4 - Idiomas y Referencias */}
                  {activeLevel === 4 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            Idiomas
                          </label>
                          <button
                            type="button"
                            onClick={() => addArrayItem(4, 'idiomas')}
                            className="text-purple-600 hover:text-purple-700 text-sm"
                          >
                            <Plus className="w-4 h-4 inline mr-1" />
                            Agregar
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(formData[4]?.idiomas || []).map((idioma, index) => (
                            <div key={index} className="flex gap-2">
                              <select
                                value={idioma || ''}
                                onChange={(e) => handleArrayChange(4, 'idiomas', index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              >
                                <option value="">Selecciona un idioma</option>
                                {idiomasComunes.map(idiomaOpt => (
                                  <option key={idiomaOpt} value={idiomaOpt}>
                                    {idiomaOpt}
                                  </option>
                                ))}
                              </select>
                              {(formData[4]?.idiomas || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeArrayItem(4, 'idiomas', index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            Referencias
                          </label>
                          <button
                            type="button"
                            onClick={() => addArrayItem(4, 'referencias')}
                            className="text-purple-600 hover:text-purple-700 text-sm"
                          >
                            <Plus className="w-4 h-4 inline mr-1" />
                            Agregar
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(formData[4]?.referencias || []).map((referencia, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={referencia || ''}
                                onChange={(e) => handleArrayChange(4, 'referencias', index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Nombre y contacto"
                              />
                              {(formData[4]?.referencias || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeArrayItem(4, 'referencias', index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Vista de solo lectura */}
                  {getLevelStatus(activeLevel) === 'completed' ? (
                    <>
                      {/* NIVEL 1 - Vista */}
                      {activeLevel === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoCard 
                            icon={User} 
                            title="Sectores" 
                            value={(userProfile?.niveles?.nivel1?.sector || []).join(', ')} 
                          />
                          <InfoCard 
                            icon={Briefcase} 
                            title="Cargo deseado" 
                            value={userProfile?.niveles?.nivel1?.cargo} 
                          />
                          <InfoCard 
                            icon={DollarSign} 
                            title="Salario esperado" 
                            value={`${Number(userProfile?.niveles?.nivel1?.salarioDeseado || 0).toLocaleString()}`} 
                          />
                          <InfoCard 
                            icon={GraduationCap} 
                            title="Estudios" 
                            value={userProfile?.niveles?.nivel1?.estudios} 
                          />
                          <InfoCard 
                            icon={MapPin} 
                            title="Ciudad" 
                            value={userProfile?.niveles?.nivel1?.ciudad} 
                          />
                          <InfoCard 
                            icon={Clock} 
                            title="Disponibilidad" 
                            value={userProfile?.niveles?.nivel1?.disponibilidad} 
                          />
                        </div>
                      )}

                      {/* NIVEL 2 - Vista */}
                      {activeLevel === 2 && (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900">Experiencia Laboral</h3>
                          {(userProfile?.niveles?.nivel2?.experiencias || []).map((exp, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900">{exp.titulo}</h4>
                              <p className="text-sm text-gray-600 mt-1">{exp.duracion} años</p>
                              <ul className="mt-2 space-y-1">
                                {(exp.funciones || []).map((func, funcIndex) => (
                                  <li key={funcIndex} className="text-sm text-gray-600 flex items-start">
                                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2 mt-1.5"></div>
                                    {func}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* NIVEL 3 - Vista */}
                      {activeLevel === 3 && (
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Descripción del Perfil</h3>
                            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                              {userProfile?.niveles?.nivel3?.descripcionPerfil}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Habilidades</h3>
                            <div className="flex flex-wrap gap-2">
                              {(userProfile?.niveles?.nivel3?.habilidades || []).map((habilidad, index) => (
                                <span 
                                  key={index} 
                                  className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                                >
                                  {habilidad}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* NIVEL 4 - Vista */}
                      {activeLevel === 4 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Languages className="w-5 h-5 text-purple-600" />
                              Idiomas
                            </h3>
                            <div className="space-y-2">
                              {(userProfile?.niveles?.nivel4?.idiomas || []).map((idioma, index) => (
                                <div key={index} className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-lg">
                                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                                  {idioma}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <User className="w-5 h-5 text-purple-600" />
                              Referencias
                            </h3>
                            <div className="space-y-2">
                              {(userProfile?.niveles?.nivel4?.referencias || []).map((referencia, index) => (
                                <div key={index} className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-lg">
                                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                                  {referencia}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Edit className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        Nivel sin completar
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Completa este nivel para mejorar tu perfil profesional y ganar +{getPuntosPorNivel(activeLevel)} puntos
                      </p>
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        Comenzar ahora
                      </button>
                    </div>
                  )}
                </div>
              )}

              {saveStatus[activeLevel] === 'success' && (
                <div className="flex items-center gap-2 mt-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <span className="font-medium">¡Guardado exitosamente!</span>
                    <p className="text-sm text-green-600 mt-1">
                      +{getPuntosPorNivel(activeLevel)} puntos otorgados
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Favoritos */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Favoritos</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Empleos guardados</p>
              </div>
              {favoritos && favoritos.length > 0 ? (
                <div className="space-y-3">
                  {(
                    showAllFavoritos ? favoritos : favoritos.slice(0, 10)
                  ).map((job) => (
                    <a key={job.id} href={`/jobs?jobId=${job.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                      <div>
                        <div className="font-medium text-gray-800">{job.nombre}</div>
                        <div className="text-sm text-gray-500">{job.empresa || job.ciudad}</div>
                      </div>
                      <div className="text-sm text-purple-600">Ver</div>
                    </a>
                  ))}

                  {favoritos.length > 10 && (
                    <div className="text-center mt-2">
                      <button
                        onClick={() => setShowAllFavoritos(s => !s)}
                        className="text-sm text-purple-600 hover:underline"
                      >
                        {showAllFavoritos ? 'Ver menos' : 'Ver más'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-6">No tienes empleos favoritos guardados.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para mostrar información en modo lectura
const InfoCard = ({ icon: Icon, title, value }) => (
  <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors bg-gray-50">
    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon className="w-6 h-6 text-purple-600" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-medium text-gray-500">{title}</h4>
      <p className="text-gray-900 font-medium truncate">{value || 'No especificado'}</p>
    </div>
  </div>
)
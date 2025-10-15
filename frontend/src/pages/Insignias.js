import { useState, useEffect } from 'react';
import { useNotification } from "../components/NotificationProvider";
import { useFeedback } from "../components/FeedbackProvider";
import { Award, Lock, Star, Calendar, CheckCircle, RefreshCw } from 'lucide-react';

export default function Insignias() {
  const [insignia, setInsignia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificando, setVerificando] = useState(false);
  const { showNotification } = useNotification();
  const { celebrateAchievement, showSuccessFeedback, animateElement } = useFeedback();

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  useEffect(() => {
    if (userId) {
      fetchInsignia();
      // Verificar si el perfil está completo
      verificarPerfilCompleto();
    } else {
      setError('No se encontró el ID de usuario');
      setLoading(false);
    }
  }, [userId]);

  const fetchInsignia = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`http://localhost:5000/api/insignias/insignia/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setInsignia(data.insignia);
      } else {
        setError(data.message || 'Error al cargar la insignia');
      }
    } catch (error) {
      console.error('❌ Error cargando insignia:', error);
      setError(`Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  //Verificar si el perfil está completo
  const verificarPerfilCompleto = async () => {
    try {
      setVerificando(true);
      console.log('🔄 Verificando perfil completo...');
      
      const response = await fetch('http://localhost:5000/api/insignias/verificar-perfil-completo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cuentaId: userId })
      });

      const data = await response.json();
      console.log('📊 Resultado verificación:', data);

      if (data.success && data.insigniaObtenida) {
        console.log('🎉 ¡Insignia obtenida! Recargando...');
        // Recargar los datos de la insignia
        await fetchInsignia();
        
        // Mostrar animación de celebración si es una nueva insignia
        if (!data.insigniaYaObtenida && data.insignia) {
          celebrateAchievement({
            nombre: data.insignia.nombre,
            descripcion: data.insignia.descripcion,
            icono: data.insignia.icono
          }, { type: 'achievement' });
          
          // Animar el elemento de la insignia
          setTimeout(() => {
            animateElement('insignia-card', 'animate-celebration');
          }, 3000);
        } else {
          // Mostrar feedback de éxito sin la animación completa
          showSuccessFeedback('¡Perfil verificado correctamente! ✅');
        }
      }
    } catch (error) {
      console.error('Error verificando perfil:', error);
    } finally {
      setVerificando(false);
    }
  };

  //Forzar la verificación manualmente
  const handleVerificarManual = async () => {
    await verificarPerfilCompleto();
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Award className="w-12 h-12 mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold">Mis Insignias</h1>
          </div>
          <p className="text-purple-100 text-lg">
            Completa desafíos y gana reconocimientos especiales
          </p>
          
          {/*Botón de verificación manual */}
          <button
            onClick={handleVerificarManual}
            disabled={verificando}
            className="mt-4 inline-flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 button-press hover-lift"
          >
            {verificando ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {verificando ? 'Verificando...' : 'Verificar Progreso'}
          </button>
          
          {/* Botones de prueba para demostración */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => {
                celebrateAchievement({
                  nombre: "¡Logro de Prueba!",
                  descripcion: "Demostración del sistema de animaciones con partículas",
                  icono: "🏆"
                }, { type: 'achievement' });
              }}
              className="bg-yellow-500/20 text-white px-3 py-1 rounded-lg text-sm hover:bg-yellow-500/30 transition-all button-press"
            >
              🏆 Probar Logro
            </button>
            <button
              onClick={() => {
                celebrateAchievement({
                  nombre: "¡Éxito Completado!",
                  descripcion: "Has dominado el sistema de feedback instantáneo",
                  icono: "✅"
                }, { type: 'success' });
              }}
              className="bg-green-500/20 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-500/30 transition-all button-press"
            >
              ✅ Probar Éxito
            </button>
            <button
              onClick={() => {
                celebrateAchievement({
                  nombre: "¡Hito Alcanzado!",
                  descripcion: "Has llegado a un punto importante en tu progreso",
                  icono: "🌟"
                }, { type: 'milestone' });
              }}
              className="bg-purple-500/20 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-500/30 transition-all button-press"
            >
              🌟 Probar Hito
            </button>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Mostrar estado de verificación */}
        {verificando && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verificando tu progreso...</span>
            </div>
          </div>
        )}

        {/* Estadística */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu Progreso</h2>
              <p className="text-gray-600">
                {insignia?.obtenida ? '1 insignia obtenida' : '0 insignias obtenidas'}
              </p>
              {/* Información adicional */}
              {!insignia?.obtenida && (
                <p className="text-sm text-purple-600 mt-1">
                  Completa los 4 niveles de tu perfil para desbloquearla
                </p>
              )}
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mb-2">
                <span className="text-3xl font-bold text-white">
                  {insignia?.obtenida ? '1' : '0'}/1
                </span>
              </div>
              <p className="text-sm text-gray-500">Completado</p>
            </div>
          </div>
        </div>

        {/* Insignia Principal */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            {insignia?.obtenida ? (
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            ) : (
              <Lock className="w-6 h-6 text-gray-400 mr-2" />
            )}
            {insignia?.obtenida ? 'Insignia Obtenida' : 'Insignia Pendiente'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InsigniaCard insignia={insignia} obtenida={insignia?.obtenida} />
          </div>
        </div>

        {/* Mensaje Motivacional */}
        {!insignia?.obtenida && (
          <div className="mt-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white text-center shadow-xl">
            <Star className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-3">¡Completa tu perfil!</h3>
            <p className="text-purple-100 text-lg mb-6">
              Completa los 4 niveles de tu perfil para desbloquear tu primera insignia
              y ganar 100 puntos bonus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/perfil"
                className="inline-block bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl button-press hover-lift"
              >
                Ir a Mi Perfil
              </a>
              <button
                onClick={() => {
                  // Simular logro para prueba
                  celebrateAchievement({
                    nombre: "¡Logro de Prueba!",
                    descripcion: "Esta es una demostración del sistema de animaciones",
                    icono: "🎯"
                  }, { type: 'achievement' });
                }}
                className="inline-block bg-white/20 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all shadow-lg hover:shadow-xl button-press hover-lift border border-white/30"
              >
                🎯 Probar Animación
              </button>
              <button
                onClick={handleVerificarManual}
                disabled={verificando}
                className="inline-flex items-center justify-center gap-2 bg-yellow-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {verificando ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Verificar Ahora
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de tarjeta de insignia
function InsigniaCard({ insignia, obtenida }) {
  if (!insignia) return null;

  return (
    <div
      id="insignia-card"
      className={`relative rounded-2xl p-6 shadow-lg transition-all duration-300 hover-lift ${
        obtenida
          ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 hover:shadow-xl hover:scale-105'
          : 'bg-gray-50 border-2 border-gray-200 opacity-75'
      }`}
    >
      {/* Badge de Estado */}
      <div className="absolute top-4 right-4">
        {obtenida ? (
          <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Obtenida
          </div>
        ) : (
          <div className="bg-gray-400 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Bloqueada
          </div>
        )}
      </div>

      {/* Icono de la Insignia */}
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
          obtenida
            ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg'
            : 'bg-gray-300'
        }`}
      >
        <span className="text-5xl">{obtenida ? insignia.icono : '🔒'}</span>
      </div>

      {/* Información */}
      <div className="text-center">
        <h4
          className={`text-xl font-bold mb-2 ${
            obtenida ? 'text-gray-800' : 'text-gray-500'
          }`}
        >
          {insignia.nombre}
        </h4>
        <p
          className={`text-sm mb-4 ${
            obtenida ? 'text-gray-600' : 'text-gray-400'
          }`}
        >
          {insignia.descripcion}
        </p>

        {/* Fecha de obtención */}
        {obtenida && insignia.fechaObtenida && (
          <div className="flex items-center justify-center text-xs text-gray-500 bg-white bg-opacity-50 rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 mr-2" />
            Obtenida el {new Date(insignia.fechaObtenida).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        )}

        {/* Requisitos si no está obtenida */}
        {!obtenida && (
          <div className="mt-4 bg-white bg-opacity-70 rounded-lg p-3">
            <p className="text-xs text-gray-600 font-medium mb-2">
              📋 Requisitos:
            </p>
            <ul className="text-xs text-gray-600 space-y-1 text-left">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Completar Nivel 1 (Información Básica)
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Completar Nivel 2 (Experiencia Laboral)
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Completar Nivel 3 (Habilidades)
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Completar Nivel 4 (Idiomas y Referencias)
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Efecto de brillo para insignias obtenidas */}
      {obtenida && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white to-transparent opacity-20 pointer-events-none"></div>
      )}
    </div>
  );
}
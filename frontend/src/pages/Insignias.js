import { useState, useEffect } from 'react';
import { useNotification } from "../components/NotificationProvider";
import { useFeedback } from "../components/FeedbackProvider";
import { Award, Star, RefreshCw } from 'lucide-react';
import BadgePanel from '../components/BadgePanel';
import { getBadgeTemplates } from '../utils/badgeFactory';
import config from '../config';

const API_BASE_URL = config.API_URL;

export default function Insignias() {
  const [insignia, setInsignia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificando, setVerificando] = useState(false);
  const { showNotification } = useNotification();
  const { celebrateAchievement, showSuccessFeedback, animateElement } = useFeedback();

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const templates = getBadgeTemplates();
  const totalBadges = templates.length;
  const [obtainedCount, setObtainedCount] = useState(0);

  useEffect(() => {
    if (userId) {
      fetchInsignia();
      fetchBadgeCounts();
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
      
      const response = await fetch(`${API_BASE_URL}/insignias/insignia/${userId}`);
      
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

  const fetchBadgeCounts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/perfil/${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && data.perfil && Array.isArray(data.perfil.insignias)) {
        const count = data.perfil.insignias.filter(i => i && i.obtenida).length;
        setObtainedCount(count);
      } else {
        setObtainedCount(0);
      }
    } catch (err) {
      console.error('Error cargando conteo de insignias:', err);
      setObtainedCount(0);
    }
  };

  //Verificar si el perfil está completo
  const verificarPerfilCompleto = async () => {
    try {
      setVerificando(true);
      console.log('🔄 Verificando perfil completo...');
      
      const response = await fetch(`${API_BASE_URL}/insignias/verificar-perfil-completo`, {
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
          <p className="text-tertiaryBrand-purple50 text-lg">
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
              className="bg-purple-500/20 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-600/30 transition-all button-press"
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
                {obtainedCount} {obtainedCount === 1 ? 'insignia obtenida' : 'insignias obtenidas'}
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
                  {obtainedCount}/{totalBadges}
                </span>
              </div>
              <p className="text-sm text-gray-500">Completado</p>
            </div>
          </div>
        </div>

        

        {/* Panel de Insignias: colección completa (desbloqueadas y pendientes) */}
        <BadgePanel />

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

// Insignia principal removed: collection view now contains all badges
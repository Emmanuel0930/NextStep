import React, { useEffect, useState } from 'react';
import { Flame, Trophy, Calendar, Target, Settings } from 'lucide-react';
import config from '../config';

const API_BASE_URL = config.API_URL;

const StreakCounter = ({ cuentaId, size = 'normal', showConfig = false }) => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configuracion, setConfiguracion] = useState({
    notificacionesActivas: true,
    horaNotificacion: '19:00'
  });
  const [showSettings, setShowSettings] = useState(false);

  const sizeClasses = {
    small: {
      container: 'p-4',
      title: 'text-lg',
      number: 'text-3xl',
      subtitle: 'text-sm',
      icon: 'w-8 h-8',
      flame: 'text-2xl'
    },
    normal: {
      container: 'p-6',
      title: 'text-xl',
      number: 'text-4xl',
      subtitle: 'text-base',
      icon: 'w-10 h-10',
      flame: 'text-3xl'
    },
    large: {
      container: 'p-8',
      title: 'text-2xl',
      number: 'text-5xl',
      subtitle: 'text-lg',
      icon: 'w-12 h-12',
      flame: 'text-4xl'
    }
  };

  const currentSize = sizeClasses[size];

  useEffect(() => {
    if (cuentaId) {
      cargarEstadisticas();
    }
  }, [cuentaId]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/rachas/estadisticas/${cuentaId}`);
      const data = await response.json();

      if (data.success) {
        setEstadisticas(data.estadisticas);
        setConfiguracion({
          notificacionesActivas: data.estadisticas.notificacionesActivas,
          horaNotificacion: data.estadisticas.horaNotificacion
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas de racha:', error);
    } finally {
      setLoading(false);
    }
  };

  const configurarNotificaciones = async (nuevaConfig) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rachas/configurar-notificaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cuentaId,
          ...nuevaConfig
        }),
      });

      const data = await response.json();
      if (data.success) {
        setConfiguracion(data.configuracion);
        setShowSettings(false);
      }
    } catch (error) {
      console.error('Error configurando notificaciones:', error);
    }
  };

  const obtenerTextoMotivacional = (dias) => {
    if (dias === 0) return "¡Comienza tu racha hoy! 💪";
    if (dias === 1) return "¡Excelente inicio! 🌟";
    if (dias < 7) return `¡${dias} días seguidos! 🔥`;
    if (dias < 14) return `¡Una semana completa! 🏆`;
    if (dias < 30) return `¡${dias} días imparable! 👑`;
    return `¡${dias} días de leyenda! 🚀`;
  };

  const obtenerColorFuego = (dias) => {
    if (dias === 0) return 'text-gray-400';
    if (dias < 3) return 'text-orange-400';
    if (dias < 7) return 'text-orange-500';
    if (dias < 14) return 'text-red-500';
    if (dias < 30) return 'text-red-600';
    return 'text-purple-600';
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-purple-200 ${currentSize.container} animate-pulse`}>
        <div className="flex items-center justify-center">
          <div className="text-purple-400">Cargando racha...</div>
        </div>
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-purple-200 ${currentSize.container}`}>
        <div className="text-center text-purple-600">
          Error al cargar estadísticas de racha
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-purple-200 ${currentSize.container} relative`}>
      {/* Header con configuración */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${obtenerColorFuego(estadisticas.rachaActual)} ${currentSize.flame}`}>
            🔥
          </div>
          <h3 className={`font-bold text-purple-700 ${currentSize.title}`}>
            Racha Diaria
          </h3>
        </div>
        
        {showConfig && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-purple-500 hover:text-purple-700 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Configuración (panel desplegable) */}
      {showSettings && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-purple-200 p-4 z-10">
          <h4 className="font-semibold text-purple-700 mb-3">Configuración</h4>
          
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={configuracion.notificacionesActivas}
                onChange={(e) => configurarNotificaciones({ 
                  notificacionesActivas: e.target.checked 
                })}
                className="text-purple-600"
              />
              <span className="text-sm">Notificaciones activas</span>
            </label>
            
            {configuracion.notificacionesActivas && (
              <div>
                <label className="block text-sm text-purple-600 mb-1">
                  Hora de notificación:
                </label>
                <input
                  type="time"
                  value={configuracion.horaNotificacion}
                  onChange={(e) => configurarNotificaciones({ 
                    horaNotificacion: e.target.value 
                  })}
                  className="w-full px-3 py-1 border border-purple-300 rounded text-sm"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Racha actual */}
      <div className="text-center mb-6">
        <div className={`font-bold text-purple-800 ${currentSize.number} mb-2`}>
          {estadisticas.rachaActual}
        </div>
        <div className={`text-purple-600 ${currentSize.subtitle} font-medium`}>
          días consecutivos
        </div>
        <div className={`text-purple-500 opacity-75 ${currentSize.subtitle === 'text-sm' ? 'text-xs' : 'text-sm'} mt-1`}>
          {obtenerTextoMotivacional(estadisticas.rachaActual)}
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Trophy className={`text-purple-600 ${currentSize.icon === 'w-12 h-12' ? 'w-6 h-6' : 'w-5 h-5'}`} />
          </div>
          <div className="font-bold text-purple-800 text-lg">
            {estadisticas.mejorRacha}
          </div>
          <div className="text-purple-600 text-xs">
            Mejor racha
          </div>
        </div>

        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Calendar className={`text-purple-600 ${currentSize.icon === 'w-12 h-12' ? 'w-6 h-6' : 'w-5 h-5'}`} />
          </div>
          <div className="font-bold text-purple-800 text-lg">
            {estadisticas.totalDiasConLogin}
          </div>
          <div className="text-purple-600 text-xs">
            Total días
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-4 pt-4 border-t border-purple-100">
        <div className="flex items-center justify-between text-xs text-purple-500">
          <span>Último login:</span>
          <span>{formatearFecha(estadisticas.ultimoLogin)}</span>
        </div>
        
        {estadisticas.rachaActual > 0 && (
          <div className="flex items-center justify-between text-xs text-purple-500 mt-1">
            <span>Racha iniciada:</span>
            <span>{formatearFecha(estadisticas.fechaInicioRachaActual)}</span>
          </div>
        )}
        
        {configuracion.notificacionesActivas && (
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-purple-400">
            <Target className="w-3 h-3" />
            <span>Notificaciones a las {configuracion.horaNotificacion}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakCounter;

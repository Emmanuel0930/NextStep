import React from 'react';
import { useNiveles } from '../utils/nivelesSystem';

const NivelDisplay = ({ puntos, showProgress = true, size = 'normal' }) => {
  const { 
    nivelActual, 
    siguienteNivel, 
    progreso, 
    puntosParaSiguienteNivel, 
    esNivelMaximo 
  } = useNiveles(puntos || 0);

  const sizeClasses = {
    small: {
      container: 'p-3',
      icon: 'text-2xl',
      title: 'text-sm',
      subtitle: 'text-xs',
      badge: 'px-2 py-1 text-xs'
    },
    normal: {
      container: 'p-4',
      icon: 'text-3xl',
      title: 'text-lg',
      subtitle: 'text-sm',
      badge: 'px-3 py-1 text-sm'
    },
    large: {
      container: 'p-6',
      icon: 'text-4xl',
      title: 'text-xl',
      subtitle: 'text-base',
      badge: 'px-4 py-2 text-base'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-purple-200 ${currentSize.container}`}>
      {/* Header con nivel actual */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
            <span className={currentSize.icon}>{nivelActual.icono}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-purple-700 ${currentSize.title}`}>
                {nivelActual.nombre}
              </h3>
              <span className={`bg-purple-500 text-white font-medium rounded-full ${currentSize.badge} shadow-sm`}>
                Nivel {nivelActual.nivel}
              </span>
            </div>
            <p className={`text-purple-600 opacity-75 ${currentSize.subtitle}`}>
              {nivelActual.descripcion}
            </p>
          </div>
        </div>
      </div>

      {/* Puntos actuales */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-purple-600 font-medium">Puntos:</span>
        <span className="font-bold text-purple-800">{puntos?.toLocaleString() || 0}</span>
      </div>

      {/* Progreso hacia siguiente nivel */}
      {showProgress && !esNivelMaximo && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-600">
              Progreso a {siguienteNivel.nombre}
            </span>
            <span className="font-semibold text-purple-700">
              {progreso}%
            </span>
          </div>
          
          <div className="w-full bg-purple-100 rounded-full h-3 shadow-inner">
            <div 
              className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 shadow-sm"
              style={{ width: `${progreso}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-purple-500">
            <span>{puntos?.toLocaleString() || 0} pts</span>
            <span>Faltan {puntosParaSiguienteNivel.toLocaleString()} pts</span>
            <span>{siguienteNivel.puntosMinimos.toLocaleString()} pts</span>
          </div>
        </div>
      )}

      {/* Nivel máximo alcanzado */}
      {esNivelMaximo && showProgress && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full font-semibold text-sm shadow-lg">
            <span>👑</span>
            ¡Nivel Máximo Alcanzado!
          </div>
        </div>
      )}
    </div>
  );
};

export default NivelDisplay;
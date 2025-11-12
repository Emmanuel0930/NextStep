import React from 'react';
import { Calendar, CheckCircle, Lock } from 'lucide-react';

// Reutiliza el mismo estilo/estructura que la tarjeta principal de Insignias
const BadgeCard = ({ badge, unlocked }) => {
  const obtenida = Boolean(unlocked);

  return (
    <div
      id={`badge-card-${badge.key}`}
      className={`relative rounded-2xl p-6 shadow-lg transition-all duration-300 hover-lift ${
        obtenida
          ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 hover:shadow-xl hover:scale-105'
          : 'bg-gray-50 border-2 border-gray-200 opacity-75'
      }`}
    >
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

      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
          obtenida ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg' : 'bg-gray-300'
        }`}
      >
        <span className="text-5xl">{obtenida ? badge.icono : '🔒'}</span>
      </div>

      <div className="text-center">
        <h4 className={`text-xl font-bold mb-2 ${obtenida ? 'text-gray-800' : 'text-gray-500'}`}>
          {badge.nombre}
        </h4>
        <p className={`text-sm mb-4 ${obtenida ? 'text-gray-600' : 'text-gray-400'}`}>{badge.descripcion}</p>

        {obtenida && badge.fechaObtenida && (
          <div className="flex items-center justify-center text-xs text-gray-500 bg-white bg-opacity-50 rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 mr-2" />
            Obtenida el {new Date(badge.fechaObtenida).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        )}

        {!obtenida && (
          <div className="mt-4 bg-white bg-opacity-70 rounded-lg p-3">
            <p className="text-xs text-gray-600 font-medium mb-2">📋 Requisitos:</p>
            <ul className="text-xs text-gray-600 space-y-1 text-left">
              <li className="flex items-start"><span className="mr-2">•</span>{badge.requisito || 'Completa los requisitos para desbloquear esta insignia'}</li>
            </ul>
          </div>
        )}
      </div>

      {obtenida && <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white to-transparent opacity-20 pointer-events-none"></div>}
    </div>
  );
};

export default BadgeCard;

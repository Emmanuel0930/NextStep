import React from 'react';
import { Trophy, Crown, Star, Flame, Target, User, Award, TrendingUp } from 'lucide-react';

const RankingTable = ({ ranking, miPosicion, loading }) => {
  const getMedalla = (posicion) => {
    switch (posicion) {
      case 1:
        return { icon: <Crown className="w-5 h-5" />, color: 'text-yellow-500', bg: 'bg-yellow-100' };
      case 2:
        return { icon: <Trophy className="w-5 h-5" />, color: 'text-gray-400', bg: 'bg-gray-100' };
      case 3:
        return { icon: <Award className="w-5 h-5" />, color: 'text-orange-500', bg: 'bg-orange-100' };
      default:
        return { icon: <Target className="w-4 h-4" />, color: 'text-purple-500', bg: 'bg-purple-100' };
    }
  };

  const getColorNivel = (nivel) => {
    if (nivel >= 8) return 'text-purple-600 bg-purple-100';
    if (nivel >= 5) return 'text-blue-600 bg-blue-100';
    if (nivel >= 3) return 'text-green-600 bg-green-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-purple-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-purple-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">Ranking de Candidatos</h2>
        </div>
        <p className="text-purple-100 text-sm mt-1">
          Los usuarios más activos de la plataforma
        </p>
      </div>

      {/* Mi posición destacada */}
      {miPosicion && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-800">Tu Posición</h3>
                <p className="text-yellow-600 text-sm">
                  #{miPosicion.posicion} • {miPosicion.puntuacionTotal} pts
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-yellow-700 font-bold">Nivel {miPosicion.nivel}</p>
              <p className="text-yellow-600 text-sm">
                {miPosicion.rachaActual} días de racha
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de ranking */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posición
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nivel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Puntos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Racha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Puntuación
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ranking.map((usuario) => {
              const medalla = getMedalla(usuario.posicion);
              const colorNivel = getColorNivel(usuario.nivel);
              
              return (
                <tr 
                  key={usuario.cuentaId} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Posición */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${medalla.bg}`}>
                        <span className={`font-bold ${medalla.color}`}>
                          {usuario.posicion <= 3 ? medalla.icon : usuario.posicion}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Usuario */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {usuario.nombreUsuario}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <div className={`w-2 h-2 rounded-full ${
                            usuario.activoHoy ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          {usuario.activoHoy ? 'Activo hoy' : 'Inactivo'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Nivel */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorNivel}`}>
                      <Star className="w-3 h-3 mr-1" />
                      Nvl {usuario.nivel}
                    </span>
                  </td>

                  {/* Puntos */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      {usuario.puntos.toLocaleString()}
                    </div>
                  </td>

                  {/* Racha */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Flame className={`w-4 h-4 ${
                        usuario.rachaActual > 0 ? 'text-orange-500' : 'text-gray-300'
                      }`} />
                      <span className={`font-medium ${
                        usuario.rachaActual > 0 ? 'text-orange-600' : 'text-gray-500'
                      }`}>
                        {usuario.rachaActual} días
                      </span>
                    </div>
                  </td>

                  {/* Puntuación Total */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-right">
                      <span className="font-bold text-purple-600">
                        {usuario.puntuacionTotal.toLocaleString()}
                      </span>
                      <div className="text-xs text-gray-500">puntos</div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cuando no hay usuarios*/}
      {ranking.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay usuarios en el ranking aún</p>
        </div>
      )}
    </div>
  );
};

export default RankingTable;
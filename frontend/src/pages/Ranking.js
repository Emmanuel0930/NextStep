import React, { useState, useEffect } from 'react';
import { Trophy, Crown, TrendingUp, Users, Target } from 'lucide-react';
import RankingTable from '../components/RankingTable';
import { getRanking, getMiPosicionRanking } from '../services/api';
import { useNotification } from '../components/NotificationProvider';

export default function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [miPosicion, setMiPosicion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    limite: 20,
    totalUsuarios: 0,
    totalPaginas: 0
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    cargarRanking();
  }, [paginacion.pagina]);

  const cargarRanking = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      
      const [rankingData, miPosicionData] = await Promise.all([
        getRanking(paginacion.limite, paginacion.pagina),
        userId ? getMiPosicionRanking(userId) : Promise.resolve(null)
      ]);

      if (rankingData.success) {
        setRanking(rankingData.ranking);
        setPaginacion(prev => ({
          ...prev,
          ...rankingData.paginacion
        }));
      }

      if (miPosicionData?.success) {
        setMiPosicion(miPosicionData.miPosicion);
      }

    } catch (error) {
      console.error('Error cargando ranking:', error);
      showNotification('Error al cargar el ranking');
    } finally {
      setLoading(false);
    }
  };

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPaginas) {
      setPaginacion(prev => ({ ...prev, pagina: nuevaPagina }));
    }
  };

  const top3 = ranking.slice(0, 3);

 return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div 
        className="max-w-6xl mx-auto px-4"
        data-tutorial="ranking-section"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-800">Ranking</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Compite con otros candidatos y demuestra tu constancia. 
            Sube de nivel, mantén tu racha y acumula puntos para llegar a la cima.
          </p>
        </div>

        {/* Podio - Top 3 */}
        {top3.length > 0 && (
          <div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            data-tutorial="ranking-podium"
          >
            {/* Segundo lugar */}
            {top3[1] && (
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 transform scale-95">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-gray-500">2°</span>
                  </div>
                  <h3 className="font-bold text-gray-700 text-lg">{top3[1].nombreUsuario}</h3>
                  <p className="text-gray-500 text-sm">Nivel {top3[1].nivel}</p>
                  <div className="mt-2 text-2xl font-bold text-gray-600">
                    {top3[1].puntuacionTotal.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Primer lugar */}
            {top3[0] && (
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-6 shadow-xl transform scale-105 relative">
                <Crown className="w-8 h-8 text-white absolute -top-2 -right-2" />
                <div className="text-center">
                  <div className="w-20 h-20 bg-yellow-300 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl font-bold text-white">1°</span>
                  </div>
                  <h3 className="font-bold text-white text-xl">{top3[0].nombreUsuario}</h3>
                  <p className="text-yellow-100 text-sm">Nivel {top3[0].nivel}</p>
                  <div className="mt-2 text-3xl font-bold text-white">
                    {top3[0].puntuacionTotal.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Tercer lugar */}
            {top3[2] && (
              <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200 transform scale-95">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-orange-500">3°</span>
                  </div>
                  <h3 className="font-bold text-gray-700 text-lg">{top3[2].nombreUsuario}</h3>
                  <p className="text-gray-500 text-sm">Nivel {top3[2].nivel}</p>
                  <div className="mt-2 text-2xl font-bold text-orange-600">
                    {top3[2].puntuacionTotal.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estadísticas rápidas */}
        <div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          data-tutorial="ranking-stats"
        >
          <div className="bg-white rounded-lg p-4 shadow border border-purple-200">
            <Users className="w-6 h-6 text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-gray-800">{paginacion.totalUsuarios}</div>
            <div className="text-sm text-gray-600">Usuarios totales</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow border border-blue-200">
            <Target className="w-6 h-6 text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {ranking.reduce((max, user) => Math.max(max, user.nivel), 0)}
            </div>
            <div className="text-sm text-gray-600">Nivel máximo</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow border border-green-200">
            <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {ranking.reduce((max, user) => Math.max(max, user.puntos), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Puntos máximos</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow border border-orange-200">
            <Trophy className="w-6 h-6 text-orange-600 mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {ranking.reduce((max, user) => Math.max(max, user.rachaActual), 0)}
            </div>
            <div className="text-sm text-gray-600">Mejor racha</div>
          </div>
        </div>

        {/* Tabla de ranking */}
        <div data-tutorial="ranking-table">
          <RankingTable 
            ranking={ranking} 
            miPosicion={miPosicion}
            loading={loading}
          />
        </div>

        {/* Paginación */}
        {paginacion.totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => cambiarPagina(paginacion.pagina - 1)}
              disabled={paginacion.pagina === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            
            <span className="px-4 py-2 text-gray-600">
              Página {paginacion.pagina} de {paginacion.totalPaginas}
            </span>
            
            <button
              onClick={() => cambiarPagina(paginacion.pagina + 1)}
              disabled={paginacion.pagina === paginacion.totalPaginas}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )}; 
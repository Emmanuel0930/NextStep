import React, { useEffect, useState } from 'react';
import BadgeCard from './BadgeCard';
import { getBadgeTemplates } from '../utils/badgeFactory';

const BadgePanel = () => {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const [serverBadges, setServerBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const templates = getBadgeTemplates();

  const normalize = (s = '') =>
    String(s)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  useEffect(() => {
    const fetchPerfil = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/perfil/${userId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success && data.perfil) {
          console.log('BadgePanel - perfil.insignias:', data.perfil.insignias);
          setServerBadges(data.perfil.insignias || []);
        } else {
          console.log('BadgePanel - perfil no contiene insignias');
          setServerBadges([]);
        }
      } catch (err) {
        console.error('Error cargando perfil (insignias):', err);
        setServerBadges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [userId]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Cargando insignias...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Colección de Insignias</h3>
      <p className="text-sm text-gray-600 mb-6">Aquí puedes ver las insignias que has desbloqueado y las que faltan por obtener.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => {
          const sb = serverBadges.find(si => {
            const nombreServer = (si && (si.nombre || si.nombreInsignia || si.tipo)) || '';
            return normalize(nombreServer) === normalize(t.nombre || t.key);
          });

          const combined = { ...t, ...(sb || {}) };
          const unlocked = Boolean(sb && sb.obtenida);

          return <BadgeCard key={t.key} badge={combined} unlocked={unlocked} />;
        })}
      </div>
    </div>
  );
};

export default BadgePanel;

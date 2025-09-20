import React, { useEffect, useState } from 'react';

export default function StreakCounter() {
  const [streak, setStreak] = useState(0);
  const [lastLogin, setLastLogin] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/streak')
      .then(res => res.json())
      .then(data => {
        setStreak(data.currentStreak);
        setLastLogin(data.lastLogin);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-purple-100 rounded-lg p-6 flex flex-col items-center mt-8">
      <h2 className="text-2xl font-bold text-purple-700 mb-2">Racha diaria de actividad</h2>
      {loading ? (
        <span className="text-purple-700">Cargando...</span>
      ) : (
        <>
          <span className="text-4xl font-bold text-green-700">{streak}</span>
          <span className="text-lg text-purple-900 mt-2">Días consecutivos entrando</span>
          <span className="text-sm text-purple-500 mt-1">Último login: {new Date(lastLogin).toLocaleString()}</span>
        </>
      )}
    </div>
  );
}

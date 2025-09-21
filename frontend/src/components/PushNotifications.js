import React, { useEffect, useState } from 'react';

export default function PushNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/notifications')
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-green-100 rounded-lg p-6 flex flex-col items-center mt-8">
      <h2 className="text-2xl font-bold text-green-700 mb-2">Notificaciones Push</h2>
      {loading ? (
        <span className="text-green-700">Cargando...</span>
      ) : notifications.length === 0 ? (
        <span className="text-green-700">No hay notificaciones.</span>
      ) : (
        <ul className="mt-4 space-y-2 w-full">
          {notifications.map((notif) => (
            <li key={notif.id} className="bg-green-200 rounded px-3 py-2 text-green-900">
              <span className="font-bold">{notif.message}</span>
              <span className="block text-sm text-green-600 mt-1">Hora programada: {notif.time}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

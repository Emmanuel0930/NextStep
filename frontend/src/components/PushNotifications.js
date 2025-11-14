import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Settings, Flame, Target } from 'lucide-react';

const PushNotifications = ({ cuentaId }) => {
  const [permisosNotificacion, setPermisosNotificacion] = useState('default');
  const [configuracion, setConfiguracion] = useState({
    notificacionesActivas: false,
    horaNotificacion: '19:00'
  });
  const [loading, setLoading] = useState(true);
  const [solicitandoPermisos, setSolicitandoPermisos] = useState(false);

  useEffect(() => {
    // Verificar permisos de notificación del navegador
    if ('Notification' in window) {
      setPermisosNotificacion(Notification.permission);
    }
    
    // Cargar configuración del usuario
    if (cuentaId) {
      cargarConfiguracion();
    }
  }, [cuentaId]);

  useEffect(() => {
    // Registrar service worker si es necesario
    if ('serviceWorker' in navigator && 'Notification' in window) {
      registrarServiceWorker();
    }
  }, []);

  const registrarServiceWorker = async () => {
    try {
      // El service worker ya existe, solo verificamos su estado
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        console.log('Service worker ya registrado para notificaciones');
      }
    } catch (error) {
      console.error('Error verificando service worker:', error);
    }
  };

  const cargarConfiguracion = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/rachas/estadisticas/${cuentaId}`);
      const data = await response.json();
      
      if (data.success) {
        setConfiguracion({
          notificacionesActivas: data.estadisticas.notificacionesActivas,
          horaNotificacion: data.estadisticas.horaNotificacion
        });
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const solicitarPermisos = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones');
      return;
    }

    setSolicitandoPermisos(true);
    
    try {
      const permission = await Notification.requestPermission();
      setPermisosNotificacion(permission);
      
      if (permission === 'granted') {
        // Activar notificaciones automáticamente si se conceden permisos
        await configurarNotificaciones({
          notificacionesActivas: true,
          horaNotificacion: configuracion.horaNotificacion
        });
        
        // Mostrar notificación de prueba
        mostrarNotificacionPrueba();
      }
    } catch (error) {
      console.error('Error solicitando permisos:', error);
    } finally {
      setSolicitandoPermisos(false);
    }
  };

  const configurarNotificaciones = async (nuevaConfig) => {
    try {
      const response = await fetch('http://localhost:5000/api/rachas/configurar-notificaciones', {
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
      }
    } catch (error) {
      console.error('Error configurando notificaciones:', error);
    }
  };

  const mostrarNotificacionPrueba = () => {
    if (permisosNotificacion === 'granted') {
      new Notification('¡NextStep - Notificaciones Activadas! 🔥', {
        body: 'Te recordaremos mantener tu racha diaria cada día a las ' + configuracion.horaNotificacion,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'nextstep-test',
        requireInteraction: false,
        vibrate: [200, 100, 200]
      });
    }
  };

  const toggleNotificaciones = async () => {
    if (!configuracion.notificacionesActivas && permisosNotificacion !== 'granted') {
      // Si quiere activar pero no tiene permisos, solicitarlos
      await solicitarPermisos();
      return;
    }

    await configurarNotificaciones({
      notificacionesActivas: !configuracion.notificacionesActivas
    });
  };

  const cambiarHora = async (nuevaHora) => {
    await configurarNotificaciones({
      horaNotificacion: nuevaHora
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-purple-200 p-6">
        <div className="text-center text-purple-600">
          Cargando configuración de notificaciones...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-purple-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-purple-700">
            Notificaciones de Racha
          </h3>
          <p className="text-sm text-purple-600 opacity-75">
            Te recordamos mantener tu constancia diaria
          </p>
        </div>
      </div>

      {/* Estado de permisos */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-purple-700">Estado de permisos:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            permisosNotificacion === 'granted' 
              ? 'bg-green-100 text-green-700' 
              : permisosNotificacion === 'denied'
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {permisosNotificacion === 'granted' ? '✅ Concedidos' : 
             permisosNotificacion === 'denied' ? '❌ Denegados' : '⏳ Pendientes'}
          </span>
        </div>
      </div>

      {/* Configuración de notificaciones */}
      <div className="space-y-4">
        {/* Toggle notificaciones */}
        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-3">
            {configuracion.notificacionesActivas ? (
              <Bell className="w-5 h-5 text-purple-600" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <div className="font-medium text-purple-800">
                Recordatorios diarios
              </div>
              <div className="text-sm text-purple-600">
                Mantén tu racha con notificaciones automáticas
              </div>
            </div>
          </div>
          
          <button
            onClick={toggleNotificaciones}
            disabled={solicitandoPermisos}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              configuracion.notificacionesActivas ? 'bg-purple-600' : 'bg-gray-300'
            } ${solicitandoPermisos ? 'opacity-50' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                configuracion.notificacionesActivas ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Configuración de hora */}
        {configuracion.notificacionesActivas && (
          <div className="p-4 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-800">Hora de recordatorio</span>
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="time"
                value={configuracion.horaNotificacion}
                onChange={(e) => cambiarHora(e.target.value)}
                className="px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="text-sm text-purple-600">
                Te recordaremos cada día a esta hora
              </div>
            </div>
          </div>
        )}

        {/* Botón de prueba */}
        {permisosNotificacion === 'granted' && configuracion.notificacionesActivas && (
          <button
            onClick={mostrarNotificacionPrueba}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Flame className="w-4 h-4" />
            Probar notificación
          </button>
        )}

        {/* Solicitar permisos si no están concedidos */}
        {permisosNotificacion !== 'granted' && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm text-yellow-800 mb-3">
              {permisosNotificacion === 'denied' 
                ? '⚠️ Los permisos de notificación están bloqueados. Habilítalos en la configuración de tu navegador.'
                : '🔔 Para recibir recordatorios automáticos, necesitamos tu permiso para enviar notificaciones.'
              }
            </div>
            
            {permisosNotificacion === 'default' && (
              <button
                onClick={solicitarPermisos}
                disabled={solicitandoPermisos}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                <Bell className="w-4 h-4" />
                {solicitandoPermisos ? 'Solicitando...' : 'Permitir notificaciones'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PushNotifications;

import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { User, Menu, Bell, Award, Briefcase, Trophy } from 'lucide-react';
import { useNotification } from "./NotificationProvider";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleMenuClick = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleDashboardClick = () => {
    setMenuOpen(false);
    navigate("/dashboard");
  };

  const handlePerfilClick = () => {
    setMenuOpen(false);
    navigate("/perfil");
  };

  const handleInsigniasClick = () => {
    setMenuOpen(false);
    navigate("/insignias");
  };

  const handleJobsClick = () => {
    setMenuOpen(false);
    navigate("/jobs");
  };

  // NUEVA FUNCIÓN: Navegar a la página de ranking
  const handleRankingClick = () => {
    setMenuOpen(false);
    navigate("/ranking");
  };

  const handleHomeClick = () => {
    navigate("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userProfile');
    setMenuOpen(false);
    navigate("/login");
    showNotification("Sesión cerrada correctamente");
  };

  return (
    <nav className="bg-white shadow-sm p-4 sticky top-0 z-50 w-full">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Izquierda: Menú y Logo */}
        <div 
          className="flex items-center gap-4 relative"
          data-tutorial="navigation-section"
        >
          {/* Menú desplegable */}
          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
              id="menu-button"
              data-tutorial="menu-button"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            {menuOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10" id="menu-dropdown">
                <button
                  onClick={handleDashboardClick}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-2 rounded-t-lg"
                  data-tutorial="dashboard-menu"
                >
                  <span className="text-purple-600">📊</span>
                  Dashboard
                </button>
                <button
                  onClick={handleJobsClick}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-2"
                  data-tutorial="jobs-menu"
                >
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Ver Empleos
                </button>
                <button
                  onClick={handlePerfilClick}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-2"
                  data-tutorial="profile-menu"
                >
                  <User className="w-4 h-4 text-purple-600" />
                  Perfil
                </button>
                <button
                  onClick={handleInsigniasClick} 
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-2"
                  data-tutorial="badges-menu"
                >
                  <Award className="w-4 h-4 text-yellow-500" />
                  Insignias
                </button>
                {/*Ranking */}
                <button
                  onClick={handleRankingClick}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-2"
                  data-tutorial="ranking-menu"
                >
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  Ranking
                </button>
                
                {/* Separador y botón de Cerrar Sesión */}
                <div className="border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 text-red-600 transition-colors flex items-center gap-2 rounded-b-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={handleHomeClick}
            className="text-xl font-bold text-gray-800 hover:text-purple-600 transition-colors"
            data-tutorial="logo-button"
          >
            NextStep
          </button>
        </div>

        {/* Derecha: Información del usuario y Notificaciones */}
        <div className="flex items-center gap-2">
          {/* Ícono de notificación */}
          <NotificationBell />
          <div 
            className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center"
            data-tutorial="user-avatar"
          >
            <User className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>
    </nav>
  );
}

// Componente de ícono de notificación con badge y navegación
export function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead, clearNotifications } = useNotification();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    setOpen((prev) => !prev);
    markAllAsRead();
  };

  // Filtrar para ocultar la notificación de bienvenida
  const filteredNotifications = notifications.filter(
    n => n.message !== "¡Bienvenid@ a NextStep! 🎉" &&
         n.message !== "Empleo marcado como favorito" &&
         n.message !== "Empleo desmarcado como favorito" &&
         n.message !== "Sesión cerrada correctamente"
  );

  // Si la notificación tiene data.jobId, navegar al detalle de ese empleo
  // Si la notificación tiene data.type === 'insignia', navegar a /insignias
  const handleNotificationClick = (notif) => {
    if (notif.data && notif.data.jobId) {
      navigate(`/jobs?jobId=${notif.data.jobId}`);
    } else if (
      (notif.data && notif.data.type === 'insignia') ||
      (typeof notif.message === 'string' && notif.message.startsWith('🎉 ¡FELICITACIONES!'))
    ) {
      navigate('/insignias');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="relative w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notificaciones"
        data-tutorial="notifications-bell"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-purple-700">Notificaciones</h3>
            <button
              onClick={clearNotifications}
              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Eliminar todas
            </button>
          </div>
          {filteredNotifications.length === 0 ? (
            <div className="text-gray-500 text-sm">No tienes notificaciones.</div>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {filteredNotifications.slice().reverse().map((notif) => (
                <li
                  key={notif.id}
                  className={`p-3 rounded ${notif.read ? 'bg-gray-50' : 'bg-purple-100'} text-gray-800 text-sm shadow-sm cursor-pointer hover:bg-purple-200`}
                  onClick={() => handleNotificationClick(notif)}
                  title={notif.data && notif.data.jobId ? 'Ver oferta recomendada' : ''}
                >
                  {notif.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

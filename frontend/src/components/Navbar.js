import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { User, Menu, Bell } from 'lucide-react';
import { useNotification } from "./NotificationProvider";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuClick = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleDashboardClick = () => {
    setMenuOpen(false);
    navigate("/dashboard");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-sm p-4 sticky top-0 z-50 w-full">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Izquierda: Menú y Logo */}
        <div className="flex items-center gap-4 relative">
          {/* Menú desplegable */}
          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
              id="menu-button"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            {menuOpen && (
              <div className="absolute left-0 mt-2 w-40 bg-white border rounded shadow-lg z-10" id="menu-dropdown">
                <button
                  onClick={handleDashboardClick}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                >
                  Dashboard
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={handleHomeClick}
            className="text-xl font-bold text-gray-800 hover:text-purple-600 transition-colors"
          >
            NextStep
          </button>
        </div>

        {/* Derecha: Usuario y Notificaciones */}
        <div className="flex items-center gap-2">
          {/* Ícono de notificación */}
          <NotificationBell />
          <button 
            onClick={handleLoginClick}
            className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center hover:bg-purple-300 transition-colors"
          >
            <User className="w-5 h-5 text-purple-600" />
          </button>
        </div>
      </div>
    </nav>
  );
}

// Componente de ícono de notificación con badge y navegación
export function NotificationBell() {
  const navigate = useNavigate();
  const { unreadCount, markAllAsRead } = useNotification();

  const handleClick = () => {
    markAllAsRead();
    navigate("/dashboard");
  };

  return (
    <button
      onClick={handleClick}
      className="relative w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
      aria-label="Notificaciones"
    >
      <Bell className="w-5 h-5 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
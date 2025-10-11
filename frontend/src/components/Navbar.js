import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { User, Menu, Award, Briefcase } from 'lucide-react'; 

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuClick = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleDashboardClick = () => {
    setMenuOpen(false);
    navigate("/dashboard"); // Ruta del Dashboard
  };

  const handlePerfilClick = () => {
    setMenuOpen(false);
    navigate("/perfil"); // Ruta del Perfil
  };

  const handleInsigniasClick = () => {
    setMenuOpen(false);
    navigate("/insignias"); // Ruta de Insignias
  };

  // NUEVA FUNCIÓN: Navegar a la página de empleos (Jobs.js)
  const handleJobsClick = () => {
    setMenuOpen(false);
    navigate("/jobs"); // Ruta de la página Jobs.js
  };

  const handleHomeClick = () => {
    navigate("/dashboard"); // Dashboard como página principal
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userProfile');
    setMenuOpen(false);
    navigate("/login");
    alert("Sesión cerrada correctamente");
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
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10" id="menu-dropdown">
                <button
                  onClick={handleDashboardClick}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-2 rounded-t-lg"
                >
                  <span className="text-purple-600">📊</span>
                  Dashboard
                </button>
                <button
                  onClick={handleJobsClick}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Ver Empleos
                </button>
                <button
                  onClick={handlePerfilClick}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-purple-600" />
                  Perfil
                </button>
                <button
                  onClick={handleInsigniasClick} 
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-2"
                >
                  <Award className="w-4 h-4 text-yellow-500" />
                  Insignias
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
          >
            NextStep
          </button>
        </div>

        {/* Derecha: Información del usuario */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>
    </nav>
  );
}
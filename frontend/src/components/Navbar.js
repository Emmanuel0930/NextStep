import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { User, Menu } from 'lucide-react';

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

        {/* Derecha: Usuario */}
        <div className="flex items-center gap-2">
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
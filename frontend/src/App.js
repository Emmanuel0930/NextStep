import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect } from "react";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Jobs from "./pages/Jobs";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import Perfil from './pages/Perfil';
import Insignias from './pages/Insignias'; 
import ProtectedRoute from './components/ProtectedRoute';
import { useNotification } from "./components/NotificationProvider";

function App() {
  const { showNotification } = useNotification();

  // Mostrar notificaciones de bienvenida si la sesión está iniciada
  useEffect(() => {
    if (localStorage.getItem('userId') && !sessionStorage.getItem('welcomeShown')) {
      showNotification("¡Bienvenid@ a NextStep! 🎉");
      showNotification("Oferta de empleo recomendada: Auxiliar Administrativo - Postobón");
      sessionStorage.setItem('welcomeShown', 'true');
    }
  }, [showNotification]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Router>
        {localStorage.getItem('userId') && <Navbar />}
        <Routes>
          <Route path="/" element={<Navigate to={localStorage.getItem('userId') ? "/dashboard" : "/login"} replace />} />
          {/* Rutas públicas (accesibles sin login) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Rutas protegidas (requieren login) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          } />
          <Route path="/insignias" element={
            <ProtectedRoute>
              <Insignias />
            </ProtectedRoute>
          } />
          <Route path="/jobs" element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          } />
          {/* Ruta por defecto para URLs no encontradas */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
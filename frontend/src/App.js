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
import FeedbackProvider from "./components/FeedbackProvider";

function App() {
  const { showNotification } = useNotification();

  // Mostrar notificaciones de bienvenida si la sesión está iniciada
  useEffect(() => {
    async function mostrarBienvenida() {
      showNotification("¡Bienvenid@ a NextStep! 🎉");
      try {
        const jobs = await import("./services/api").then(mod => mod.getJobs());
        if (Array.isArray(jobs) && jobs.length > 0) {
          const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
          showNotification(
            "Oferta de empleo recomendada: " + (randomJob.nombre || randomJob.titulo || "Empleo disponible"),
            3000,
            { jobId: randomJob.id }
          );
        }
      } catch (err) {
        showNotification("¡Mira las ofertas de empleo disponibles!");
      }
    }
    if (localStorage.getItem('userId') && !sessionStorage.getItem('welcomeShown')) {
      mostrarBienvenida();
      sessionStorage.setItem('welcomeShown', 'true');
    }
  }, [showNotification]);

  return (
    <FeedbackProvider>
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
    </FeedbackProvider>
  );
}

export default App;
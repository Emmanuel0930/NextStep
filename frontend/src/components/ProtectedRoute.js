import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const userId = localStorage.getItem('userId');
  
  // Si no hay userId, redirigir al login
  if (!userId) {
    return <Navigate to="/login" replace />;
  }
  
  // Si está autenticado, mostrar el componente hijo
  return children;
}
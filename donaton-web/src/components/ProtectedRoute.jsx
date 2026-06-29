import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Si no hay token, lo mandamos directo al login
    return <Navigate to="/login" replace />;
  }

  // Si está logueado, lo dejamos pasar
  return children;
};

export default ProtectedRoute;
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Blog from './pages/Blog'; 
import CauseDetail from './pages/CauseDetail';
import Admin from './pages/Admin';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute'; // <-- IMPORTAMOS EL GUARDIA

function App() {
  return (
    <BrowserRouter>
      {/* La barra de navegación superior fija (Visible en todas las páginas) */}
      <Navbar /> 
      
      {/* El "Mapa" de rutas de nuestra aplicación */}
      <Routes>
        {/* ==========================================
            1. RUTAS PÚBLICAS (Acceso libre)
           ========================================== */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />}/>
        <Route path="/blog" element={<Blog />} /> {/* Transparencia es pública */}

        {/* ==========================================
            2. RUTAS PROTEGIDAS (Requieren inicio de sesión)
           ========================================== */}
           
        {/* Catálogo general de causas */}
        <Route 
          path="/causas" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        
        {/* Detalle para donar a una causa específica */}
        <Route 
          path="/causas/:id" 
          element={
            <ProtectedRoute>
              <CauseDetail />
            </ProtectedRoute>
          } 
        /> 
        
        {/* Panel de administración */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />
        
        {/* Historial del donante */}
        <Route 
          path="/perfil" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
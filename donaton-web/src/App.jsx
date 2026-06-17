import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Blog from './pages/Blog'; // <-- Importamos el Blog
import CauseDetail from './pages/CauseDetail';
import Admin from './pages/Admin';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      {/* La barra de navegación superior fija */}
      <Navbar /> 
      
      {/* El "Mapa" de rutas de nuestra aplicación */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/causas" element={<Home />} />
        <Route path="/causas/:id" element={<CauseDetail />} /> {/* Ruta para detalles de causa */}
        <Route path="/login" element={<Login />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/register" element={<Register />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
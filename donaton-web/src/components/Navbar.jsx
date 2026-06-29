import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token; 

  // Función para descifrar el rol desde el Token JWT
  const getUserRole = () => {
    if (!token) return null;
    try {
      // El JWT tiene 3 partes separadas por puntos. La segunda es el payload.
      const payloadBase64 = token.split('.')[1];
      // Decodificamos el Base64 a un objeto JSON
      const decodedJson = JSON.parse(atob(payloadBase64));
      
      // En .NET, los roles suelen guardarse en esta llave larguísima estándar, o en "role"
      return decodedJson['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedJson.role;
    } catch (error) {
      return null;
    }
  };

  const userRole = getUserRole();
  const isAdmin = userRole === 'Admin'; // Verificamos si es Administrador

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-white hover:text-blue-400 transition-colors tracking-wide">
              Donaton
            </Link>
            
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link to="/causas" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Causas
                </Link>
                <Link to="/blog" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Transparencia
                </Link>
              </div>
            </div>
          </div>

          <div>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                
                {/* LÓGICA DE ROLES: Solo mostramos el enlace si es Admin */}
                {isAdmin && (
                  <Link to="/admin" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 rounded-md">
                    Panel Admin
                  </Link>
                )}
                <Link 
                  to="/perfil" 
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-gray-600 shadow-sm"
                >
                  Mi Perfil
                </Link>
                
                <span className="text-green-400 text-sm hidden sm:flex items-center">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Conectado
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-700 hover:bg-red-600 border border-gray-600 hover:border-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-md"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
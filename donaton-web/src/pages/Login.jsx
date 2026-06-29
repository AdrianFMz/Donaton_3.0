import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Hacemos la petición a tu API en .NET
      const response = await api.post('/Auth/login', {
        email: email,
        password: password
      });

      // Si es exitoso, guardamos el "Gafete" (Token) en el almacenamiento del navegador
      localStorage.setItem('token', response.data.token);
      
      // --- NUEVO: Guardamos el ID del usuario (y el correo/nombre si los devuelve la API) ---
      // Verificamos cómo se llama la variable que manda tu backend (userId o id)
      if (response.data.userId) {
        localStorage.setItem('userId', response.data.userId);
      } else if (response.data.id) {
        localStorage.setItem('userId', response.data.id);
      }

      // Opcional: Si tu API devuelve el nombre o correo, también los guardamos para usarlos en Profile.jsx
      if (response.data.email) {
        localStorage.setItem('userEmail', response.data.email);
      }

      localStorage.setItem('userName', response.data.name);
      // -------------------------------------------------------------------------------------

      // Redirigimos al usuario al panel o inicio (por ahora, al Home)
      navigate('/causas');
    } catch (err) {
      // Capturamos el error si las credenciales son incorrectas
      if (err.response && err.response.data) {
        // En caso de que el backend envíe un error en formato texto
        setError(typeof err.response.data === 'string' ? err.response.data : 'Credenciales incorrectas');
      } else {
        setError('Error al conectar con el servidor.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          Iniciar Sesión
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md"
          >
            Entrar
          </button>
          <p className="text-center text-gray-400 mt-6 text-sm">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
            Regístrate aquí
          </Link>
        </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
// Importamos los componentes de la gráfica
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Home = () => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessedPayment = useRef(false);

  // --- FIX DEFINITIVO PARA LAS IMÁGENES ---
  // Toma la URL base directo de tu archivo api.js para no fallar
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    
    // Obtenemos la URL de tu API (ej. https://tu-api.onrender.com/api) y le quitamos el "/api" final si lo tiene
    const baseUrl = (api.defaults.baseURL || '').replace(/\/api$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${baseUrl}${cleanPath}`;
  };

  const fetchCauses = async () => {
    try {
      const response = await api.get('/Causes');
      setCauses(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar las causas desde el servidor.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCauses();
  }, []);

  useEffect(() => {
    const processPayment = async () => {
      const queryParams = new URLSearchParams(location.search);
      const status = queryParams.get('status');
      const payerId = queryParams.get('PayerID');
      const causeId = queryParams.get('causeId');
      const amount = queryParams.get('amount');

      if ((status === 'approved' || payerId) && causeId && amount && !hasProcessedPayment.current) {
        hasProcessedPayment.current = true;
        try {
          navigate('/causas', { replace: true });

          const causeResponse = await api.get(`/Causes/${causeId}`);
          const currentCause = causeResponse.data;
          const updatedAmount = (currentCause.currentAmount || 0) + parseFloat(amount);

          await api.put(`/Causes/${causeId}`, {
            ...currentCause,
            currentAmount: updatedAmount
          });

          const loggedInUserId = localStorage.getItem('userId');
          if (loggedInUserId) {
            const method = payerId ? 'PayPal' : 'Mercado Pago';
            await api.post('/Donations', {
              userId: parseInt(loggedInUserId), 
              causeId: parseInt(causeId),
              amount: parseFloat(amount),
              donationDate: new Date().toISOString(),
              paymentMethod: method,
              status: 'Completed'
            });
          }

          await fetchCauses();

          setToastMessage('¡Gracias! Tu donativo ha sido procesado exitosamente.');
          setTimeout(() => setToastMessage(''), 4000);
          
        } catch (error) {
          console.error("Error al registrar el pago:", error);
        }
      }
    };

    processPayment();
  }, [location.search, navigate]);

  // --- DATOS PARA EL DASHBOARD GRÁFICO ---
  const totalRaised = causes.reduce((sum, cause) => sum + (cause.currentAmount || 0), 0);
  
  // Preparamos los datos para que la gráfica los entienda
  const chartData = causes.map(cause => ({
    name: cause.title.length > 15 ? cause.title.substring(0, 15) + '...' : cause.title,
    Recaudado: cause.currentAmount || 0,
    Meta: cause.goalAmount || 0
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-500">
        <div className="bg-red-500/10 border border-red-500 p-6 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-gray-800 border-l-4 border-blue-500 text-white px-6 py-4 rounded shadow-2xl z-50 animate-bounce flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* ==========================================
            DASHBOARD GRÁFICO
            ========================================== */}
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 md:p-8 mb-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-700 pb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-white">Impacto Global</h1>
                <p className="text-gray-400 mt-1">Comparativa de recaudación por causa activa</p>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <span className="block text-sm text-gray-400 uppercase tracking-wide">Total Histórico</span>
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                  ${totalRaised.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            
            {/* Contenedor de la gráfica interactiva */}
            <div className="w-full h-80 md:h-96">
              {causes.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                    <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      cursor={{ fill: '#374151', opacity: 0.4 }}
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                      itemStyle={{ color: '#E5E7EB' }}
                      formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    {/* Barra de lo que se ha recaudado */}
                    <Bar dataKey="Recaudado" fill="#34D399" radius={[4, 4, 0, 0]} />
                    {/* Barra de lo que falta para la meta */}
                    <Bar dataKey="Meta" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No hay datos suficientes para graficar.
                </div>
              )}
            </div>
        </div>
        {/* ========================================== */}

        <h2 className="text-2xl font-bold text-white mb-8 border-b border-gray-700 pb-4">
          Causas Disponibles para Apoyar
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {causes.map((cause) => {
            const progress = cause.goalAmount > 0 
              ? Math.min((cause.currentAmount / cause.goalAmount) * 100, 100) 
              : 0;

            // Invocamos nuestra función blindada para la URL
            const finalImageUrl = getImageUrl(cause.imageUrl);

            return (
              <div key={cause.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-blue-500 transition-colors duration-300 flex flex-col">
                <div className="h-48 w-full bg-gray-700 relative overflow-hidden group">
                  {finalImageUrl ? (
                    <img 
                      src={finalImageUrl} 
                      alt={cause.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = 'https://via.placeholder.com/400x200?text=Imagen+No+Encontrada'; // Fallback por si Render ya borró la imagen
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <span className="text-sm">Sin imagen</span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-white mb-2">{cause.title}</h3>
                  <p className="text-gray-400 mb-6 line-clamp-3 flex-grow">{cause.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex justify-between text-sm font-medium text-gray-300 mb-2">
                      <span>Recaudado: ${cause.currentAmount.toLocaleString()}</span>
                      <span>Meta: ${cause.goalAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-400 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/causas/${cause.id}`}
                    className="w-full block text-center bg-gray-700 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md mt-auto border border-gray-600 hover:border-transparent"
                  >
                    Conocer Más y Apoyar
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
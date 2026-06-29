import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Nuevo estado para la notificación elegante (Toast)
  const [toastMessage, setToastMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessedPayment = useRef(false);

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

          // Leemos el ID del usuario real desde el navegador
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

          // Activamos la notificación elegante en lugar del alert()
          setToastMessage('¡Gracias! Tu donativo ha sido procesado exitosamente.');
          setTimeout(() => {
            setToastMessage('');
          }, 4000); // Desaparece después de 4 segundos
          
        } catch (error) {
          console.error("Error al registrar el pago en la base de datos:", error);
        }
      }
    };

    processPayment();
  }, [location.search, navigate]);

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
        <div className="bg-red-500/10 border border-red-500 p-6 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* NOTIFICACIÓN FLOTANTE (TOAST) */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-gray-800 border-l-4 border-blue-500 text-white px-6 py-4 rounded shadow-2xl z-50 animate-bounce flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-white mb-12">
          Causas Activas
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {causes.map((cause) => {
            const progress = cause.goalAmount > 0 
              ? Math.min((cause.currentAmount / cause.goalAmount) * 100, 100) 
              : 0;

            return (
              <div 
                key={cause.id} 
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-blue-500 transition-colors duration-300 flex flex-col"
              >
                <div className="h-48 w-full bg-gray-700 relative overflow-hidden group">
                  {cause.imageUrl ? (
                    <img 
                      src={cause.imageUrl} 
                      alt={cause.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <span className="text-sm">Sin imagen</span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-white mb-2">{cause.title}</h3>
                  <p className="text-gray-400 mb-6 line-clamp-3 flex-grow">{cause.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex justify-between text-sm font-medium text-gray-300 mb-2">
                      <span>Recaudado: ${cause.currentAmount}</span>
                      <span>Meta: ${cause.goalAmount}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
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
        
        {causes.length === 0 && (
          <p className="text-center text-gray-400 mt-10 text-lg">
            No hay causas activas en este momento.
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const CauseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cause, setCause] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para el Modal de Donación
  const [showModal, setShowModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mercadopago');

  useEffect(() => {
    const fetchCauseDetail = async () => {
      try {
        const response = await api.get(`/Causes/${id}`);
        setCause(response.data);
        setLoading(false);
      } catch (err) {
        setError('No se pudo cargar la información de esta causa.');
        setLoading(false);
      }
    };

    fetchCauseDetail();
  }, [id]);

  // Función que genera la orden de pago real en Mercado Pago
const handleDonate = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const amountToAdd = parseFloat(donationAmount);

      // CAMBIO: Elegimos el endpoint basado en el radio button seleccionado
      const endpoint = paymentMethod === 'mercadopago' 
        ? '/Payments/mercadopago' 
        : '/Payments/paypal';

      const response = await api.post(endpoint, {
        causeId: parseInt(id),
        amount: amountToAdd
      });

      const { initPoint } = response.data;

      if (initPoint) {
        window.location.href = initPoint;
      } else {
        throw new Error('No se recibió el enlace de pago.');
      }

    } catch (err) {
      alert('Hubo un error al conectar con la pasarela de pago. Intenta nuevamente.');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error || !cause) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-center px-4">
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-6 rounded-lg shadow-lg mb-6">
          {error}
        </div>
        <button onClick={() => navigate('/causas')} className="text-blue-400 hover:text-blue-300 transition-colors">
          &larr; Volver a las causas
        </button>
      </div>
    );
  }

  // Cálculos de progreso con tus variables correctas
  const goal = cause.goalAmount ?? 0;
  const current = cause.currentAmount ?? 0;
  const progress = goal > 0 
    ? Math.min((current / goal) * 100, 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-sans relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Botón de retroceso */}
        <button 
          onClick={() => navigate('/causas')}
          className="text-gray-400 hover:text-white mb-8 flex items-center transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Volver al listado
        </button>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
          {cause.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="w-full h-96 md:h-[500px] bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-xl relative">
              {cause.imageUrl ? (
                <img src={cause.imageUrl} alt={cause.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <span className="text-lg">Imagen representativa de la causa</span>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                Causa Verificada
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-4">
                La Historia y el Objetivo
              </h2>
              <div className="prose prose-invert max-w-none text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                {cause.description}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl sticky top-24">
              
              <div className="mb-6">
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-extrabold text-white">${current}</span>
                  <span className="text-gray-400 mb-1">recaudados</span>
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  Meta total: <span className="text-white font-semibold">${goal}</span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <div className="text-right text-sm font-bold text-blue-400">
                  {progress.toFixed(1)}% completado
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-300 mb-8 p-4 bg-gray-900 rounded-lg border border-gray-700">
                <svg className="w-6 h-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.956 11.956 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                <p>Tu donativo está protegido y va directamente a la cuenta verificada del proyecto.</p>
              </div>

              {/* Botón que abre el Modal en lugar de donar directamente */}
              <button 
                onClick={() => setShowModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 transform hover:-translate-y-1 text-lg flex justify-center items-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                Hacer mi Donativo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAY Y MODAL DE PAGO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl overflow-hidden transform transition-all">
            
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Aportar a esta causa</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleDonate} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cantidad a donar (MXN)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 text-lg">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-lg bg-gray-900 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                    placeholder="500"
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-3 font-medium">Método de pago</p>
                <div className="flex gap-3">
                  {/* Radio Mercado Pago */}
                  <label className="flex-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="mercadopago"
                      checked={paymentMethod === 'mercadopago'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="peer sr-only" 
                    />
                    <div className="text-center p-3 rounded-lg border border-gray-600 peer-checked:border-blue-500 peer-checked:bg-blue-500/10 text-gray-300 transition-all font-semibold">
                      Mercado Pago
                    </div>
                  </label>
                  
                  {/* Radio PayPal */}
                  <label className="flex-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="peer sr-only" 
                    />
                    <div className="text-center p-3 rounded-lg border border-gray-600 peer-checked:border-blue-500 peer-checked:bg-blue-500/10 text-gray-300 transition-all font-semibold">
                      PayPal
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
              >
                {isProcessing ? 'Procesando pago...' : `Confirmar donativo de $${donationAmount || '0'}`}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CauseDetail;
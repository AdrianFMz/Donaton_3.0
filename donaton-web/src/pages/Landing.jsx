import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      
      {/* Hero Section (Sección Principal) */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-800 border-b border-gray-700 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Conecta tu ayuda con <span className="text-blue-500">quien más lo necesita</span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Donaton es la plataforma de fondeo colectivo diseñada para apoyar causas sociales reales. Transparencia, trazabilidad y un impacto que cambia vidas.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/causas" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg shadow-lg shadow-blue-500/30"
            >
              Ver Causas
            </Link>
            <Link 
              to="/blog" 
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-colors border border-gray-600 text-lg"
            >
              Transparencia
            </Link>
          </div>
        </div>
      </section>

      {/* Sección: ¿Cómo funciona? */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16 text-white">¿Por qué confiar en Donaton?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center hover:border-blue-500 transition-colors">
            <div className="w-14 h-14 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
               ❤️
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Causas Verificadas</h3>
            <p className="text-gray-400">
              Cada proyecto y necesidad listada en nuestra plataforma es filtrada y validada para asegurar que tu ayuda llegue al destino correcto.
            </p>
          </div>

          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center hover:border-blue-500 transition-colors">
            <div className="w-14 h-14 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
               🔒
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Donaciones Seguras</h3>
            <p className="text-gray-400">
              Integración total con pasarelas de pago de clase mundial. Tus datos financieros están encriptados y protegidos.
            </p>
          </div>

          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center hover:border-blue-500 transition-colors">
            <div className="w-14 h-14 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
               📖
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Transparencia Total</h3>
            <p className="text-gray-400">
              A través de nuestro blog de evidencias, podrás ver fotografías, recibos y testimonios de las despensas y apoyos entregados.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Blog = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/TransparencyReports'); 
        setReports(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar transparencia:", err);
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white text-center mb-4">Rendición de Cuentas</h1>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
          En Donaton Plus creemos que la confianza se construye con hechos. Aquí puedes auditar el destino exacto de cada aportación recibida.
        </p>
        
        <div className="space-y-6">
          {reports.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No hay reportes de transparencia registrados aún.</p>
          ) : (
            reports.map(report => (
              <div key={report.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl flex flex-col md:flex-row gap-6 items-start hover:border-gray-600 transition-all">
                
                <img 
                  src={`https://localhost:7291${report.evidenceImageUrl || report.EvidenceImageUrl}`} 
                  alt="Evidencia principal" 
                  className="w-full md:w-56 h-44 object-cover rounded-xl border border-gray-700 shadow-inner bg-gray-900" 
                />
                
                <div className="flex-grow flex flex-col h-full min-h-[176px] justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-2xl font-bold text-white tracking-tight">{report.title || report.Title}</h3>
                      <span className="text-xs font-semibold bg-gray-700 text-gray-300 px-3 py-1 rounded-full whitespace-nowrap">
                        {new Date(report.reportDate || report.ReportDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-gray-400 mt-2 line-clamp-2 text-sm leading-relaxed">
                      {report.description || report.Description}
                    </p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-green-400 font-extrabold text-xl">
                      Inversión: <span className="text-2xl">${(report.amountSpent || report.AmountSpent)?.toLocaleString('es-MX')}</span> MXN
                    </div>
                    
                    {/* BOTÓN REQUERIDO: REDIRIGE AL DETALLE DINÁMICO */}
                    <Link 
                      to={`/blog/${report.id}`}
                      className="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 border border-gray-600 hover:border-transparent text-sm shadow-md"
                    >
                      Ver más detalles
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </Link>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog;
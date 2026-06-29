import { useState, useEffect } from 'react';
import api from '../services/api';

const Blog = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // CORREGIDO: Sin el primer '/api' porque ya está en tu configuración de base
        const response = await api.get('/TransparencyReports'); 
        
        console.log("Datos recibidos:", response.data);
        setReports(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar transparencia:", err);
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="text-white text-center py-20">Cargando reportes...</div>;

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <h1 className="text-4xl font-bold text-white text-center mb-12">Rendición de Cuentas</h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        {reports.length === 0 ? (
           <p className="text-center text-gray-400">No hay reportes de transparencia aún.</p>
        ) : (
          reports.map(report => (
            <div key={report.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col md:flex-row gap-6">
              {/* Concatenamos la URL base de tu API con la ruta de la base de datos */}
              <img src={`https://localhost:7291${report.evidenceImageUrl || report.EvidenceImageUrl}`} 
                   alt="Evidencia" 
                   className="w-full md:w-48 h-48 object-cover rounded-lg" />
              
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-white">{report.title || report.Title}</h3>
                <p className="text-gray-400 mt-2">{report.description || report.Description}</p>
                <div className="mt-4 text-green-400 font-bold text-lg">
                  Inversión: ${ (report.amountSpent || report.AmountSpent)?.toLocaleString() }
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Blog;
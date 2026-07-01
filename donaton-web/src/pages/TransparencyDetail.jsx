import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const TransparencyDetail = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetailedReport = async () => {
      try {
        const response = await api.get(`/TransparencyReports/${id}`);
        setReport(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar el detalle del reporte:", error);
        setLoading(false);
      }
    };
    fetchDetailedReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
        <p>El reporte de transparencia solicitado no existe o fue removido.</p>
      </div>
    );
  }

  // Desestructuramos soportando mayúsculas y minúsculas de la API
  const title = report.title || report.Title;
  const description = report.description || report.Description;
  const amountSpent = report.amountSpent || report.AmountSpent;
  const evidenceImg = report.evidenceImageUrl || report.EvidenceImageUrl;
  const actions = report.actions || report.Actions;
  const beneficiaries = report.beneficiaries || report.Beneficiaries;
  const extraImages = report.extraImages || report.ExtraImages || [];
  const dateStr = new Date(report.reportDate || report.ReportDate).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Botón de regreso */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 font-medium mb-6 transition-colors text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Regresar a Rendición de Cuentas
        </Link>

        {/* Encabezado Principal */}
        <div className="border-b border-gray-800 pb-6 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Reporte de Impacto Informativo</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 leading-tight">{title}</h1>
          <p className="text-sm text-gray-500 mt-2">Publicado formalmente el {dateStr}</p>
        </div>

        {/* Sección 1: Imagen Destacada e Inversión */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="md:col-span-2">
            <img 
              src={`https://donaton-api.onrender.com${evidenceImg}`} 
              alt="Evidencia principal" 
              className="w-full h-80 object-cover rounded-2xl border border-gray-700 shadow-xl bg-gray-900 animate-fade-in"
            />
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 p-6 rounded-2xl border border-gray-700 flex flex-col justify-center items-center text-center shadow-lg">
            <svg className="w-10 h-10 text-green-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            <p className="text-xs uppercase font-bold tracking-wider text-gray-400">Fondos Fiscalizados</p>
            <p className="text-4xl font-black text-green-400 mt-2">${amountSpent?.toLocaleString('es-MX')}</p>
            <p className="text-xs text-gray-500 mt-1">Moneda Nacional MXN</p>
          </div>
        </div>

        {/* Sección 2: Desglose Informativo Profundo */}
        <div className="space-y-8 bg-gray-800/50 rounded-2xl p-6 sm:p-8 border border-gray-800 mb-10">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span> Resumen Operativo
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <span className="w-1.5 h-4 bg-yellow-500 rounded-full"></span> Acciones Realizadas
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {actions || "No se han especificado los detalles de las acciones aún por el administrador."}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span> Población o Sector Beneficiado
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {beneficiaries || "Detalle de beneficiarios pendiente de documentación."}
            </p>
          </div>
        </div>

        {/* Sección 3: Galería de Fotos Secundarias */}
        <div className="border-t border-gray-800 pt-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Galería de Evidencias de Campo
          </h2>

          {extraImages.length === 0 ? (
            <p className="text-sm text-gray-500 italic bg-gray-800/20 p-4 rounded-xl border border-dashed border-gray-800 text-center">
              No se han subido imágenes secundarias para este reporte todavía.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {extraImages.map((img) => (
                <div key={img.id || img.Id} className="h-40 bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-md group relative">
                  <img 
                    src={`https://donaton-api.onrender.com${img.imageUrl || img.ImageUrl}`} 
                    alt="Evidencia de campo" 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TransparencyDetail;
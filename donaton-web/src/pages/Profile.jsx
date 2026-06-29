import { useState, useEffect } from 'react';
import api from '../services/api';
import { jsPDF } from 'jspdf'; // Importamos el generador de PDF

const Profile = () => {
  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setUser({
          name: localStorage.getItem('userName') || "Donante",
          email: localStorage.getItem('userEmail') || "correo@donaton.com"
        });

        const donationsResponse = await api.get('/Donations/my-history');
        
        const formattedDonations = donationsResponse.data.map(d => ({
          id: d.id,
          // Si el backend ya hace el Include(d => d.Cause), d.cause.title traerá el nombre real
          causeName: d.cause?.title || `Causa #${d.causeId}`, 
          amount: d.amount,
          date: new Date(d.donationDate).toLocaleDateString('es-MX', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          method: d.paymentMethod
        }));
        
        setDonations(formattedDonations);
        setLoading(false);

      } catch (error) {
        console.error("Error al cargar el historial filtrado:", error);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);

  // FUNCIÓN PARA GENERAR EL CERTIFICADO EN PDF
  const handleDownloadCertificate = (donation) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'cm',
      format: 'a5'
    });

    // Diseño del fondo oscuro
    doc.setFillColor(17, 24, 39); 
    doc.rect(0, 0, 21, 15, 'F');
    
    // Borde azul
    doc.setDrawColor(59, 130, 246); 
    doc.setLineWidth(0.2);
    doc.rect(0.5, 0.5, 20, 13.8, 'S');

    // Textos
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('CERTIFICADO DE AGRADECIMIENTO', 10.5, 3.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(156, 163, 175);
    doc.text('Otorgado con profunda gratitud por Donaton a:', 10.5, 5.5, { align: 'center' });

    // Nombre del donante
    doc.setFontSize(18);
    doc.setTextColor(96, 165, 250);
    doc.text(user?.name || 'Donante Distinguido', 10.5, 7, { align: 'center' });

    // Detalles del impacto
    doc.setFontSize(12);
    doc.setTextColor(209, 213, 219);
    doc.text(`Por su valiosa aportación de $${donation.amount} MXN`, 10.5, 9, { align: 'center' });
    doc.text(`Destinada a: ${donation.causeName}`, 10.5, 10, { align: 'center' });
    
    // Metadatos
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Fecha de registro: ${donation.date}`, 10.5, 12, { align: 'center' });
    doc.text(`ID de Transacción: #${donation.id}`, 10.5, 12.7, { align: 'center' });

    // Forzar la descarga
    doc.save(`Certificado_Donaton_${donation.id}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Encabezado del Perfil */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl mb-8 flex flex-col md:flex-row items-center md:justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg shadow-blue-500/30">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">{user?.name}</h1>
              <p className="text-gray-400">{user?.email}</p>
              <span className="inline-block mt-2 text-xs font-semibold bg-gray-700 text-gray-300 px-3 py-1 rounded-full">
                Donante activo
              </span>
            </div>
          </div>
          
          {/* Tarjeta de Impacto Total */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 min-w-[200px] text-center">
            <p className="text-sm text-gray-400 mb-1">Impacto Total</p>
            <p className="text-4xl font-extrabold text-green-400">${totalDonated.toLocaleString('es-MX')}</p>
            <p className="text-xs text-gray-500 mt-2">{donations.length} aportaciones realizadas</p>
          </div>
        </div>

        {/* Historial de Donaciones */}
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Tu Historial de Aportaciones
        </h2>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
          {donations.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <p className="text-lg">Aún no tienes donativos registrados en esta cuenta.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-900/50 border-b border-gray-700 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="p-4 pl-6">Fecha</th>
                    <th className="p-4">Causa Apoyada</th>
                    <th className="p-4">Método</th>
                    <th className="p-4">Monto</th>
                    <th className="p-4 text-right pr-6">Reconocimiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {donations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-700/25 transition-colors">
                      <td className="p-4 pl-6 text-gray-300">{donation.date}</td>
                      <td className="p-4 font-medium text-white">{donation.causeName}</td>
                      <td className="p-4 text-gray-400">
                        <span className="bg-gray-700 px-2 py-1 rounded text-xs">{donation.method}</span>
                      </td>
                      <td className="p-4 font-bold text-green-400">${donation.amount}</td>
                      
                      {/* BOTÓN DEL CERTIFICADO */}
                      <td className="p-4 text-right pr-6">
                        <button 
                          onClick={() => handleDownloadCertificate(donation)}
                          className="text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center justify-end gap-2 w-full transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                          Descargar
                        </button>
                      </td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
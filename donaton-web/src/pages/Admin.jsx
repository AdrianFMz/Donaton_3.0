import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Admin = () => {
  const navigate = useNavigate();
  
  // Estados para el formulario de Causas
  const [causeTitle, setCauseTitle] = useState('');
  const [causeDescription, setCauseDescription] = useState('');
  const [causeGoal, setCauseGoal] = useState('');
  const [causeImageUrl, setCauseImageUrl] = useState('');
  const [causeStatus, setCauseStatus] = useState({ type: '', text: '' });

  // Estados para el formulario del Blog
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImageUrl, setBlogImageUrl] = useState('');
  const [blogStatus, setBlogStatus] = useState({ type: '', text: '' });

// Guardián de Ruta (Route Guard)
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // 1. Si no hay token, lo mandamos al login
    if (!token) {
      navigate('/login');
      return;
    }

    // 2. Si hay token, lo abrimos para ver el rol
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = JSON.parse(atob(payloadBase64));
      
      const userRole = decodedJson['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedJson.role;
      
      // 3. Si el rol no es explícitamente 'Admin', lo expulsamos a la vista pública
      if (userRole !== 'Admin') {
        navigate('/causas'); 
      }
    } catch (error) {
      // Si el token está corrupto o alterado, destruimos la sesión por seguridad
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  const handleCauseSubmit = async (e) => {
    e.preventDefault();
    setCauseStatus({ type: '', text: '' });

    try {
      await api.post('/Causes', {
        title: causeTitle,
        description: causeDescription,
        goalAmount: parseFloat(causeGoal),
        currentAmount: 0,
        imageUrl: causeImageUrl
      });

      setCauseStatus({ type: 'success', text: '¡Causa publicada exitosamente!' });
      setCauseTitle('');
      setCauseDescription('');
      setCauseGoal('');
      setCauseImageUrl('');
    } catch (error) {
      setCauseStatus({ type: 'error', text: 'Error al crear la causa.' });
    }
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    setBlogStatus({ type: '', text: '' });

    try {
      await api.post('/Blog', {
        title: blogTitle,
        content: blogContent,
        imageUrl: blogImageUrl,
        publishedDate: new Date().toISOString() // Generamos la fecha actual automáticamente
      });

      setBlogStatus({ type: 'success', text: '¡Artículo publicado en el blog!' });
      setBlogTitle('');
      setBlogContent('');
      setBlogImageUrl('');
    } catch (error) {
      setBlogStatus({ type: 'error', text: 'Error al publicar en el blog.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 border-b border-gray-700 pb-4">
          Panel de Administración
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUMNA 1: Formulario de Causas */}
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-8 h-fit">
            <h2 className="text-xl font-semibold text-blue-400 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              Registrar Nueva Causa
            </h2>

            {causeStatus.text && (
              <div className={`p-4 rounded-lg mb-6 text-sm font-medium border ${causeStatus.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
                {causeStatus.text}
              </div>
            )}

            <form onSubmit={handleCauseSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Título de la Causa</label>
                <input type="text" value={causeTitle} onChange={(e) => setCauseTitle(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción Completa</label>
                <textarea value={causeDescription} onChange={(e) => setCauseDescription(e.target.value)} rows="3" className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" required></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Meta ($)</label>
                  <input type="number" min="1" step="0.01" value={causeGoal} onChange={(e) => setCauseGoal(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">URL Imagen</label>
                  <input type="url" value={causeImageUrl} onChange={(e) => setCauseImageUrl(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md mt-4">
                Publicar Causa
              </button>
            </form>
          </div>

          {/* COLUMNA 2: Formulario del Blog */}
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-8 h-fit">
            <h2 className="text-xl font-semibold text-purple-400 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
              Publicar en Transparencia
            </h2>

            {blogStatus.text && (
              <div className={`p-4 rounded-lg mb-6 text-sm font-medium border ${blogStatus.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
                {blogStatus.text}
              </div>
            )}

            <form onSubmit={handleBlogSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Título del Artículo / Evidencia</label>
                <input type="text" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ej. Entrega de 50 despensas" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contenido</label>
                <textarea value={blogContent} onChange={(e) => setBlogContent(e.target.value)} rows="3" className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" placeholder="Redacta los detalles de la entrega..." required></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL Imagen de Evidencia (Opcional)</label>
                <input type="url" value={blogImageUrl} onChange={(e) => setBlogImageUrl(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="https://ejemplo.com/evidencia.jpg" />
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md mt-4">
                Publicar Artículo
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Admin;
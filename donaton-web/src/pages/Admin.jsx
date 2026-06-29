import { useState, useEffect } from 'react';
import api from '../services/api';

const Admin = () => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Estados para crear Nueva Causa
  const [causeTitle, setCauseTitle] = useState('');
  const [causeDesc, setCauseDesc] = useState('');
  const [causeGoal, setCauseGoal] = useState('');
  const [causeFile, setCauseFile] = useState(null);

  // Estados para crear Reporte de Transparencia
  const [transCauseId, setTransCauseId] = useState('');
  const [transTitle, setTransTitle] = useState('');
  const [transDesc, setTransDesc] = useState('');
  const [transAmount, setTransAmount] = useState('');
  const [transFile, setTransFile] = useState(null);

  // Cargamos las causas al iniciar para el selector de Transparencia
  useEffect(() => {
    const fetchCauses = async () => {
      try {
        const response = await api.get('/Causes');
        setCauses(response.data);
      } catch (error) {
        console.error("Error al cargar causas:", error);
      }
    };
    fetchCauses();
  }, []);

  // --- MOTOR DE SUBIDA DE ARCHIVOS ---
  const uploadFileAndGetUrl = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/Uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.url; // Retorna "/uploads/mi-foto.jpg"
  };

  // --- HANDLER: CREAR CAUSA ---
  const handleCreateCause = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let finalImageUrl = '';
      
      // PASO 1: Si hay archivo, lo subimos primero
      if (causeFile) {
        finalImageUrl = await uploadFileAndGetUrl(causeFile);
      }

      // PASO 2: Guardamos la causa en PostgreSQL con la URL real
      await api.post('/Causes', {
        title: causeTitle,
        description: causeDesc,
        goalAmount: parseFloat(causeGoal),
        currentAmount: 0,
        imageUrl: finalImageUrl // Inyectamos la ruta del disco duro
      });

      setMessage('¡Causa creada exitosamente con su imagen!');
      setCauseTitle(''); setCauseDesc(''); setCauseGoal(''); setCauseFile(null);
    } catch (error) {
      console.error(error);
      setMessage('Error al crear la causa.');
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER: CREAR REPORTE DE TRANSPARENCIA ---
  const handleCreateTransparency = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let finalImageUrl = '';
      
      // PASO 1: Subimos la evidencia física
      if (transFile) {
        finalImageUrl = await uploadFileAndGetUrl(transFile);
      }

      // PASO 2: Guardamos el reporte
      await api.post('/TransparencyReports', {
        causeId: parseInt(transCauseId),
        title: transTitle,
        description: transDesc,
        amountSpent: parseFloat(transAmount),
        evidenceImageUrl: finalImageUrl
      });

      setMessage('¡Reporte de transparencia registrado exitosamente!');
      setTransTitle(''); setTransDesc(''); setTransAmount(''); setTransFile(null);
      
    } catch (error) {
      console.error(error);
      setMessage('Error al registrar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        <h1 className="text-4xl font-extrabold text-white text-center">Panel de Control General</h1>
        
        {message && (
          <div className="bg-blue-900/50 border border-blue-500 text-blue-200 px-6 py-4 rounded-lg text-center font-medium">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* --- FORMULARIO: NUEVA CAUSA --- */}
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">Crear Nueva Causa</h2>
            <form onSubmit={handleCreateCause} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Título de la Causa</label>
                <input type="text" required value={causeTitle} onChange={e => setCauseTitle(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
                <textarea required rows="3" value={causeDesc} onChange={e => setCauseDesc(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Meta a recaudar ($)</label>
                <input type="number" required min="1" value={causeGoal} onChange={e => setCauseGoal(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" />
              </div>
              
              {/* CAMPO DE ARCHIVO */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Foto Portada (Archivo Local)</label>
                <input type="file" accept="image/*" required onChange={e => setCauseFile(e.target.files[0])}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors cursor-pointer" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
                {loading ? 'Procesando...' : 'Publicar Causa'}
              </button>
            </form>
          </div>

          {/* --- FORMULARIO: REPORTE DE TRANSPARENCIA --- */}
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">Registrar Transparencia</h2>
            <form onSubmit={handleCreateTransparency} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Seleccionar Causa</label>
                <select required value={transCauseId} onChange={e => setTransCauseId(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Elige la causa --</option>
                  {causes.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Título del Gasto</label>
                <input type="text" required placeholder="Ej: Compra de 500 árboles" value={transTitle} onChange={e => setTransTitle(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Monto Invertido ($)</label>
                <input type="number" required min="1" value={transAmount} onChange={e => setTransAmount(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Descripción y Detalles</label>
                <textarea required rows="2" value={transDesc} onChange={e => setTransDesc(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              
              {/* CAMPO DE EVIDENCIA */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Evidencia Fotográfica (Recibo/Foto)</label>
                <input type="file" accept="image/*" required onChange={e => setTransFile(e.target.files[0])}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 transition-colors cursor-pointer" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">
                {loading ? 'Procesando...' : 'Registrar Evidencia'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Admin;
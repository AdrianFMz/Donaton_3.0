import { useState, useEffect } from 'react';
import api from '../services/api';

const Admin = () => {
  const [causes, setCauses] = useState([]);
  const [reports, setReports] = useState([]); // Nuevo estado para listar reportes
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Estados: Nueva Causa
  const [causeTitle, setCauseTitle] = useState('');
  const [causeDesc, setCauseDesc] = useState('');
  const [causeGoal, setCauseGoal] = useState('');
  const [causeFile, setCauseFile] = useState(null);

  // Estados: Reporte Básico de Transparencia
  const [transCauseId, setTransCauseId] = useState('');
  const [transTitle, setTransTitle] = useState('');
  const [transDesc, setTransDesc] = useState('');
  const [transAmount, setTransAmount] = useState('');
  const [transFile, setTransFile] = useState(null);

  // Estados: NUEVA SECCIÓN DE DETALLES PROFUNDOS
  const [selectedReportId, setSelectedReportId] = useState('');
  const [deepActions, setDeepActions] = useState('');
  const [deepBeneficiaries, setDeepBeneficiaries] = useState('');
  const [galleryFile, setGalleryFile] = useState(null);

  // Función para sincronizar selectores
  const loadInitialData = async () => {
    try {
      const causesRes = await api.get('/Causes');
      setCauses(causesRes.data);
      const reportsRes = await api.get('/TransparencyReports');
      setReports(reportsRes.data);
    } catch (error) {
      console.error("Error cargando catálogos de admin:", error);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // MOTOR DE SUBIDA FÍSICA
  const uploadFileAndGetUrl = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/Uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.url;
  };

  // HANDLER: CREAR CAUSA
  const handleCreateCause = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      let finalImageUrl = '';
      if (causeFile) finalImageUrl = await uploadFileAndGetUrl(causeFile);

      await api.post('/Causes', {
        title: causeTitle,
        description: causeDesc,
        goalAmount: parseFloat(causeGoal),
        currentAmount: 0,
        imageUrl: finalImageUrl
      });

      setMessage('¡Causa creada exitosamente con su archivo de imagen!');
      setCauseTitle(''); setCauseDesc(''); setCauseGoal(''); setCauseFile(null);
      loadInitialData();
    } catch (error) {
      setMessage('Error al inyectar causa.');
    } finally { setLoading(false); }
  };

  // HANDLER: CREAR REPORTE BÁSICO
  const handleCreateTransparency = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      let finalImageUrl = '';
      if (transFile) finalImageUrl = await uploadFileAndGetUrl(transFile);

      await api.post('/TransparencyReports', {
        causeId: parseInt(transCauseId),
        title: transTitle,
        description: transDesc,
        amountSpent: parseFloat(transAmount),
        evidenceImageUrl: finalImageUrl
      });

      setMessage('¡Reporte base guardado con éxito!');
      setTransTitle(''); setTransDesc(''); setTransAmount(''); setTransFile(null);
      loadInitialData();
    } catch (error) {
      setMessage('Error al registrar reporte base.');
    } finally { setLoading(false); }
  };

// HANDLER NUEVO: ACTUALIZAR TEXTOS PROFUNDOS (PUT)
  const handleSaveTexts = async (e) => {
    e.preventDefault();
    if (!selectedReportId) return alert("Selecciona un reporte primero");

    // --- NUEVO CANDADO DE VALIDACIÓN (QA) ---
    // trim() elimina los espacios en blanco al inicio y al final.
    if (!deepActions.trim() || !deepBeneficiaries.trim()) {
      setMessage(' Por favor, llena los campos de Acciones y Población Beneficiada con texto válido.');
      return; // Detenemos la ejecución aquí, no llega al servidor
    }

    setLoading(true); setMessage('');
    try {
      await api.put(`/TransparencyReports/${selectedReportId}/details`, {
        actions: deepActions.trim(), // Enviamos el texto limpio de espacios extra
        beneficiaries: deepBeneficiaries.trim()
      });
      setMessage('¡Textos informativos guardados en el reporte!');
    } catch (error) {
      setMessage('Error al guardar textos de detalle.');
    } finally { setLoading(false); }
  };

  // HANDLER NUEVO: SUBIR FOTO SECUNDARIA A LA GALERÍA (POST)
  const handleAddImageToGallery = async (e) => {
    e.preventDefault();
    if (!selectedReportId || !galleryFile) return alert("Selecciona el reporte y el archivo");
    setLoading(true); setMessage('');
    try {
      // 1. Subida física
      const serverPath = await uploadFileAndGetUrl(galleryFile);
      // 2. Vinculación relacional
      await api.post(`/TransparencyReports/${selectedReportId}/images`, {
        imageUrl: serverPath
      });
      setMessage('¡Foto agregada con éxito a la galería de evidencias!');
      setGalleryFile(null);
      // Limpiar input file visualmente
      document.getElementById('galleryInput').value = '';
    } catch (error) {
      setMessage('Error al subir foto de galería.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        <h1 className="text-4xl font-black text-white text-center tracking-tight">Panel de Control Donaton Plus</h1>
        
        {message && (
          <div className="bg-blue-950/60 border border-blue-500/50 text-blue-300 px-6 py-4 rounded-xl text-center font-medium shadow-lg max-w-2xl mx-auto">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA 1: NUEVA CAUSA */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">1. Crear Causa</h2>
              <form onSubmit={handleCreateCause} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Título</label>
                  <input type="text" required value={causeTitle} onChange={e => setCauseTitle(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Descripción</label>
                  <textarea required rows="3" value={causeDesc} onChange={e => setCauseDesc(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 text-sm"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Meta monetaria ($)</label>
                  <input type="number" required min="1" value={causeGoal} onChange={e => setCauseGoal(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Foto Portada</label>
                  <input type="file" accept="image/*" required onChange={e => setCauseFile(e.target.files[0])} className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors cursor-pointer" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors text-sm shadow-md">
                  {loading ? 'Procesando...' : 'Publicar Causa'}
                </button>
              </form>
            </div>
          </div>

          {/* COLUMNA 2: REPORTE BASE DE TRANSPARENCIA */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">2. Instanciar Gasto</h2>
              <form onSubmit={handleCreateTransparency} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Vincular a Causa</label>
                  <select required value={transCauseId} onChange={e => setTransCauseId(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="">-- Elige la causa --</option>
                    {causes.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Título del Reporte</label>
                  <input type="text" required value={transTitle} onChange={e => setTransTitle(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Monto gastado ($)</label>
                  <input type="number" required min="1" value={transAmount} onChange={e => setTransAmount(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Resumen Inicial</label>
                  <textarea required rows="2" value={transDesc} onChange={e => setTransDesc(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 text-sm"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Comprobante / Factura</label>
                  <input type="file" accept="image/*" required onChange={e => setTransFile(e.target.files[0])} className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-green-600 file:text-white hover:file:bg-green-700 transition-colors cursor-pointer" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg transition-colors text-sm shadow-md">
                  {loading ? 'Procesando...' : 'Registrar Gasto'}
                </button>
              </form>
            </div>
          </div>

          {/* COLUMNA 3: COMPLETAR DETALLES Y GALERÍA (NUEVA) */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">3. Enriquecer Reporte</h2>
              
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-400 mb-1">Seleccionar Gasto Existente</label>
                <select required value={selectedReportId} onChange={e => {
                  setSelectedReportId(e.target.value);
                  const found = reports.find(r => r.id == e.target.value);
                  setDeepActions(found?.actions || found?.Actions || '');
                  setDeepBeneficiaries(found?.beneficiaries || found?.Beneficiaries || '');
                }} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="">-- Elige el reporte --</option>
                  {reports.map(r => <option key={r.id} value={r.id}>{r.title || r.Title}</option>)}
                </select>
              </div>

              {/* Formulario sub-A: Textos */}
              <form onSubmit={handleSaveTexts} className="space-y-3 border-t border-gray-700/50 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Acciones (Líneas de bitácora)</label>
                  <textarea required rows="2" value={deepActions} onChange={e => setDeepActions(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Qué se hizo paso a paso..."></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Población Beneficiada</label>
                  <input required type="text" value={deepBeneficiaries} onChange={e => setDeepBeneficiaries(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ej: 45 niños de escasos recursos" />
                </div>
                <button type="submit" disabled={loading || !selectedReportId} className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 text-white font-bold py-1.5 rounded-lg transition-colors text-xs">
                  Guardar Textos Detalle
                </button>
              </form>

              {/* Formulario sub-B: Galería de fotos (Uno a uno) */}
              <form onSubmit={handleAddImageToGallery} className="space-y-3 border-t border-gray-700/50 pt-3 mt-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Añadir Foto a Galería de Evidencias</label>
                  <input id="galleryInput" type="file" accept="image/*" onChange={e => setGalleryFile(e.target.files[0])} className="w-full text-xs text-gray-400 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 transition-colors cursor-pointer" />
                </div>
                <button type="submit" disabled={loading || !selectedReportId || !galleryFile} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-bold py-1.5 rounded-lg transition-colors text-xs">
                  Subir y Anexar Imagen
                </button>
              </form>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Admin;
import { useState, useEffect } from 'react';
import api from '../services/api';

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Hacemos la petición al controlador que creamos en .NET
        const response = await api.get('/Blog');
        setArticles(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los artículos del blog.');
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  // Pantalla de error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-500">
        <div className="bg-red-500/10 border border-red-500 p-6 rounded-lg shadow-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabecera del Blog */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Transparencia y <span className="text-blue-500">Resultados</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Descubre cómo tus aportaciones se transforman en ayuda real. Aquí documentamos cada entrega y proyecto finalizado.
          </p>
        </div>
        
        {/* Cuadrícula de Artículos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {articles.map((article) => {
            // Formateamos la fecha para que sea legible (Ej: "17 de junio de 2026")
            const formattedDate = new Date(article.publishedDate).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <article 
                key={article.id} 
                className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 flex flex-col group"
              >
                {/* Contenedor de la Imagen */}
                <div className="h-56 w-full bg-gray-700 relative overflow-hidden">
                  {article.imageUrl ? (
                    <img 
                      src={article.imageUrl} 
                      alt={article.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    // Placeholder elegante si no hay imagen de evidencia
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-800">
                      <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                      </svg>
                    </div>
                  )}
                  {/* Etiqueta flotante de fecha */}
                  <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-700">
                    {formattedDate}
                  </div>
                </div>

                {/* Contenido del Artículo */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-400 mb-6 flex-grow leading-relaxed">
                    {article.content}
                  </p>
                  
                  <button className="text-blue-500 hover:text-blue-400 font-semibold text-sm flex items-center mt-auto transition-colors">
                    Leer reporte completo
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        
        {/* Estado Vacío */}
        {articles.length === 0 && (
          <div className="text-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700 border-dashed">
            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <p className="text-gray-400 text-lg">
              Aún no hay publicaciones en el blog.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;